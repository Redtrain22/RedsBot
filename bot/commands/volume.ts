import { Client, CommandInteraction } from "discord.js";
import * as playerManager from "../managers/Player.js";

async function run(client: Client, interaction: CommandInteraction): Promise<void> {
	const volume = interaction.options.getInteger("volume");

	if (interaction.guild == null) return await interaction.reply({ content: "Please run this command from a guild." });

	if (volume) {
		playerManager.setVolume(interaction.guild.id, volume);
		return await interaction.reply({ content: `Set volume to ${volume}` });
	} else {
		return await interaction.reply({ content: `Current Volume: ${playerManager.getVolume(interaction.guild.id) || 0.5 * 100}` });
	}
}

const help = {
	name: "volume",
	description: "Shows or edits the current volume.",
	options: [
		{
			type: "INTEGER",
			name: "volume",
			description: "The volume number.",
			required: false,
		},
	],
	aliases: [""],
	level: "User",
};

const config = {
	enabled: true,
	guildOnly: true,
};

export { run, help, config };
