const { MessageEmbed } = require("discord.js");
const queueManager = require("../managers/Queue.js");

exports.run = async (client, interaction) => {
	const pageNum = interaction.options.get("page")?.value;

	const currentQueue = queueManager.getQueue(interaction.guild.id);

	const queue = new MessageEmbed();

	queue.setTitle("Current Queue").setTimestamp(Date.now());

	queue.setDescription(`Current Song:\n ${queueManager.getCurrentSong(interaction.guild.id).metadata.youtubeURL}`);

	if (pageNum >= 2) {
		// Check if this page can actually be populated, atleast partially
		if (currentQueue.length > 25 * (pageNum - 1)) {
			for (let i = 25 * (pageNum - 1); i < 25 * pageNum; i++) {
				// We don't want undefined in our queue so we skip it.
				if (currentQueue[i] != undefined) {
					queue.addField(`Song ${i + 1}`, `${currentQueue[i].metadata.youtubeURL}`);
				}
			}
		} else {
			return await interaction.reply("There's no results on the page, please pick a different page.");
		}
	} else {
		for (let i = 0; i < 25; i++) {
			// We don't want undefined in our queue so we skip it.
			if (currentQueue[i] != undefined) {
				queue.addField(`Song ${i + 1}`, `${currentQueue[i].metadata.youtubeURL}`);
			}
		}
	}

	await interaction.reply({ embeds: [queue] });
};

exports.help = {
	name: "queue",
	description: "Shows the music queue",
	options: [
		{
			type: "INTEGER",
			name: "page",
			description: "A page number",
			required: false,
		},
	],
	aliases: [""],
	level: "User",
};

exports.config = {
	enabled: true,
};
