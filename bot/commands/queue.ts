import { EmbedBuilder, Client, ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import * as queueManager from "../managers/Queue.js";

async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	if (interaction.guild == null) {
		await interaction.reply({ content: "Please run this command from a guild." });
		return;
	}

	const pageNum = interaction.options.getInteger("page");

	const currentQueue = queueManager.getQueue(interaction.guild.id);

	const queue = new EmbedBuilder();

	queue.setTitle("Current Queue").setTimestamp(Date.now());

	if (queueManager.getCurrentSong(interaction.guild.id) == undefined) {
		await interaction.reply({ embeds: [queue.setDescription("Nothing currently playing in the bot.")] });
		return;
	} else {
		queue.setDescription(`Current Song:\n ${queueManager.getCurrentSong(interaction.guild.id)?.metadata?.youtubeURL}`);
	}

	if (currentQueue == undefined) {
		await interaction.reply({ embeds: [queue.addFields({ name: "Nothing in queue", value: "" })] });
		return;
	}

	if (pageNum != null && pageNum >= 2) {
		// Check if this page can actually be populated, atleast partially
		if (currentQueue.length > 25 * (pageNum - 1)) {
			for (let i = 25 * (pageNum - 1); i < 25 * pageNum; i++) {
				// We don't want undefined in our queue so we skip it.
				if (currentQueue[i] != undefined) {
					queue.addFields({ name: `Song ${i + 1}`, value: `${currentQueue[i].metadata.youtubeURL}` });
				}
			}
		} else {
			await interaction.reply("There's no results on the page, please pick a different page.");
			return;
		}
	} else {
		for (let i = 0; i < 25; i++) {
			// We don't want undefined in our queue so we skip it.
			if (currentQueue[i] == undefined) continue;
			queue.addFields({ name: `Song ${i + 1}`, value: `${currentQueue[i].metadata.youtubeURL}` });
		}
	}

	await interaction.reply({ embeds: [queue] });
}

const name = "queue";
const enabled = true;
const guildOnly = true;
const description = "Shows the music queue.";
const defaultPermission = PermissionFlagsBits.UseApplicationCommands;
const options = new SlashCommandBuilder()
	.setName(name)
	.setDescription(description)
	.addIntegerOption((option) => option.setName("page").setDescription("A page number to browse.").setRequired(false))
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
