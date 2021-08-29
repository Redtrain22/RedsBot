const logger = require("../managers/Logger.js");

module.exports = (client, error, shardID) => {
	logger.error(`An error event was sent by Discord.js: \n${JSON.stringify(error)}\n This event occured on shard ${shardID}`);
};
