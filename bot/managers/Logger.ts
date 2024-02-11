import { pino } from "pino";

const redact = ["client.token", "discordToken", "youtubeToken", "databaseHost", "databasePort", "databaseName", "databaseUser", "databasePassword"];

const logger = pino(
	{
		level: "trace",
		formatters: {
			level: (label) => {
				return {
					level: label.toUpperCase(),
				};
			},
		},
		customLevels: {
			trace: 100,
			debug: 200,
			info: 300,
			ready: 310,
			cmd: 320,
			database: 330,
			warn: 400,
			error: 500,
			fatal: 600,
		},
		redact,
	},
	pino.destination({
		minLength: 4096, // Buffer before writing
		sync: false, // Asynchronous logging
		dest: 1,
	})
);

export default logger;
