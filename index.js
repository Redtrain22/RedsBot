// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform you.
// Discord.js (v13.1.0) requires a minimum version of Node.JS v16.6.0 to work
if (Number(process.version.slice(1).split(".")[0]) < 16 && Number(process.version.slice(1).split(".")[1]) < 6)
	throw new Error("Node 16.6.0 or newer is required. Please update Node on your system.");

// Load libraries for FileIO and OS Detection
const os = require("os");
const fs = require("fs");
const bot = require("./bot/core.js");

// Terminal input to eval whatever you put into it.
// Should really only be used for debug purposes.
const terminal = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout,
});

terminal.on("line", (line) => {
	handleTerminal(line);
	terminal.prompt();
});

function handleTerminal(input) {
	const args = input.split(/ +/g);
	const command = args.shift();

	switch (command) {
		case "restart":
			bot.restart();
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
			destroy();
			break;

		default:
			break;
	}
}

function destroy() {
	terminal.close();
	bot.destroy();
	process.exit(0);
}

function init() {
	switch (os.platform()) {
		case "win32":
			if (!fs.existsSync("logs//")) {
				fs.mkdirSync("logs//");
			}

			if (!fs.existsSync("data//")) {
				fs.mkdirSync("data//");
			}
			break;

		case "darwin":
		case "linux":
			if (!fs.existsSync("./logs")) {
				fs.mkdirSync("./logs");
			}

			if (!fs.existsSync("./data")) {
				fs.mkdirSync("./data");
			}
			break;

		default:
			throw new Error("Unsupported operating, or undetected operating system.");
	}

	terminal.prompt();

	bot.init();
}

init();
