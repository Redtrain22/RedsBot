const { Collection } = require("discord.js");
const fs = require("fs");
const { log } = require("../managers/Logger.js");

const events = new Collection();

/**
 * Initialize the Event Manager.
 * @param {import("discord.js").Client} client - The Client to bind the event manager to.
 */
function init(client) {
	const eventFiles = fs.readdirSync("./bot/events");

	for (const fileName of eventFiles) {
		if (!fileName.endsWith(".js")) continue;

		const eventName = fileName.slice(0, fileName.length - 3);

		events.set(eventName, require(`../events/${fileName}`));
		registerEvent(client, eventName);
	}
}

/**
 * Destroy the Event Manager.
 * @param {import("discord.js").Client} client - The client with the event manager to destroy.
 */
function destroy(client) {
	log("Destroying Event Manager, Discord.JS Events will no longer register.");
	client.removeAllListeners();

	const eventNames = events.keys();
	for (const eventName of eventNames) {
		unregisterEvent(client, eventName);
	}
}

/**
 * Reload an event.
 * @param {import("discord.js").Client} client A Discord.JS client to bind the event to.
 * @param {String} eventName The nname of the event to register.
 */
function reloadEvent(client, eventName) {
	unregisterEvent(client, eventName);

	events.set(eventName, require(`../events/${eventName}.js`));

	registerEvent(client, eventName);
}

/**
 * Register an Event by name with the event callback.
 * @param {import("discord.js").Client} client A Discord.JS client to bind the event to.
 * @param {String} eventName The name of the event to register. Must be in the events Collection, and be named like Discord.JS events.
 */
function registerEvent(client, eventName) {
	client.on(eventName, events.get(eventName).bind(null, client));
	log(`Registered Event ${eventName}`);
}

/**
 * Unregister an event.
 * @param {String} eventName The name of the event to unregister.
 */
function unregisterEvent(client, eventName) {
	log(`Unregistering Event ${eventName}`);
	client.removeAllListeners(eventName);
	events.delete(eventName);
	// Uncache the event so that it's not in memory anymore.
	delete require.cache[require.resolve(`../events/${eventName}.js`)];
}

module.exports = {
	init,
	destroy,
	reloadEvent,
};
