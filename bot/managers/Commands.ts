import { Command } from "../types/Command";

import { ApplicationCommandPermissionData, Client, Collection } from "discord.js";
import fs from "fs";
import { log } from "./Logger";
import { getConfig } from "./Config";
const config = getConfig();

const commands = new Collection<string, Command>();
const aliases = new Collection<string, string>();

/**
 * Initialize the Command Manager.
 */
export async function init(): Promise<void> {
	const commandFiles = fs.readdirSync("./bot/commands");

	for (const fileName of commandFiles) {
		if (!fileName.endsWith(".ts")) continue;

		const command: Command = await import(`../commands/${fileName}`);

		log(`Loading command ${command.help.name.toLowerCase()}`);
		commands.set(command.help.name.toLowerCase(), command);
		setAliases(command.help.name.toLowerCase());
	}
}

/**
 * Destroy the Command Manager.
 */
export function destroy(): void {
	log("Destroying Command Manager, commands won't work anymore.");

	commands.forEach((command) => {
		delete require.cache[require.resolve(`../commands/${command.help.name}`)];
	});

	commands.clear();
}

/**
 * Reload a command.
 * @param commandName - The name of the command to reload.
 */
export async function reloadCommand(commandName: string): Promise<void> {
	log(`Unloading Command ${commandName}`);
	commands.delete(commandName);
	delete require.cache[require.resolve(`../commands/${commandName}`)];
	log(`Loading Command ${commandName}`);

	const command = await import(`../commands/${commandName}`);

	commands.set(commandName, command);
	setAliases(command.help.name.toLowerCase());
}

/**
 * Register slash commands.
 * @param client - A Discord.JS client to register the slash commands to.
 * @param scope - "global", "guilds", or a guild's ID to register slash commands to.
 */
export async function registerSlashCommands(client: Client, scope = "global"): Promise<void> {
	const { globalCommands, guildCommands } = generateSlashCommands();

	if (scope == "global") {
		await client.application?.fetch();
		await client.application?.commands.set(globalCommands);
		log("Set Slash Commands.");
		await setPermissions(client); // Set permissions globally.

		client.guilds.cache.forEach(async (guild) => {
			await guild.commands.set(guildCommands);
			log(`Set Slash Commands in "${guild.name}" (${guild.id})`);
			await setPermissions(client, guild.id); // Set individual guild permissions.
		});
	} else if (scope == "guilds") {
		client.guilds.cache.forEach(async (guild) => {
			await guild.commands.set(guildCommands);
			log(`Set Slash Commands in "${guild.name}" (${guild.id})`);
			await setPermissions(client, guild.id); // Set individual guild permissions.
		});
	} else {
		const guild = await client.guilds.fetch(scope);

		await guild.commands.set(guildCommands);
		log(`Set Slash Commands in "${guild.name}" (${guild.id})`);
		await setPermissions(client, guild.id);
	}
}

/**
 * Refreshes slash commands on a more granular scale.
 * @param client - A Discord.JS client to register the slash commands to.
 * @param scope - The guildId of a guild to refesh commands on, or no guildId to do it globally.
 */
export async function refreshSlashCommands(client: Client, scope = "global"): Promise<void> {
	const { globalCommands, guildCommands } = generateSlashCommands();

	if (scope == "global") {
		await client.application?.fetch();
		await client.application?.commands.set(globalCommands);
		log("Set Slash Commands.");
		await setPermissions(client);

		client.guilds.cache.forEach(async (guild) => {
			await guild.commands.set(guildCommands);
			await setPermissions(client, guild.id); // Set individual guild permissions.
			log(`Set Slash Commands in "${guild.name}" (${guild.id})`);
			await setPermissions(client, guild.id);
		});
	} else {
		const guild = await client.guilds.fetch(scope);
		await guild.commands.set(guildCommands);

		log(`Set Slash Commands in "${guild.name}" (${guild.id})`);
		await setPermissions(client, scope);
	}
}

/**
 * Generates slash commands and returns two arrays.
 * @returns Two arrays, the first being globalCommands and the second being guildCommands.
 */
function generateSlashCommands() {
	const globalCommands = [];
	const guildCommands = [];

	// Generate global commands here.
	for (const [, command] of commands) {
		if (!command.config.enabled) continue;
		// We're only going to register commands that don't require a guild globally.
		if (command.config.guildOnly) continue; // We're only generating global commands here.
		const commandName = command.help.name.toLowerCase();
		if (command.help.level == "User") {
			globalCommands.push({ name: commandName, description: command.help.description, options: command.help.options });
		}
	}

	// Generate guild commands here.
	for (const [, command] of commands) {
		if (!command.config.enabled) continue;
		// We're only going to register commands that don't require a guild globally.
		if (!command.config.guildOnly) continue; // Only generate guild commands here.
		const commandName = command.help.name.toLowerCase();
		if (command.help.level == "User") {
			guildCommands.push({ name: commandName, description: command.help.description, options: command.help.options });
		}
	}

	return { globalCommands, guildCommands };
}

/**
 * Unregister slash commands from discord.
 * @param client - A Discord.JS client instance to remove the slash commands from.
 * @param scope - A guildId to remove the commands from.
 */
export async function unregisterSlashCommands(client: Client, scope = "global"): Promise<void> {
	if (client.application?.commands) await client.application?.fetch();

	if (scope == "global") {
		await client.application?.commands.set([]);
		log("Unregistered slash commands globally, please register them again to have global commands.");
	} else {
		const guild = client.guilds.cache.get(scope);
		await guild?.commands.set([]);
		log(`Unregistered slash commands in "${guild?.name}" (${guild?.id})`);
	}
}

