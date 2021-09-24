const { Client, Intents } = require("discord.js");
const configManager = require("./managers/Config.js");
configManager.init(); // Initialize our config so that other managers can access it if need be.

const databaseManager = require("./managers/Database.js");
const commandManager = require("./managers/Commands.js");
const eventManager = require("./managers/Events.js");

// New instance of the discord client
const intents = new Intents(["GUILDS", "GUILD_MESSAGES", "GUILD_BANS", "GUILD_VOICE_STATES", "DIRECT_MESSAGES"]); // Client Intents
const client = new Client({ intents: intents }); // Client has to be declared out here so it's accessible to the reboot function.

/**
 * Initialize the bot.
 */
async function init() {
	const config = configManager.getConfig();

	await databaseManager.init();
	commandManager.init();
	eventManager.init(client);

	client.login(config.discordToken);
}

/**
 * Safely Destroy the bot.
 */
async function destroy() {
	eventManager.destroy(client);
	commandManager.destroy();
	await databaseManager.destroy();
	client.destroy();
}

/**
 * Safely restart the bot.
 */
async function restart() {
	await destroy();
	await init();
}

/**
 * Reload an event.
 * @param {String} event - The name of the event to reload.
 */
function reloadEvent(event) {
	eventManager.reloadEvent(client, event);
}

/**
 * Reload all the Events on the bot.
 */
function reloadEvents() {
	eventManager.destroy(client);
	eventManager.init(client);
}

/**
 * Reload a command.
 * @param {String} command - The name of the command to reload.
 */
function reloadCommand(command) {
	commandManager.reloadCommand(command);
}

/**
 * Reload all Commands on the bot.
 */
function reloadCommands() {
	commandManager.destroy();
	commandManager.init();
}

function registerSlashCommands() {
	commandManager.registerSlashCommands(client);
}

function unregisterSlashCommands(args) {
	// Check length because we might want to do global commands.
	if (args.length == 0) {
		commandManager.unregisterSlashCommands(client);
	} else {
		commandManager.unregisterSlashCommands(client, args);
	}
}

module.exports = {
	init,
	destroy,
	restart,
	reloadEvent,
	reloadEvents,
	reloadCommand,
	reloadCommands,
	registerSlashCommands,
	unregisterSlashCommands,
};
