import { Sequelize, DataTypes, Dialect } from "sequelize";
import { getConfig } from "./Config";
const config = getConfig();
import * as logger from "./Logger.js";

// Delcare our sequelize object here.
let sequelize = createDB();

// Declare our models here.
import { Statistic } from "../models/Statistic";

/**
 * Create the DB with options from the config.
 * @returns A fully made Sequelize object.
 */
function createDB(): Sequelize {
	const dialect = config.databaseType.toLowerCase();

	switch (dialect) {
		case "sqlite":
			return new Sequelize({
				dialect: dialect,

				// Where the sqlite3 database will sit.
				storage: "./data/data.sqlite",

				logging: config.databaseLogging ? (query: unknown) => logger.log(query, "database") : false,

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
				dialect: dialect as Dialect,

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

/**
 * Initialize the database manager.
 */
export async function init(): Promise<void> {
	// Reassign our sequelize variable to make sure we can access our sequelize object.
	// The init function should only be called up first load, so that's why we do it.
	// If the connection is closed then the sequelize.connectionManager.getConnection will throw an error and crash the application.
	sequelize = createDB();

	try {
		await sequelize.authenticate();
		tableInit();
		await sequelize.sync();
	} catch (error) {
		logger.error(error);
	}
}

/**
 * Destroy the database manager.
 */
export async function destroy(): Promise<void> {
	try {
		await sequelize.close();
	} catch (error) {
		logger.error(error);
	}
}

function tableInit() {
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
}

export { Statistic } from "../models/Statistic";
