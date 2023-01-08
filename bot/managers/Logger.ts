/* eslint-disable no-console */

// Building a custom console class in order to colour our console correctly.
import chalk from "chalk";
import moment from "moment";
import fs from "node:fs";
import util from "node:util";
import path from "node:path";

export enum LogType {
	Log = "log",
	Warn = "warn",
	Error = "error",
	Debug = "debug",
	CMD = "cmd",
	Ready = "ready",
	Shard = "shard",
	Database = "database",
}

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

function logger(content: unknown, type = LogType.Log) {
	// Calculate this each time so the date and timestamp are accurate.
	const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}] |`;
	const date = moment().format("YYYY-MM-DD");

	switch (type) {
		case LogType.Log: {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(
				`${timestamp} ${chalk.blue.bold(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
			break;
		}

		case LogType.Warn: {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(
				`${timestamp} ${chalk.yellow(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
			break;
		}

		case LogType.Error: {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(
				`${timestamp} ${chalk.bold.red(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
			break;
		}

		case LogType.Debug: {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(
				`${timestamp} ${chalk.cyan(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
			break;
		}

		case LogType.CMD: {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(
				`${timestamp} ${chalk.white.bold(type.toUpperCase())} ${
					typeof content == "object" ? util.inspect(content, { compact: false, sorted: true, colors: true }) : content
				}`
			);
			break;
		}

		case LogType.Ready: {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(`${timestamp} ${chalk.green.bold(type.toUpperCase())} ${content}`);
			break;
		}

		case LogType.Shard: {
			writeToFile(content, type.toUpperCase(), timestamp, date);
			console.log(`${timestamp} ${chalk.yellow.bold(type.toUpperCase())} ${content}`);
			break;
		}

		case LogType.Database: {
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
export default function log(content: unknown, type?: LogType): void {
	logger(content, type);
}

/**
 * Log an error out to the console.
 * @param content - The error to log.
 */
export function error(content: unknown): void {
	logger(content, LogType.Error);
}

/**
 * Log a warning out to the console.
 * @param content - The warn to log.
 */
export function warn(content: unknown): void {
	logger(content, LogType.Warn);
}

/**
 * Log a debug out to the console.
 * @param content - The debug to log.
 */
export function debug(content: unknown): void {
	logger(content, LogType.Debug);
}

/**
 * Log a cmd out to the console.
 * @param content - The cmd to log.
 */
export function cmd(content: unknown): void {
	logger(content, LogType.CMD);
}
