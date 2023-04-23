import { Dialect } from "sequelize";

export const Dialects = ["mysql", "postgres", "sqlite", "mariadb", "mssql", "db2", "snowflake", "oracle"] as const;
export function isValidDialect(dialect: string | undefined): dialect is Dialect {
	return Dialects.includes(dialect as Dialect);
}

export type Config = {
	version: string;
	ownerIds: string[];
	devIds: string[];
	adminIds: string[];
	discordToken: string;
	youtubeToken: string;
	databaseType: Dialect;
	databaseHost: string;
	databasePort: number;
	databaseName: string;
	databaseUser: string;
	databasePassword: string;
	databaseLogging: boolean;
};
