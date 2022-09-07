import { AudioPlayerStatus } from "@discordjs/voice";
import { ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getPlayer } from "../managers/Player.js";

const run = async (client: Client, interaction: ChatInputCommandInteraction): Promise<void> => {
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
};

const name = "pause";
const enabled = true;
const guildOnly = true;
const description = "(Un)Pause the play command.";
const defaultPermission = PermissionFlagsBits.UseApplicationCommands;
const options = new SlashCommandBuilder()
	.setName(name)
	.setDescription(description)
	.setDMPermission(!guildOnly)
	.setDefaultMemberPermissions(defaultPermission);

const config = {
	name,
	enabled,
	guildOnly,
	description,
	defaultPermission,
	options,
};

export { run, config };
