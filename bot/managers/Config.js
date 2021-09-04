const fs = require("fs");
const { log, error } = require("./Logger.js");

// Make our config.json template here.
const configTemplate = {
	version: "1.0.0",
	ownerIds: [],
	devIds: [],
	adminIds: [],
	discordToken: "Replace Me",
	youtubeToken: "Replace Me",
};

let config = {};

function init() {
	if (fs.existsSync("./data/config.json")) {
		try {
			config = JSON.parse(fs.readFileSync("./data/config.json"));
			log("Config loaded.");

			checkFields(); // Check for fields that aren't filled.
			appendConfig(); // Check for config update and ONLY APPEND TO IT.
		} catch (err) {
			log("Config error, looks like a formatting issue.");
			error(err);
		}
	} else {
		log("Config not found! Time to make one. Please fill out the fields.");
		fs.writeFileSync("./data/config.json", JSON.stringify(configTemplate, null, 2));
	}
}

// ONLY APPEND DON'T REMOVE
function appendConfig() {
	// Check if config is current version.
	if (config["version"] != configTemplate["version"]) {
		// Loop through the config template, because we need to check the config has all fields in the template.
		for (const configField of Object.keys(configTemplate)) {
			// We don't need to test these fields in here.
			// Version should now be the new "default value".
			if (configField == "version") continue;
			// devIds and adminIds are able to be blank fields.
			if (configField == "devIds") continue;
			if (configField == "adminIds") continue;

			// Check if field exists.
			if (!config[configField]) {
				log(`You're missing ${configField}, adding it to config. Please set the field!`);
				config[configField] = configTemplate[configField]; // Set the new field to the default value.
			}
		}

		// Set the correct version.
		config["version"] = configTemplate["version"];

		// Back up the file because we're not perfect.
		log("Backing up the config before updating, you can find the old one at ./data/config.json.bak");
		fs.renameSync("./data/config.json", "./data/config.json.bak");
		fs.writeFileSync("./data/config.json", JSON.stringify(config, null, 2));
	}
}

function checkFields() {
	for (const configField of Object.keys(configTemplate)) {
		// We don't need to test these fields in here.
		// Version should now be the new "default value".
		if (configField == "version") continue;
		// devIds and adminIds are able to be blank fields.
		if (configField == "devIds") continue;
		if (configField == "adminIds") continue;

		// Check if config[configField] is there AND if the field is the default value.
		if (config[configField] && config[configField] == configTemplate[configField]) {
			log(`You didn't set ${configField} in your config. Please set the field!`);
		}
	}
}

function getConfig() {
	return config;
}

module.exports = {
	init,
	getConfig,
};
