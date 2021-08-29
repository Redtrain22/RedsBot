/* eslint-disable no-console */

// Building a custom console class in order to colour our console correctly.
const chalk = require("chalk");
const moment = require("moment");
const fs = require("fs");
const os = require("os");
const util = require("util");

exports.log = (content, type = "log") => {
	const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}] |`;
	const date = moment().format("YYYY-MM-DD");

	function getPath() {
		// Damn you Windows filepaths
		switch (os.platform()) {
			case "win32":
				return `logs//${date}.log`;
			case "darwin":
			case "linux":
				return `./logs/${date}.log`;
		}
	}

	function writeToFile(type) {
		try {
			// We turn off colours or we get ANSI colour codes in log files.
			fs.appendFileSync(
				getPath(),
				`${timestamp} ${type} | ${typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: false }) : content}\n`
			);
		} catch (error) {
			console.log(error);
		}
	}

	switch (type) {
		case "log": {
			writeToFile(type.toUpperCase());
			return console.log(
				`${timestamp} ${chalk.blue.bold(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
		}

		case "warn": {
			writeToFile(type.toUpperCase());
			return console.log(
				`${timestamp} ${chalk.yellow(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
		}

		case "error": {
			writeToFile(type.toUpperCase());
			return console.log(
				`${timestamp} ${chalk.bold.red(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
		}

		case "debug": {
			writeToFile(type.toUpperCase());
			return console.log(
				`${timestamp} ${chalk.cyan(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
		}

		case "cmd": {
			writeToFile(type.toUpperCase());
			return console.log(
				`${timestamp} ${chalk.white.bold(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
		}

		case "ready": {
			writeToFile(type.toUpperCase());
			return console.log(`${timestamp} ${chalk.green.bold(type.toUpperCase())} ${content}`);
		}

		case "shard": {
			writeToFile(type.toUpperCase());
			return console.log(`${timestamp} ${chalk.yellow.bold(type.toUpperCase())} ${content}`);
		}

		case "database": {
			// writeToFile(type.toUpperCase());
			return console.log(`${timestamp} ${chalk.cyan.bold(type.toUpperCase())} ${content}`);
		}

		default:
			throw new TypeError("Logger type must be either warn, debug, log, ready, cmd, error, shard, or database.");
	}
};

exports.error = (...args) => this.log(...args, "error");

exports.warn = (...args) => this.log(...args, "warn");

exports.debug = (...args) => this.log(...args, "debug");

exports.cmd = (...args) => this.log(...args, "cmd");
