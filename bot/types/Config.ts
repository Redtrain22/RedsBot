export type Config = {
	version: string;
	ownerIds: string[];
	devIds: string[];
	adminIds: string[];
	discordToken: string;
	youtubeToken: string;
	databaseType: string;
	databaseHost: string;
	databasePort: number;
	databaseName: string;
	databaseUser: string;
	databasePassword: string;
	databaseLogging: boolean;
};
