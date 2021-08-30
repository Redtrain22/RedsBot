const { log } = require("../managers/Logger.js");
const commandManager = require("../managers/Commands.js");

module.exports = (client, shardID) => {
	log(`Shard ${shardID} Ready: ${client.user.tag}, now serving ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`, "ready");

	commandManager.registerSlashCommands(client);

	// Make the bot "play the game" which is the help command with default prefix.
	client.user.setActivity("/help (me)", { type: "PLAYING" });
};
