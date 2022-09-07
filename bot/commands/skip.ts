import * as queueManager from "../managers/Queue.js";
import * as playerManager from "../managers/Player.js";
import { Client, ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	const songNumber = interaction.options.getInteger("song");
	if (interaction.guild == null) {
		await interaction.reply({ content: "Please run this command from a guild." });
		return;
	}

	if (songNumber != null && songNumber > 0 && songNumber <= Number(queueManager.getQueue(interaction.guild.id)?.length)) {
		const skippedSong = queueManager.getQueue(interaction.guild.id)?.splice(songNumber - 1, 1)[0];

		await interaction.reply({ content: `Skipped song number ${songNumber}, which was ${skippedSong?.metadata.youtubeURL}` });
		return;
	} else if (songNumber == null || songNumber == 0) {
		const currentSong = queueManager.getCurrentSong(interaction.guild.id);
		playerManager.getPlayer(interaction.guild.id)?.stop();
		await interaction.reply({ content: `Skipped currently playing song. The current song was ${currentSong?.metadata.youtubeURL}` });
		return;
	}
}

const name = "skip";
const enabled = true;
const guildOnly = true;
const description = "Skip the current song, or a song in the queue.";
const defaultPermission = PermissionFlagsBits.UseApplicationCommands;
const options = new SlashCommandBuilder()
	.setName(name)
	.setDescription(description)
	.addIntegerOption((option) => option.setName("song").setDescription("Skip a song in queue.").setRequired(false))
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
