import { MessageEmbed, Client, CommandInteraction } from "discord.js";
import * as queueManager from "../managers/Queue";

async function run(client: Client, interaction: CommandInteraction): Promise<void> {
	if (interaction.guild == null) return await interaction.reply({ content: "Please run this command from a guild." });

	const pageNum = interaction.options.getInteger("page");

	const currentQueue = queueManager.getQueue(interaction.guild.id);

	const queue = new MessageEmbed();

	queue.setTitle("Current Queue").setTimestamp(Date.now());

	if (queueManager.getCurrentSong(interaction.guild.id) == undefined) {
		return await interaction.reply({ embeds: [queue.setDescription("Nothing currently playing in the bot.")] });
	} else {
		queue.setDescription(`Current Song:\n ${queueManager.getCurrentSong(interaction.guild.id)?.metadata?.youtubeURL}`);
	}

	if (currentQueue == undefined) return await interaction.reply({ embeds: [queue.addField("Nothing in queue", "")] });

	if (pageNum != null && pageNum >= 2) {
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
}

const help = {
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

const config = {
	enabled: true,
	guildOnly: true,
};

export { run, help, config };
