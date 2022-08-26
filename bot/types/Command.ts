import { Client, CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export interface Command {
	run: (client: Client, interaction: CommandInteraction) => Promise<void>;

	config: {
		name: string;
		enabled: boolean;
		guildOnly: boolean;
		description: string;
		// TS doesn't support bigints in enums, but since discord permissions are bigints we need them used here.
		// https://github.com/discordjs/discord-api-types/issues/483
		// https://github.com/microsoft/TypeScript/issues/37783
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		defaultPermission: PermissionFlagsBits;
		options: SlashCommandBuilder;
	};
}
