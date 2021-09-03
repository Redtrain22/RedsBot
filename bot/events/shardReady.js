const { log } = require("../managers/Logger.js");
const commandManager = require("../managers/Commands.js");

module.exports = (client, shardID) => {
	log(
		`Shard ${shardID} Ready: ${client.user.tag}, now serving ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users in ${
			client.guilds.cache.size
		} servers.`,
		"ready"
	);

	commandManager.setPermissions(client);

	// Make the bot "play the game" which is the help command with default prefix.
	client.user.setActivity("/help (me)", { type: "PLAYING" });
};
