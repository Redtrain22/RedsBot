import { Command } from "../types/Command";

import { ApplicationCommandPermissionData, Client, Collection } from "discord.js";
import fs from "fs";
import { log } from "./Logger";
import { getConfig } from "./Config";
const config = getConfig();

const commands = new Collection<string, Command>();
const aliases = new Collection<string, string>();
const commandIds = new Collection<string, string>();

/**
 * Initialize the Command Manager.
 */
export async function init(): Promise<void> {
	const commandFiles = fs.readdirSync("./bot/commands");

	for (const fileName of commandFiles) {
		if (!fileName.endsWith(".js")) continue;

		const command: Command = await import(`../commands/${fileName}`);
		log(command.help);

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
		delete require.cache[require.resolve(`../commands/${command.help.name}.js`)];
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
	delete require.cache[require.resolve(`../commands/${commandName}.js`)];
	log(`Loading Command ${commandName}`);

	const command = await import(`../commands/${commandName}`);

	commands.set(commandName, command);
	setAliases(command.help.name.toLowerCase());
}

/**
 * Register slash commands.
 * @param client - A Discord.JS client to register the slash commands to.
 */
export async function registerSlashCommands(client: Client): Promise<void> {
	const slashCommands = [];

	for (const [, command] of commands) {
		if (!command.config.enabled) continue;
		const commandName = command.help.name.toLowerCase();
		if (command.help.level == "User") {
			slashCommands.push({ name: commandName, description: command.help.description, options: command.help.options });
		}
	}

	await client.application?.fetch();
	await client.application?.commands.set(slashCommands);
	log("Set Slash Commands.");

	await generateCommandIds(client);
	await setPermissions(client);
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
async function setPermissions(client: Client) {
	await generateCommandIds(client);

	const overrides = generateOverrides();
	for (const [guildId, guild] of client.guilds.cache) {
		for (const [commandName, permissions] of overrides) {
			const guild = client.guilds.cache.get(guildId);

			// If the command doesn't exist as an ID we're going to ignore it.
			if (commandIds.get(commandName) == undefined) continue;

			await guild?.commands.permissions.add({ command: commandIds.get(commandName) as string, permissions: permissions });
		}

		log(`Set slash command permissions in guild "${guild.name}"`);
	}
}

/**
 * Generate command IDs from registered commands.
 * @param client - A Discord.JS client.
 */
async function generateCommandIds(client: Client) {
	await client.application?.commands.fetch();
	client.application?.commands.cache.forEach((command, id) => {
		commandIds.set(command.name, id);
	});
}

/**
 * Generate permission overrides for commands.
 * @returns A collection full of permission objects for Discord under each command name.
 */
function generateOverrides() {
	const permissionOverides = new Collection<string, ApplicationCommandPermissionData[]>();

	for (const [, command] of commands) {
		// console.log(command.help.name);
		// console.log(command.config.enabled);
		if (!command.config.enabled) continue;
		const commandName = command.help.name.toLowerCase();
		if (command.help.level == "Dev") {
			config.devIds.forEach((devId) => {
				permissionOverides.set(
					commandName,
					permissionOverides.get(commandName)
						? (permissionOverides.get(commandName)?.concat({ id: devId, type: "USER", permission: true }) as ApplicationCommandPermissionData[])
						: [{ id: devId, type: "USER", permission: true }]
				);
			});
		}
		if (command.help.level == "Admin") {
			config.adminIds.forEach((adminId) => {
				permissionOverides.set(
					commandName,
					permissionOverides.get(commandName)
						? (permissionOverides.get(commandName)?.concat({ id: adminId, type: "USER", permission: true }) as ApplicationCommandPermissionData[])
						: [{ id: adminId, type: "USER", permission: true }]
				);
			});
		}

		config.ownerIds.forEach((ownerId) => {
			permissionOverides.set(
				commandName,
				permissionOverides.get(commandName)
					? (permissionOverides.get(commandName)?.concat({ id: ownerId, type: "USER", permission: true }) as ApplicationCommandPermissionData[])
					: [{ id: ownerId, type: "USER", permission: true }]
			);
		});
	}

	return permissionOverides;
}

/**
 * Set the aliases of a command from the commands collections.
 * @param commandName - The commandName to get from the command collection to register our aliases for.
 */
export function setAliases(commandName: string): void {
	commands.get(commandName)?.help.aliases.forEach((alias) => {
		aliases.set(alias, commandName);
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

module.exports = {
	init,
	destroy,
	reloadCommand,
	registerSlashCommands,
	unregisterSlashCommands,
	setPermissions,
	getCommands,
	getAliases,
};
