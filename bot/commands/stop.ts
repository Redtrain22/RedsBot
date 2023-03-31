import { Client, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, AutocompleteInteraction } from "discord.js";
import * as playerManager from "../managers/Player.js";
import * as queueManager from "../managers/Queue.js";
import { Command } from "../types/Command.js";

export async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	if (interaction.guild == null) {
		await interaction.reply({ content: "Please run this command inside a guild." });
		return;
	}

	playerManager.destroy(interaction.guild.id);
	queueManager.destroy(interaction.guild.id);
	await interaction.reply({ content: "Left the channel and cleared the queue." });
}

export function autocomplete(client: Client, interaction: AutocompleteInteraction): void {
	return;
}

const options = new SlashCommandBuilder()
	.setName("stop")
	.setDescription("Stops the bot from playing music AND clears the queue.")
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);

export const config = {
	enabled: true,
	options,
} satisfies Command["config"];
