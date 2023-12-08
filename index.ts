// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform you.
// Expected minimum Node version is now 20.10
if (Number(process.version.slice(1).split(".")[0]) < 20 && Number(process.version.slice(1).split(".")[1]) < 10)
	throw new Error("Node 20.10.0 or newer is required. Please update Node on your system.");

import { existsSync, mkdirSync } from "node:fs";
import { createInterface } from "node:readline";
import * as bot from "./bot/core.js";

const terminal = createInterface({
	input: process.stdin,
	output: process.stdout,
});

terminal.on("line", async (line: string): Promise<void> => {
	await handleTerminal(line);
	terminal.prompt();
});

async function handleTerminal(input: string) {
	const args = input.split(/ +/g);
	const command = args.shift();

	switch (command) {
		case "restart":
			await bot.restart();
			break;

		case "reloadEvent":
			// We pass args[0] since we're only reloading one event.
			await bot.reloadEvent(args[0]);
			break;

		case "reloadEvents":
			await bot.reloadEvents();
			break;

		case "reloadCommand":
			// We pass args[0] since we're only reloading one command.
			await bot.reloadCommand(args[0]);
			break;

		case "reloadCommands":
			await bot.reloadCommands();
			break;

		case "registerSlashCommands":
			await bot.registerSlashCommands(args[0]);
			break;

		case "unregisterSlashCommands":
			await bot.unregisterSlashCommands(args[0]);
			break;

		case "stop":
		case "quit":
		case "destroy":
			await destroy();
			break;

		default:
			break;
	}
}

async function destroy() {
	terminal.close();
	await bot.destroy();
	process.exit(0);
}

async function init() {
	if (!existsSync("./bot/audioCache")) {
		mkdirSync("./bot/audioCache");
	}

	terminal.prompt();

	await bot.init();
}

init();
