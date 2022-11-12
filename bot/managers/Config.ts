import { Config } from "../types/Config.js";

import { mkdirSync, readFileSync, existsSync, writeFileSync, renameSync } from "node:fs";
import { log, error } from "./Logger.js";

// Make data directory here to make sure that we have a place to put the config file.
if (!existsSync("./data")) {
	mkdirSync("./data");
}

// Make our config.json template here.
const configTemplate: Config = {
	version: "1.1.0",
	ownerIds: [],
	devIds: [],
	adminIds: [],
	discordToken: "Replace Me",
	youtubeToken: "Replace Me",
	databaseType: "SQLite",
	databaseHost: "127.0.0.1",
	databasePort: NaN,
	databaseName: "Replace Me",
	databaseUser: "Replace Me",
	databasePassword: "Replace Me",
	databaseLogging: true,
};

let userConfig: Config;

/**
 * Initalize the config.
 */
export function init(): void {
	if (existsSync("./data/config.json")) {
		try {
			userConfig = JSON.parse(readFileSync("./data/config.json").toString());
			log("Config loaded.");

			checkFields(); // Check for fields that aren't filled.
			appendConfig(); // Check for config update and ONLY APPEND TO IT.
		} catch (err) {
			log("Config error, looks like a formatting issue.");
			error(err);
		}
	} else {
		log("Config not found! Time to make one. Please fill out the fields.");
		writeFileSync("./data/config.json", JSON.stringify(configTemplate, null, 2));
		log("Shutting the bot down as no discordToken exists yet.");
		process.exitCode = 1;
		process.exit();
	}
}

/**
 * Append to the config if there's missing fields.
 */
// ONLY APPEND DON'T REMOVE
function appendConfig(): void {
	// Check if config is current version.
	if (userConfig["version"] != configTemplate["version"]) {
		// Loop through the config template, because we need to check the config has all fields in the template.
		for (const configField of Object.keys(configTemplate)) {
			// We don't need to test these fields in here.
			// Version should now be the new "default value".
			if (configField == "version") continue;
			// devIds and adminIds are able to be blank fields.
			if (configField == "devIds") continue;
			if (configField == "adminIds") continue;

			// Check if field exists.
			if (!userConfig[configField as keyof Config]) {
				log(`You're missing ${configField}, adding it to config. Please set the field!`);
				userConfig[configField as keyof Config] = configTemplate[configField as keyof Config] as never; // Set the new field to the default value.
			}
		}

		// Set the correct version.
		userConfig["version"] = configTemplate["version"];

		// Back up the file because we're not perfect.
		log("Backing up the config before updating, you can find the old one at ./data/config.json.bak");
		renameSync("./data/config.json", "./data/config.json.bak");
		writeFileSync("./data/config.json", JSON.stringify(userConfig, null, 2));
	}
}

/**
 * Check the fields of the config.
 */
function checkFields(): void {
	let isSqliteDB = false;

	for (const configField of Object.keys(configTemplate)) {
		// We don't need to test these fields in here.
		// Version should now be the new "default value".
		if (configField == "version") continue;
		// if (configField == "databaseType") continue;
		if (configField == "databaseType") {
			if (userConfig[configField].toLowerCase() == "sqlite") isSqliteDB = true;
			continue;
		}

		if (configField == "databaseLogging") continue;
		// devIds and adminIds are able to be blank fields.
		if (configField == "devIds") continue;
		if (configField == "adminIds") continue;

		// Skip fields not required for SQLite
		if (isSqliteDB) {
			const skipFields = ["databaseUser", "databasePassword", "databaseHost", "databasePort", "databaseName"];
			if (skipFields.includes(configField)) continue;
		}

		// Check if config[configField] is there AND if the field is the default value.
		if (userConfig[configField as keyof Config] && userConfig[configField as keyof Config] == configTemplate[configField as keyof Config]) {
			log(`You didn't set ${configField} in your config. Please set the field!`);
		}
	}
}

/**
 * Get the config of the bot.
 * @returns The config of the bot.
 */
export function getConfig(): Config {
	if (userConfig == undefined) init();

	return userConfig;
}
