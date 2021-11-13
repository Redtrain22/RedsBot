import { ApplicationCommandOptionData, Client, CommandInteraction } from "discord.js";

type CommandOptions = {
	help: {
		name: string;
		description: string;
		options: ApplicationCommandOptionData[];
		aliases: string[];
		level: string;
	};
	config: {
		enabled: boolean;
	};
};

export interface Command extends CommandOptions {
	run: (client: Client, interaction: CommandInteraction) => Promise<void>;

	help: {
		name: string;
		description: string;
		options: ApplicationCommandOptionData[];
		aliases: string[];
		level: string;
	};

	config: {
		enabled: boolean;
		guildOnly: boolean;
	};
}
