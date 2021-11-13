import { AudioPlayerStatus } from "@discordjs/voice";
import { Client, CommandInteraction } from "discord.js";
import { getPlayer } from "../managers/Player";

const run = async (client: Client, interaction: CommandInteraction): Promise<void> => {
	if (interaction.guild == null) return await interaction.reply({ content: "Please run this command in a guild.", ephemeral: true });

	if (getPlayer(interaction.guild?.id)?.state.status == AudioPlayerStatus.Paused) {
		getPlayer(interaction.guild?.id)?.unpause();
	} else {
		getPlayer(interaction.guild?.id)?.pause(true);
	}

	return await interaction.reply({
		content: `${
			getPlayer(interaction.guild?.id)?.state.status == AudioPlayerStatus.Paused ? "Paused" : "Unpaused"
		} the player, please run pause again to unpause it.`,
	});
};

const help = {
	name: "pause",
	description: "(Un)Pause the play command.",
	options: [],
	aliases: [""],
	level: "User",
};

const config = {
	enabled: true,
	guildOnly: true,
};

export { run, help, config };
