import { Command } from "../types/Command.js";

import { ApplicationCommandPermissions, ApplicationCommandPermissionType, Client, Collection, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import { log } from "./Logger.js";
import { getConfig } from "./Config.js";
const config = getConfig();

const commands = new Collection<string, Command>();

/**
 * Initialize the Command Manager.
 */
export async function init(): Promise<void> {
	const commandFiles = fs.readdirSync("./bot/commands");

	for (const fileName of commandFiles) {
		if (!fileName.endsWith(".ts")) continue;

		const command: Command = await import(`../commands/${fileName}`);

		log(`Loading command ${command.config.name.toLowerCase()}`);
		commands.set(command.config.name.toLowerCase(), command);
	}
}

/**
 * Destroy the Command Manager.
 */
export function destroy(): void {
	log("Destroying Command Manager, commands won't work anymore.");

	// commands.forEach((command) => {
	// 	delete require.cache[require.resolve(`../commands/${command.help.name}`)];
	// });

	commands.clear();
}

/**
 * Reload a command.
 * @param commandName - The name of the command to reload.
 */
export async function reloadCommand(commandName: string): Promise<void> {
	log(`Unloading Command ${commandName}`);
	commands.delete(commandName);
	// delete require.cache[require.resolve(`../commands/${commandName}`)];
	log(`Loading Command ${commandName}`);

	const command: Command = await import(`../commands/${commandName}`);

	commands.set(commandName, command);
}

/**
 * Register slash commands.
 * @param client - A Discord.JS client to register the slash commands to.
 * @param scope - "global", "guilds", or a guild's ID to register slash commands to.
 */
export async function refreshSlashCommands(client: Client, scope = "global"): Promise<void> {
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
		// if (command.help.defaultPermission == PermissionFlagsBits.UseApplicationCommands) {
		globalCommands.push(command.config.options.toJSON());
		// }
	}

	// Generate guild commands here.
	for (const [, command] of commands) {
		if (!command.config.enabled) continue;
		// We're only going to register commands that don't require a guild globally.
		if (!command.config.guildOnly) continue; // Only generate guild commands here.
		// if (command.help.level == "User") {
		guildCommands.push(command.config.options.toJSON());
		// }
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
 * @param scope - The id of the guild to setPermissions for. Default to All Guilds.
 * @param overrides - The overrides to set for the guilds. Defaults to generated overrides from config.
 */
async function setPermissions(client: Client, scope = "global", overrides = generateOverrides(client)): Promise<void> {
	const { globalCommandIds, guildCommandIds } = await generateCommandIds(client);

	if (scope == "global") {
		for (const [, guild] of client.guilds.cache) {
			for (const [commandName, permissions] of overrides) {
				// The first element is the guildId, but we don't need that.
				// If the command doesn't exist as an ID we're going to ignore it.
				const commandId = globalCommandIds.get(commandName);
				if (commandId == undefined) continue;
				await guild?.commands.permissions.add({
					command: commandId,
					permissions: permissions,
					token: config.discordToken,
				});
			}
			log(`Set slash command permissions in guild "${guild?.name}" (${guild?.id})`);
		}
	} else {
		const guild = await client.guilds.fetch(scope);
		const guildCommands = guildCommandIds.get(guild.id);
		if (guildCommands == undefined) return; // No Commands to Update.

		guildCommands.forEach(async (id, commandName) => {
			const override = overrides.get(commandName);
			if (override == undefined) return;

			await guild.commands.permissions.add({
				command: id,
				permissions: override,
				token: config.discordToken,
			});
		});
		log(`Set slash command permissions in guild "${guild?.name}" (${guild?.id})`);
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
function generateOverrides(client: Client): Collection<string, ApplicationCommandPermissions[]> {
	const permissions = new Collection<string, ApplicationCommandPermissions[]>();

	for (const [, command] of commands) {
		if (!command.config.enabled) continue;

		// We can skip over global commands, which ARE NOT guildOnly AND User level.
		if (command.config.defaultPermission == PermissionFlagsBits.UseApplicationCommands && !command.config.guildOnly) continue;

		client.guilds.cache.forEach((guild) => {
			const guildId = guild.id;

			// TODO Reimplement system for all role types in the config. Do this in a better way than just if else if possible.
			// [x] Owner
			// [ ] Dev
			// [ ] Admin
			config.ownerIds.forEach((ownerId) => {
				if (permissions.get(guildId) == undefined) return;

				permissions.set(
					guildId,
					permissions
						.get(guildId)
						?.concat([{ id: ownerId, type: ApplicationCommandPermissionType.User, permission: true }]) as ApplicationCommandPermissions[]
				);
			});
		});
	}

	return permissions;
}

/**
 * Get all the commands for the bot.
 * @returns All commands that can are ready to be loaded.
 */
export function getCommands(): Collection<string, Command> {
	return commands;
}
