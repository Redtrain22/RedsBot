import { Client, CommandInteraction } from "discord.js";
import * as playerManager from "../managers/Player";
import * as queueManager from "../managers/Queue";

export const run = async (client: Client, interaction: CommandInteraction): Promise<void> => {
	if (interaction.guild == null) {
		await interaction.reply({ content: "Please run this command inside a guild." });
		return;
	}

	playerManager.destroy(interaction.guild.id);
	queueManager.destroy(interaction.guild.id);
	await interaction.reply({ content: "Left the channel and cleared the queue." });
};

export const help = {
	name: "stop",
	description: "Stops the bot from playing music and clears the queue.",
	options: [],
	aliases: [""],
	level: "User",
};

export const config = {
	enabled: true,
};
