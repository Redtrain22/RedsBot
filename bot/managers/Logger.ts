/* eslint-disable no-console */

// Building a custom console class in order to colour our console correctly.
import chalk from "chalk";
import moment from "moment";
import fs from "node:fs";
import util from "node:util";
import path from "node:path";

// Make log dir here to prevent errors due to dirs not made when Logger is imported.
if (!fs.existsSync("./logs")) {
	fs.mkdirSync("./logs");
}

function getPath(date: string): string {
	return path.resolve(`./logs/${date}.log`);
}

function writeToFile(content: unknown, type: string, timestamp: string, date: string) {
	try {
		// We turn off colours or we get ANSI colour codes in log files.
		fs.appendFileSync(
			getPath(date),
			`${timestamp} ${type} | ${typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: false }) : content}\n`
		);
	} catch (error) {
		console.log(error);
	}
}

function logger(content: unknown, type = "log") {
	// Calculate this each time so the date and timestamp are accurate.
	const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}] |`;
	const date = moment().format("YYYY-MM-DD");

	switch (type) {
		case "log": {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(
				`${timestamp} ${chalk.blue.bold(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
			break;
		}

		case "warn": {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(
				`${timestamp} ${chalk.yellow(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
			break;
		}

		case "error": {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(
				`${timestamp} ${chalk.bold.red(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
			break;
		}

		case "debug": {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(
				`${timestamp} ${chalk.cyan(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
			break;
		}

		case "cmd": {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(
				`${timestamp} ${chalk.white.bold(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
			break;
		}

		case "ready": {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(`${timestamp} ${chalk.green.bold(type.toUpperCase())} ${content}`);
			break;
		}

		case "shard": {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(`${timestamp} ${chalk.yellow.bold(type.toUpperCase())} ${content}`);
			break;
		}

		case "database": {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(`${timestamp} ${chalk.cyan.bold(type.toUpperCase())} ${content}`);
			break;
		}

		default:
			throw new TypeError("Logger type must be either warn, debug, log, ready, cmd, error, shard, or database.");
	}
}

/**
 * Log out something to the console.
 * @param content - The thing to log out.
 * @param type - The type of log you want.
 */
export function log(content: unknown, type?: string): void {
	logger(content, type);
}

/**
 * Log an error out to the console.
 * @param content - The error to log.
 */
export function error(content: unknown): void {
	logger(content, "error");
}

/**
 * Log a warning out to the console.
 * @param content - The warn to log.
 */
export function warn(content: unknown): void {
	logger(content, "warn");
}

/**
 * Log a debug out to the console.
 * @param content - The debug to log.
 */
export function debug(content: unknown): void {
	logger(content, "debug");
}

/**
 * Log a cmd out to the console.
 * @param content - The cmd to log.
 */
export function cmd(content: unknown): void {
	logger(content, "cmd");
}
