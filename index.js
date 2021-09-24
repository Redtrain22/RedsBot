// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform you.
// Discord.js (v13.1.0) requires a minimum version of Node.JS v16.6.0 to work
if (Number(process.version.slice(1).split(".")[0]) < 16 && Number(process.version.slice(1).split(".")[1]) < 6)
	throw new Error("Node 16.6.0 or newer is required. Please update Node on your system.");

// Load libraries for FileIO and OS Detection
const fs = require("fs");
const bot = require("./bot/core.js");

// Terminal input to eval whatever you put into it.
// Should really only be used for debug purposes.
const terminal = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});

terminal.on("line", async (line) => {
	await handleTerminal(line);
	terminal.prompt();
});

async function handleTerminal(input) {
	const args = input.split(/ +/g);
	const command = args.shift();

	switch (command) {
		case "restart":
			await bot.restart();
			break;

		case "reloadEvent":
			// We pass args[0] since we're only reloading one event.
			bot.reloadEvent(args[0]);
			break;

		case "reloadEvents":
			bot.reloadEvents();
			break;

		case "reloadCommand":
			// We pass args[0] since we're only reloading one command.
			bot.reloadCommand(args[0]);
			break;

		case "reloadCommands":
			bot.reloadCommands();
			break;

		case "registerSlashCommands":
			bot.registerSlashCommands();
			break;

		case "unregisterSlashCommands":
			bot.unregisterSlashCommands(args);
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
	if (!fs.existsSync("./logs")) {
		fs.mkdirSync("./logs");
	}

	if (!fs.existsSync("./data")) {
		fs.mkdirSync("./data");
	}

	if (!fs.existsSync("./bot/audioCache")) {
		fs.mkdirSync("./bot/audioCache");
	}

	terminal.prompt();

	await bot.init();
}

init();
