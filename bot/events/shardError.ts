import { Client } from "discord.js";
import * as logger from "../managers/Logger.js";

const once = false;
const name = "shardError";

function run(client: Client, error: Error, shardID: number): void {
	logger.error(`An error event was sent by Discord.js: \n${JSON.stringify(error)}\n This event occured on shard ${shardID}`);
}

export { once, name, run };
