import * as queueManager from "../managers/Queue.js";
import * as playerManager from "../managers/Player.js";
import { Client, CommandInteraction } from "discord.js";

async function run(client: Client, interaction: CommandInteraction): Promise<void> {
	const songNumber = interaction.options.getInteger("song");
	if (interaction.guild == null) return await interaction.reply({ content: "Please run this command from a guild." });

	if (songNumber != null && songNumber > 0 && songNumber <= Number(queueManager.getQueue(interaction.guild.id)?.length)) {
		const skippedSong = queueManager.getQueue(interaction.guild.id)?.splice(songNumber - 1, 1)[0];

		return await interaction.reply({ content: `Skipped song number ${songNumber}, which was ${skippedSong?.metadata.youtubeURL}` });
	} else if (songNumber == null || songNumber == 0) {
		const currentSong = queueManager.getCurrentSong(interaction.guild.id);
		playerManager.getPlayer(interaction.guild.id)?.stop();
		return await interaction.reply({ content: `Skipped currently playing song. The current song was ${currentSong?.metadata.youtubeURL}` });
	}
}

const help = {
	name: "skip",
	description: "Skip the current song, or a song in the queue.",
	options: [
		{
			type: "INTEGER",
			name: "song",
			description: "Skip a song in the queue.",
			required: false,
		},
	],
	aliases: [],
	level: "User",
};

const config = {
	enabled: true,
	guildOnly: true,
};

export { run, help, config };
