const { Sequelize, DataTypes } = require("sequelize");
const config = require("./Config.js").getConfig();
const logger = require("./Logger.js");

// Delcare our sequelize object here.
let sequelize = createDB();

let Statistic = require("../models/Statistic.js")(sequelize, DataTypes);

function createDB() {
	const dialect = config.databaseType.toLowerCase();

	switch (dialect) {
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
	// Reassign our sequelize variable to make sure we can access our sequelize object.
	// The init function should only be called up first load, so that's why we do it.
	// If the connection is closed then the sequelize.connectionManager.getConnection will throw an error and crash the application.
	sequelize = createDB();

	Statistic = require("../models/Statistic.js")(sequelize, DataTypes);

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

module.exports = {
	init,
	destroy,
	Statistic,
};
