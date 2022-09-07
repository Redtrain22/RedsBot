import { ActivityType, Client } from "discord.js";
import { log } from "../managers/Logger.js";

const once = false;
const name = "shardReady";

const run = (client: Client, shardID: number): void => {
	log(
		`Shard ${shardID} Ready: ${client.user?.tag}, now serving ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users in ${
			client.guilds.cache.size
		} servers.`,
		"ready"
	);

	// Make the bot "play the game" which is the help command with default prefix.
	client.user?.setActivity("/help (me)", { type: ActivityType.Playing });
};

export { once, name, run };
