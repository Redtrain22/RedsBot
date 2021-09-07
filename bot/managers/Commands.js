const { Collection } = require("discord.js");
const fs = require("fs");
const { log } = require("./Logger");
const config = require("../managers/Config.js").getConfig();

const commands = new Collection();
const aliases = new Collection();
const commandIds = new Collection();

/**
 * Initialize the Command Manager.
 */
function init() {
	const commandFiles = fs.readdirSync("./bot/commands");

	for (const fileName of commandFiles) {
		if (!fileName.endsWith(".js")) continue;

		const command = require(`../commands/${fileName}`);

		log(`Loading command ${command.help.name.toLowerCase()}`);
		commands.set(command.help.name.toLowerCase(), command);
		setAliases(command.help.name.toLowerCase());
	}
}

/**
 * Destroy the Command Manager.
 */
function destroy() {
	log("Destroying Command Manager, commands won't work anymore.");

	commands.forEach((command) => {
		delete require.cache[require.resolve(`../commands/${command.help.name}.js`)];
	});

	commands.clear();
}

/**
 * Reload a command.
 * @param {String} commandName - The name of the command to reload.
 */
function reloadCommand(commandName) {
	log(`Unloading Command ${commandName}`);
	commands.delete(commandName);
	delete require.cache[require.resolve(`../commands/${commandName}.js`)];
	log(`Loading Command ${commandName}`);

	const command = require(`../commands/${commandName}.js`);

	commands.set(commandName, command);
	setAliases(command.help.name.toLowerCase());
}

/**
 * Register slash commands.
 * @param {Client} client A Discord.JS client to register the slash commands to.
 */
async function registerSlashCommands(client) {
	const slashCommands = [];

	for (const [, command] of commands) {
		if (!command.config.enabled) continue;
		const commandName = command.help.name.toLowerCase();
		if (command.help.level == "User") {
			slashCommands.push({ name: commandName, description: command.help.description, options: command.help.options });
		} else {
			slashCommands.push({
				name: commandName,
				description: command.help.description,
				options: command.help.options,
				defaultPermission: false,
			});
		}
	}

	await client.application.fetch();
	await client.application?.commands.set(slashCommands);
	log("Set Slash Commands.");

	await generateCommandIds(client);
	await setPermissions(client);
}

/**
 * Unregister slash commands from discord.
 * @param {Client} client - A Discord.JS client instance to remove the slash commands from.
 * @param {BigInt} scope - A guildId to remove the commands from.
 */
async function unregisterSlashCommands(client, scope = "global") {
	if (client.application?.commands) await client.application?.fetch();

	if (scope == "global") {
		client.application.commands.set([]);
		log("Unregistered slash commands globally, please register them again to have global commands.");
	} else {
		const guild = client.guilds.cache.get(scope);
		guild.commands.set([]);
		log(`Unregistered slash commands in "${guild.name}" (${guild.id})`);
	}
}

/**
 * Loop through each guild in the client.guilds.cache Manager and set guild permissions there.
 * @param {Client} client A Discord.JS client.
 */
async function setPermissions(client) {
	await generateCommandIds(client);

	const overrides = generateOverrides();
	for (const [guildId, guild] of client.guilds.cache) {
		for (const [commandName, permissions] of overrides) {
			const guild = await client.guilds.cache.get(guildId);
			guild.commands.permissions.add({ command: commandIds.get(commandName), permissions: permissions });
		}

		log(`Set slash command permissions in guild "${guild.name}"`);
	}
}

/**
 * Generate command IDs from registered commands.
 * @param {Client} client A Discord.JS client.
 */
async function generateCommandIds(client) {
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
	const permissionOverides = new Collection();

	for (const [, command] of commands) {
		if (!command.config.enabled) continue;
		const commandName = command.help.name.toLowerCase();
		if (command.help.level == "Dev") {
			config.devIds.forEach((devId) => {
				permissionOverides.set(
					commandName,
					permissionOverides.get(commandName)
						? permissionOverides.get(commandName).concat({ id: devId, type: "USER", permission: true })
						: [{ id: devId, type: "USER", permission: true }]
				);
			});
		}

		if (command.help.level == "Admin") {
			config.adminIds.forEach((adminId) => {
				permissionOverides.set(
					commandName,
					permissionOverides.get(commandName)
						? permissionOverides.get(commandName).concat({ id: adminId, type: "USER", permission: true })
						: [{ id: adminId, type: "USER", permission: true }]
				);
			});
		}

		config.ownerIds.forEach((ownerId) => {
			permissionOverides.set(
				commandName,
				permissionOverides.get(commandName)
					? permissionOverides.get(commandName).concat({ id: ownerId, type: "USER", permission: true })
					: [{ id: ownerId, type: "USER", permission: true }]
			);
		});
	}

	return permissionOverides;
}

/**
 * Set the aliases of a command from the commands collections.
 * @param {String} commandName The commandName to get from the command collection to register our aliases for.
 */
function setAliases(commandName) {
	commands.get(commandName).help.aliases.forEach((alias) => {
		aliases.set(alias, commandName);
	});
}

/**
 * Get all the commands for the bot.
 * @returns All commands that can are ready to be loaded.
 */
function getCommands() {
	return commands;
}

/**
 * Get all the command aliases for the bot.
 * @returns A Collection that returns a command name when accessing an alias.
 */
function getAliases() {
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
