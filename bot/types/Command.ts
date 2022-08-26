import { Client, CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export interface Command {
	run: (client: Client, interaction: CommandInteraction) => Promise<void>;

	config: {
		name: string;
		enabled: boolean;
		guildOnly: boolean;
		description: string;
		defaultPermission: typeof PermissionFlagsBits;
		options: SlashCommandBuilder;
	};
}
