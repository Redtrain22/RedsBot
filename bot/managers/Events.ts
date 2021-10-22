import { Client, Collection } from "discord.js";
import fs from "fs";
import { log } from "../managers/Logger";
import { Event } from "../types/Event";

const events = new Collection<string, Event>();

/**
 * Initialize the Event Manager.
 * @param client - The Client to bind the event manager to.
 */
export async function init(client: Client): Promise<void> {
	const eventFiles = fs.readdirSync("./bot/events");

	for (const fileName of eventFiles) {
		if (!fileName.endsWith(".js")) continue;

		const eventName = fileName.slice(0, fileName.length - 3);

		events.set(eventName, await import(`../events/${fileName}`));
		registerEvent(client, eventName);
	}
}

/**
 * Destroy the Event Manager.
 * @param client - The client with the event manager to destroy.
 */
export function destroy(client: Client): void {
	log("Destroying Event Manager, Discord.JS Events will no longer register.");

	const eventNames = events.keys();
	for (const eventName of eventNames) {
		unregisterEvent(client, eventName);
	}
}

/**
 * Reload an event.
 * @param client A Discord.JS client to bind the event to.
 * @param eventName The nname of the event to register.
 */
export async function reloadEvent(client: Client, eventName: string): Promise<void> {
	unregisterEvent(client, eventName);

	events.set(eventName, await import(`../events/${eventName}`));

	registerEvent(client, eventName);
}

/**
 * Register an Event by name with the event callback.
 * @param client A Discord.JS client to bind the event to.
 * @param eventName The name of the event to register. Must be in the events Collection, and be named like Discord.JS events.
 */
export function registerEvent(client: Client, eventName: string): void {
	const event = events.get(eventName);

	if (event == undefined) return;

	client[event.once ? "once" : "on"](event.name, event.run.bind(null, client));
	log(`Registered Event ${eventName}`);
}

/**
 * Unregister an event.
 * @param eventName The name of the event to unregister.
 */
export function unregisterEvent(client: Client, eventName: string): void {
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
