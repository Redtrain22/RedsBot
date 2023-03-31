import { Client, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, AutocompleteInteraction } from "discord.js";
import * as playerManager from "../managers/Player.js";
import { Command } from "../types/Command.js";

export async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	const volume = interaction.options.getInteger("volume");

	if (interaction.guild == null) {
		await interaction.reply({ content: "Please run this command from a guild." });
		return;
	}

	if (volume) {
		playerManager.setVolume(interaction.guild.id, volume);
		await interaction.reply({ content: `Set volume to ${volume}` });
		return;
	} else {
		await interaction.reply({ content: `Current Volume: ${playerManager.getVolume(interaction.guild.id) || 0.5 * 100}` });
		return;
	}
}

export function autocomplete(client: Client, interaction: AutocompleteInteraction): void {
	return;
}

const options = new SlashCommandBuilder()
	.setName("volume")
	.setDescription("Shows or edits the current volume.")
	.addIntegerOption((option) => option.setName("volume").setDescription("The volume expressed as a percentage").setRequired(false))
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);

export const config = {
	enabled: true,
	options,
} satisfies Command["config"];