/**
 * Loop through each guild in the client.guilds.cache Manager and set guild permissions there.
 * @param client - A Discord.JS client.
 */
async function setPermissions(client: Client, scope = "global"): Promise<void> {
	const { globalCommandIds, guildCommandIds } = await generateCommandIds(client);
	const overrides = generateOverrides(client);

	if (scope == "global") {
		for (const [guildId, guild] of client.guilds.cache) {
			for (const [commandName, permissions] of overrides) {
				const guild = client.guilds.cache.get(guildId);

				// If the command doesn't exist as an ID we're going to ignore it.
				if (globalCommandIds.get(commandName) == undefined) continue;

				await guild?.commands.permissions.add({ command: globalCommandIds.get(commandName) as string, permissions: permissions });
			}

			log(`Set slash command permissions in guild "${guild?.name}" (${guild?.id})`);
		}
	} else {
		// const guild = await client.guilds.fetch(scope);

		guildCommandIds.forEach(async (ids, guildId) => {
			const guild = await client.guilds.fetch(guildId);

			// I don't think we need to use the command name here so we exclude it.
			ids.forEach(async (commandId) => {
				if (overrides.get(guildId) != undefined) {
					await guild.commands.permissions.set({ command: commandId, permissions: overrides.get(guildId) as ApplicationCommandPermissionData[] });
				}
			});

			log(`Set slash command permissions in guild "${guild?.name}" (${guild?.id})`);
		});
	}
}

/**
 * Generate command IDs from registered commands.
 * @param client - A Discord.JS client.
 * @returns Two collections, one being the global command ids and the other being the guild command ids.
 */
async function generateCommandIds(client: Client) {
	const globalCommandIds = new Collection<string, string>();
	// Little messy, but the key value pair is really nice.
	// The first key is the guild id, then it return the collection of the guild's commands in a commandName -> commandId value.
	const guildCommandIds = new Collection<string, Collection<string, string>>();

	await client.application?.commands.fetch();
	client.application?.commands.cache.forEach((command, id) => {
		if (globalCommandIds.get(command.name) == undefined) {
			globalCommandIds.set(command.name, id);
		}
	});

	client.guilds.cache.forEach((guild) => {
		guild.commands.cache.forEach((command, id) => {
			if (guildCommandIds.get(guild.id) == undefined) {
				guildCommandIds.set(guild.id, new Collection<string, string>());
				guildCommandIds.get(guild.id)?.set(command.name, id);
			} else {
				guildCommandIds.get(guild.id)?.set(command.name, id);
			}
		});
	});

	return { globalCommandIds, guildCommandIds };
}

/**
 * Generate permission overrides for commands.
 * @returns A Collection of permissions in a key-value pair, the key being a guild ID and the value being command permission data.
 */
function generateOverrides(client: Client): Collection<string, ApplicationCommandPermissionData[]> {
	const permissions = new Collection<string, ApplicationCommandPermissionData[]>();

	for (const [, command] of commands) {
		if (!command.config.enabled) continue;

		// We can skip over global commands, which ARE NOT guildOnly AND User level.
		if (command.help.level == "User" && !command.config.guildOnly) continue;

		client.guilds.cache.forEach((guild) => {
			const guildId = guild.id;

			if (command.help.level == "Owner") {
				config.ownerIds.forEach((ownerId) => {
					if (permissions.get(guildId) == undefined) {
						permissions.set(`${guildId}`, [{ id: ownerId, type: "USER", permission: true }]);
					} else {
						permissions.set(
							`${guildId}`,
							permissions.get(guildId)?.concat([{ id: ownerId, type: "USER", permission: true }]) as ApplicationCommandPermissionData[]
						);
					}
				});
			} else if (command.help.level == "Dev") {
				config.devIds.forEach((devId) => {
					if (permissions.get(guildId) == undefined) {
						permissions.set(`${guildId}`, [{ id: devId, type: "USER", permission: true }]);
					} else {
						permissions.set(
							`${guildId}`,
							permissions.get(guildId)?.concat([{ id: devId, type: "USER", permission: true }]) as ApplicationCommandPermissionData[]
						);
					}
				});
			} else if (command.help.level == "Admin") {
				config.adminIds.forEach((adminId) => {
					if (permissions.get(guildId) == undefined) {
						permissions.set(`${guildId}`, [{ id: adminId, type: "USER", permission: true }]);
					} else {
						permissions.set(
							`${guildId}`,
							permissions.get(guildId)?.concat([{ id: adminId, type: "USER", permission: true }]) as ApplicationCommandPermissionData[]
						);
					}
				});
			}
		});
	}

	return permissions;
}

/**
 * Set the aliases of a command from the commands collections.
 * @param commandName - The commandName to get from the command collection to register our aliases for.
 */
export function setAliases(commandName: string): void {
	commands.get(commandName)?.help.aliases.forEach((alias) => {
		if (!(alias == "")) aliases.set(alias, commandName);
	});
}

/**
 * Get all the commands for the bot.
 * @returns All commands that can are ready to be loaded.
 */
export function getCommands(): Collection<string, Command> {
	return commands;
}

/**
 * Get all the command aliases for the bot.
 * @returns A Collection that returns a command name when accessing an alias.
 */
export function getAliases(): Collection<string, string> {
	return aliases;
}
