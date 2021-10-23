import { Client, ClientEvents } from "discord.js";

type EventOptions = {
	name: keyof ClientEvents;
	once: boolean;
};

export interface Event extends EventOptions {
	name: keyof ClientEvents;
	once: boolean;

	// Any is used because we don't know what kind of parameters or return type the event will have FOR SURE.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	run: (client: Client, ...args: any[]) => Promise<void> | void;
}
