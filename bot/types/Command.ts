import { AutocompleteInteraction, Client, CommandInteraction, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export interface Command {
	run: (client: Client, interaction: CommandInteraction) => Promise<void>;
	autocomplete: (client: Client, interaction: AutocompleteInteraction) => Promise<void> | void;

	config: {
		enabled: boolean;
		options: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
	};
}
