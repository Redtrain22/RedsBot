import { AudioPlayerStatus } from "@discordjs/voice";
import { AutocompleteInteraction, ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getPlayer } from "../managers/Player.js";
import { Command } from "../types/Command.js";

export async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	if (interaction.guild == null) {
		await interaction.reply({ content: "Please run this command in a guild.", ephemeral: true });
		return;
	}
	if (getPlayer(interaction.guild?.id)?.state.status == AudioPlayerStatus.Paused) {
		getPlayer(interaction.guild?.id)?.unpause();
	} else {
		getPlayer(interaction.guild?.id)?.pause(true);
	}

	await interaction.reply({
		content: `${
			getPlayer(interaction.guild?.id)?.state.status == AudioPlayerStatus.Paused ? "Paused" : "Unpaused"
		} the player, please run pause again to unpause it.`,
	});
}

export function autocomplete(client: Client, interaction: AutocompleteInteraction): void {
	return;
}
const options = new SlashCommandBuilder()
	.setName("pause")
	.setDescription("(Un)Pause the play command.")
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);

export const config = {
	enabled: true,

	options,
} satisfies Command["config"];
