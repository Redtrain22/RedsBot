import { Config, Dialects, isValidDialect } from "../types/Config.js";
import { mkdirSync, readFileSync, existsSync, writeFileSync, renameSync } from "node:fs";
import log, { error, warn } from "./Logger.js";

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
	databaseType: "sqlite",
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
 *
 * @summary
 * This function will initialize the config using both the file and environment variables.
 *
 * It will first load the data from the file using the BOT_CONFIG_PATH environment variable.
 *
 * The config manager will use any environment variables to REPLACE any values in the written file
 * EXCEPT the IDs which it will merge the two lists.
 */
export function init(): void {
	try {
		const config = getConfigFromDisk(process.env.BOT_CONFIG_PATH);
		if (config) userConfig = config;
		processEnvironmentVariables();

		log("Config loaded.");

		checkFields(); // Check for fields that aren't filled.
		appendConfig(); // Check for config update and ONLY APPEND TO IT.
	} catch (err) {
		log("Config error, commonly a formatting issue.");
		error(err);
	}

	if (!userConfig) {
		log("Config file not found! Time to make one. Please fill out the fields.");
		writeFileSync("./data/config.json", JSON.stringify(configTemplate, null, 2));
		process.exitCode = 1;
		process.exit();
	}
}

function getConfigFromDisk(path: string | undefined = "./data/config.json"): Config | null {
	const config = JSON.parse(readFileSync(path).toString());

	return config;
}

/**
 * BOT_CONFIG_PATH - Path to the config file to be parsed by the bot.
 *
 * BOT_OWNER_IDS - Comma separated list of userIds to give owner perms to.
 *
 * BOT_DEV_IDS - Comma separated list of userIds to give dev perms to.
 *
 * BOT_ADMIN_IDS - Comma separated list of userIds to give admin perms to.
 *
 * BOT_DISCORD_TOKEN - Discord token that the bot uses to login.
 *
 * BOT_DISCORD_TOKEN - YouTube token used to query YouTube.
 *
 * BOT_DATBASE_TYPE - Type of database that's suppored by Sequelize.
 *
 * BOT_DATABASE_HOST - Host of the database.
 *
 * BOT_DATABASE_NAME - Name of the database to connect to.
 *
 * BOT_DATABASE_USER - User used to connect to the database.
 *
 * BOT_DATABASE_PASSWORD - Password for the user.
 *
 * BOT_DATABASE_LOGGING - Whether or not to enable loggging of database transactions.
 */
function processEnvironmentVariables(): void {
	userConfig.ownerIds.push(...(process.env.BOT_OWNER_IDS?.split(",") ?? userConfig.ownerIds));
	userConfig.devIds.push(...(process.env.BOT_DEV_IDS?.split(",") ?? userConfig.devIds));
	userConfig.adminIds.push(...(process.env.BOT_ADMIN_IDS?.split(",") ?? userConfig.adminIds));
	userConfig.discordToken = process.env.BOT_DISCORD_TOKEN ?? userConfig.discordToken;
	userConfig.youtubeToken = process.env.BOT_YOUTUBE_TOKEN ?? userConfig.youtubeToken;
	if (!process.env.BOT_DATABASE_TYPE && !isValidDialect(userConfig.databaseType)) throw "Database type is not a Valid Dialet";
	if (isValidDialect(process.env.BOT_DATABASE_TYPE)) userConfig.databaseType = process.env.BOT_DATABASE_TYPE ?? userConfig.databaseType;
	userConfig.databaseHost = process.env.BOT_DATABASE_HOST ?? userConfig.databaseHost;
	userConfig.databasePort = parseInt(process.env.BOT_DATABASE_PORT ?? `${userConfig.databasePort}`);
	userConfig.databaseName = process.env.BOT_DATABASE_NAME ?? userConfig.databaseName;
	userConfig.databaseUser = process.env.BOT_DATABASE_USER ?? userConfig.databaseUser;
	userConfig.databasePassword = process.env.BOT_DATABASE_PASSWORD ?? userConfig.databasePassword;
	userConfig.databaseLogging = Boolean(process.env.BOT_DATABASE_LOGGING) ?? userConfig.databaseLogging;
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
				warn(`You're missing ${configField}, adding it to config. Please set the field!`);
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
	for (const configField of Object.keys(configTemplate)) {
		// We don't need to test these fields in here.
		// Version should now be the new "default value".
		if (configField == "version") continue;
		if (configField == "databaseType") {
			const dialect = userConfig[configField].toLowerCase();
			if (!isValidDialect(dialect)) {
				error(`Not a valid dialect. Your choices are ${Dialects.join(", ")}`);
				continue;
			}
			userConfig[configField] = dialect;
			continue;
		}

		if (configField == "databaseLogging") continue;
		// devIds and adminIds are able to be blank fields.
		if (configField == "devIds") continue;
		if (configField == "adminIds") continue;

		// Skip fields not required for SQLite
		if (userConfig["databaseType"] == "sqlite") {
			const skipFields = ["databaseUser", "databasePassword", "databaseHost", "databasePort", "databaseName"];
			if (skipFields.includes(configField)) continue;
		}

		// Check if config[configField] is there AND if the field is the default value.
		if (userConfig[configField as keyof Config] && userConfig[configField as keyof Config] == configTemplate[configField as keyof Config]) {
			warn(`You didn't set ${configField} in your config. Please set the field!`);
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
