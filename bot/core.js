const { Client, Intents } = require("discord.js");
const configManager = require("./managers/Config.js");
const eventManager = require("./managers/Events.js");
const commandManager = require("./managers/Commands.js");

// New instance of the discord client
const intents = new Intents(["GUILDS", "GUILD_MESSAGES", "GUILD_BANS", "GUILD_VOICE_STATES", "DIRECT_MESSAGES"]); // Client Intents
const client = new Client({ intents: intents }); // Client has to be declared out here so it's accessible to the reboot function.

/**
 * Initialize the bot.
 */
function init() {
	configManager.checkConfig();

	const config = configManager.getConfig();

	eventManager.init(client);
	commandManager.init();

	client.login(config.discordToken);

	commandManager.registerSlashCommands(client);
}

/**
 * Safely Destroy the bot.
 */
function destroy() {
	eventManager.destroy(client);
	commandManager.destroy();
	client.destroy();
}

/**
 * Safely restart the bot.
 */
function restart() {
	destroy();
	init();
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

module.exports = {
	init,
	destroy,
	restart,
	reloadEvent,
	reloadEvents,
	reloadCommand,
	reloadCommands,
};
