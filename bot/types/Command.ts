import { AutocompleteInteraction, Client, CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
	run: (client: Client, interaction: CommandInteraction) => Promise<void>;
	autocomplete: (client: Client, interaction: AutocompleteInteraction) => Promise<void> | void;

	config: {
		enabled: boolean;
		options: SlashCommandBuilder;
	};
}
