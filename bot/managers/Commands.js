const { Collection } = require("discord.js");
const fs = require("fs");
const { log } = require("./Logger");
// const config = require("../managers/Config.js").getConfig();

const commands = new Collection();
const aliases = new Collection();
// const commandIds = new Collection();

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

	await client.application?.commands.set(slashCommands);
	log("Set Slash Commands.");
}

// // Setup for when we start writing permissions to guilds, we're going to need the commandId.
// function generateCommandIds(client) {
// 	client.application?.commands.cache.forEach((command, id) => {
// 		commandIds.set(command.name, id);
// 	});
// }

// // Setup for when we start doing command per guild
// function generateOverrides() {
// 	const globalOverides = new Collection();

// 	for (const [, command] of commands) {
// 		if (!command.config.enabled) continue;
// 		const commandName = command.help.name.toLowerCase();
// 		if (command.help.level == "Dev") {
// 			config.devIds.forEach((devId) => {
// 				globalOverides.set(
// 					commandName,
// 					globalOverides.get(commandName)
// 						? globalOverides.get(commandName).concat({ id: devId, type: "USER", permission: true })
// 						: [{ id: devId, type: "USER", permission: true }]
// 				);
// 			});
// 		}

// 		if (command.help.level == "Admin") {
// 			config.adminIds.forEach((adminId) => {
// 				globalOverides.set(
// 					commandName,
// 					globalOverides.get(commandName)
// 						? globalOverides.get(commandName).concat({ id: adminId, type: "USER", permission: true })
// 						: [{ id: adminId, type: "USER", permission: true }]
// 				);
// 			});
// 		}

// 		config.ownerIds.forEach((ownerId) => {
// 			globalOverides.set(
// 				commandName,
// 				globalOverides.get(commandName)
// 					? globalOverides.get(commandName).concat({ id: ownerId, type: "USER", permission: true })
// 					: [{ id: ownerId, type: "USER", permission: true }]
// 			);
// 		});
// 	}

// 	return globalOverides;
// }

function setAliases(commandName) {
	commands.get(commandName).help.aliases.forEach((alias) => {
		aliases.set(alias, commandName);
	});
}

/**
 * Get the commands for the bot.
 * @returns All commands that can are ready to be loaded.
 */
function getCommands() {
	return commands;
}

function getAliases() {
	return aliases;
}

module.exports = {
	init,
	destroy,
	reloadCommand,
	registerSlashCommands,
	getCommands,
	getAliases,
};
