import { Client, GatewayIntentBits, Partials } from "discord.js";
import * as configManager from "./managers/Config.js";
import * as databaseManager from "./managers/Database.js";
import * as commandManager from "./managers/Commands.js";
import * as eventManager from "./managers/Events.js";

// New instance of the discord client
// const intents = new Intents(["GUILDS", "GUILD_MESSAGES", "GUILD_BANS", "GUILD_VOICE_STATES", "DIRECT_MESSAGES"]); // Client Intents
const intents = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildModeration,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildInvites,
	GatewayIntentBits.DirectMessages,
];
const partials = [Partials.Channel];
const client = new Client({ intents, partials }); // Client has to be declared out here so it's accessible to the reboot function.

/**
 * Initialize the bot.
 */
export async function init(): Promise<void> {
	await databaseManager.init();
	await commandManager.init();
	await eventManager.init(client);

	client.login(configManager.getConfig().discordToken);
}

/**
 * Safely Destroy the bot.
 */
export async function destroy(): Promise<void> {
	eventManager.destroy(client);
	commandManager.destroy();
	await databaseManager.destroy();
	client.destroy();
}

/**
 * Safely restart the bot.
 */
export async function restart(): Promise<void> {
	await destroy();
	await init();
}

/**
 * Reload an event.
 * @param {String} event - The name of the event to reload.
 */
export async function reloadEvent(event: string): Promise<void> {
	await eventManager.reloadEvent(client, event);
}

/**
 * Reload all the Events on the bot.
 */
export async function reloadEvents(): Promise<void> {
	eventManager.destroy(client);
	await eventManager.init(client);
}

/**
 * Reload a command.
 * @param {String} command - The name of the command to reload.
 */
export async function reloadCommand(command: string): Promise<void> {
	await commandManager.reloadCommand(command);
}

/**
 * Reload all Commands on the bot.
 */
export async function reloadCommands(): Promise<void> {
	commandManager.destroy();
	await commandManager.init();
}

export async function registerSlashCommands(scope: string): Promise<void> {
	await commandManager.registerSlashCommands(client, scope);
}

export async function unregisterSlashCommands(args: string): Promise<void> {
	// Check length because we might want to do global commands.
	if (args == undefined) {
		await commandManager.unregisterSlashCommands(client);
	} else {
		await commandManager.unregisterSlashCommands(client, args);
	}
}
