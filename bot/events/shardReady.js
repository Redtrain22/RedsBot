const { log } = require("../managers/Logger.js");

module.exports = (client, shardID) => {
	log(`Shard ${shardID} Ready: ${client.user.tag}, now serving ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`, "ready");

	// Make the bot "play the game" which is the help command with default prefix.
	client.user.setActivity("/help (me)", { type: "PLAYING" });
};
