// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform you.
// Discord.js (v14.2.0) requires a minimum version of Node.JS v16.6.0 to work
// Node 18 is marked as the minimum requirement because that's what this was written using.
// With the changes that Node 18 brings not having to deal with backwards compatibility is nice.
if (Number(process.version.slice(1).split(".")[0]) < 18 && Number(process.version.slice(1).split(".")[1]) < 5)
	throw new Error("Node 18.5.0 or newer is required. Please update Node on your system.");

import { existsSync, mkdirSync } from "fs";
import * as bot from "./bot/core.js";
import { createInterface } from "readline";

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
	if (!existsSync("./logs")) {
		mkdirSync("./logs");
	}

	if (!existsSync("./data")) {
		mkdirSync("./data");
	}

	if (!existsSync("./bot/audioCache")) {
		mkdirSync("./bot/audioCache");
	}

	terminal.prompt();

	await bot.init();
}

init();
