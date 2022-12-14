import { Client } from "discord.js";
import { error } from "../managers/Logger.js";

const once = false;
const name = "shardError";

function run(client: Client, err: Error, shardID: number): void {
	error(`An error event was sent by Discord.js: \n${JSON.stringify(err)}\n This event occured on shard ${shardID}`);
}

export { once, name, run };
