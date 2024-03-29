import { Sequelize, DataTypes } from "sequelize";
import { getConfig } from "./Config.js";
const config = getConfig();
import log, { error, LogType } from "./Logger.js";

// Delcare our sequelize object here.
let sequelize: Sequelize;

// Declare our models here.
import { Statistic } from "../models/Statistic.js";
import { Tally } from "../models/Tally.js";
import { TallyRules } from "../models/TallyRules.js";

/**
 * Create the DB with options from the config.
 * @returns A fully made Sequelize object.
 */
function createDB(): Sequelize {
	// SQlite doesn't need normal database entries.
	if (config.databaseType == "sqlite") {
		return new Sequelize({
			dialect: config.databaseType,

			// Where the sqlite3 database will sit.
			storage: "./data/data.sqlite",

			logging: config.databaseLogging ? (query: unknown) => log(query, LogType.Database) : false,

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

	return new Sequelize({
		dialect: config.databaseType,

		host: config.databaseHost,

		port: config.databasePort,

		database: config.databaseName,

		username: config.databaseUser,

		password: config.databasePassword,

		logging: config.databaseLogging ? (query) => log(query, LogType.Database) : false,

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
	} catch (err) {
		error(err);
	}
}

/**
 * Destroy the database manager.
 */
export async function destroy(): Promise<void> {
	try {
		await sequelize.close();
	} catch (err) {
		error(err);
	}
}

function tableInit() {
	Statistic.init(
		{
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			interactionCount: {
				type: DataTypes.BIGINT,
				defaultValue: 0,
			},
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{ sequelize: sequelize, modelName: "Statistic" }
	);

	Tally.init(
		{
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			userId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			ruleName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			tallyCount: DataTypes.INTEGER,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{ sequelize, modelName: "Tally" }
	);

	TallyRules.init(
		{
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			rules: DataTypes.STRING,
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE,
		},
		{ sequelize, tableName: "TallyRules" }
	);
}

export { Statistic } from "../models/Statistic.js";
