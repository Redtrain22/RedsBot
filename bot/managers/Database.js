const { Sequelize, Model, DataTypes } = require("sequelize");
const config = require("./Config.js").getConfig();
const logger = require("./Logger.js");

const sequelize = createDB();

function createDB() {
	const dialect = config.databaseType.toLowerCase();

	switch (config.databaseType.toLowerCase()) {
		case "sqlite":
			return new Sequelize({
				dialect: dialect,

				// Where the sqlite3 database will sit.
				storage: "./data/data.sqlite",

				logging: config.databaseLogging ? (query) => logger.log(query, "database") : false,

				pool: {
					// Max number of clients
					max: 25,

					// Min number of clients
					min: 0,

					// Idle time for a client
					idle: 20000,
				},
			});

		default:
			return new Sequelize({
				dialect: dialect,

				host: config.databaseHost,

				port: config.databasePort,

				database: config.databaseName,

				username: config.databaseUser,

				password: config.databasePassword,

				logging: config.databaseLogging ? (query) => logger.log(query, "database") : false,

				pool: {
					// Max number of clients
					max: 25,

					// Min number of clients
					min: 0,

					// Idle time for a client
					idle: 20000,
				},
			});
	}
}

async function init() {
	try {
		await sequelize.authenticate();
		await syncModels();
	} catch (error) {
		logger.error(error);
	}
}

async function destroy() {
	try {
		await sequelize.close();
	} catch (error) {
		logger.error(error);
	}
}

async function syncModels() {
	await Statistic.sync();
}

class Statistic extends Model {
	add(number = 1) {
		this.increment("interactionCount", { by: number });
	}
}

Statistic.init(
	{
		guildId: {
			type: DataTypes.BIGINT,
			allowNull: false,
		},
		interactionCount: {
			type: DataTypes.BIGINT,
			defaultValue: 0,
		},
	},
	{ sequelize: sequelize, modelName: "Statistic" }
);

module.exports = {
	init,
	destroy,
	Statistic,
};
