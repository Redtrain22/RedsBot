import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";

type CommandOptions = {
	help: {
		name: string;
		description: string;
		options: SlashCommandBuilder;
		aliases: string[];
		level: string;
	};
	config: {
		enabled: boolean;
		guildOnly: boolean;
	};
};

export interface Command extends CommandOptions {
	run: (client: Client, interaction: CommandInteraction) => Promise<void>;

	help: {
		name: string;
		description: string;
		options: SlashCommandBuilder;
		aliases: string[];
		level: string;
	};

	config: {
		enabled: boolean;
		guildOnly: boolean;
	};
}
