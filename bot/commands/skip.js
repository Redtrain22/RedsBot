const queueManager = require("../managers/Queue.js");
const playerManager = require("../managers/Player.js");

exports.run = async (client, interaction) => {
	const songNumber = interaction.options.get("song")?.value;

	if (songNumber > 0 && songNumber <= queueManager.getQueue(interaction.guild.id)?.length) {
		const skippedSong = queueManager.getQueue(interaction.guild.id).splice(songNumber - 1, 1)[0];

		return await interaction.reply({ content: `Skipped song number ${songNumber}, which was ${skippedSong.metadata.youtubeURL}` });
	} else {
		const currentSong = queueManager.getCurrentSong(interaction.guild.id);
		playerManager.getPlayer(interaction.guild.id).stop();
		return await interaction.reply({ content: `Skipped currently playing song. The current song was ${currentSong.metadata.youtubeURL}` });
	}
};

exports.help = {
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
exports.config = {
	enabled: true,
};
