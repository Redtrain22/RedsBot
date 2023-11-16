import * as fs from "node:fs";
import youtube from "youtube-dl-exec";
import * as queueManager from "../managers/Queue.js";
import * as playerManager from "../managers/Player.js";
import logger from "../managers/Logger.js";
import { YTSearcher } from "ytsearcher";
import { getConfig } from "../managers/Config.js";
const youtubeToken = getConfig().youtubeToken;
import { getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus, createAudioResource, StreamType, entersState } from "@discordjs/voice";
import {
	AutocompleteInteraction,
	ChannelType,
	ChatInputCommandInteraction,
	Client,
	GuildMember,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { PlayerMetadata } from "../types/PlayerMetadata.js";
import { Command } from "../types/Command.js";

const regexYT = new RegExp("(^(https?\\:\\/\\/)?(www\\.youtube\\.com|youtu\\.be)\\/(watch\\?v=.{11}|.{11})$)|(^.{11}$)");
const ytSearcher = new YTSearcher(youtubeToken);

const DOWNLOAD_OPTIONS = {
	extractAudio: true,
	audioFormat: "opus",
	recodeVideo: "ogg",
	audioQuality: 0,
	youtubeSkipDashManifest: true,
	output: "./bot/audioCache/%(title)s-%(id)s.%(ext)s",
};

/**
 * Get the ogg file path from the video ID passed.
 * Will download the file into the cache if not in the cache.
 * @param youtubeSong - The name of the file in the cache.
 * @returns The path of the file.
 */
async function getFile(youtubeSong: string): Promise<string> {
	const SUBSTRING_CHAR_START = "watch?v=";
	const SUBSTRING_START = SUBSTRING_CHAR_START.length + youtubeSong.indexOf(SUBSTRING_CHAR_START);
	const SUBSTRING_END = SUBSTRING_START + 11;
	const cacheFile = getCacheFile(youtubeSong.substring(SUBSTRING_START, SUBSTRING_END));

	if (cacheFile == undefined) await youtube.exec(youtubeSong, DOWNLOAD_OPTIONS);

	// TODO Find a way to not call the getCacheFile function twice
	const videoFile = getCacheFile(youtubeSong.substring(SUBSTRING_START, SUBSTRING_END)) as string;
	const oggFile = videoFile.substring(0, videoFile.lastIndexOf(".")).concat(".ogg");

	return oggFile;
}

/**
 * Get an audio from the cache by video ID.
 * @param videoId - The ID of the youtube video.
 * @returns The file path of the audio file or undefined if it's not in cache.
 */
function getCacheFile(videoId: string): string | undefined {
	const audioFiles = fs.readdirSync("./bot/audioCache");
	const audioFile = audioFiles.filter((file) => file.includes(videoId));
	// Nothing *should* include the same ID, however it could possibly be included in the name for whatever reason.
	// Which means that this could be a bug if the name includes a matching ID. (assuming some sanity?)
	if (audioFile.length > 0) return "./bot/audioCache/".concat(audioFile[0]);

	return undefined;
}

/**
 * Search a song on youtube.
 * @param query - The query to search youtube with.
 * @returns A youtube URL or null
 */
async function searchSong(query: string): Promise<string | undefined> {
	if (query == null) return undefined;
	const results = await ytSearcher.search(query, { type: "video" });

	if (results.currentPage?.first() == null) return undefined;
	if (results.currentPage?.first()?.url == undefined) return undefined;

	return results.currentPage?.first()?.url;
}

export async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	await interaction.deferReply();

	if (interaction.guild == null) {
		await interaction.followUp({ content: "Please use the command in a guild", ephemeral: true });
		return;
	}

	// If the user isn't in voice, tell them to join.
	if (!((interaction.member as GuildMember).voice.channel?.type == ChannelType.GuildVoice)) {
		await interaction.followUp({ content: "Please join a voice channel to use this command", ephemeral: true });
		return;
	}

	const query = interaction.options.getString("query", true);
	const youtubeSong = regexYT.test(query) ? query : await searchSong(query);

	if (youtubeSong == undefined || !regexYT.test(youtubeSong)) {
		await interaction.followUp({ content: "I couldn't find that song.", ephemeral: true });
		return;
	}

	// Get the file path of the song from the audioCache, if it's not in cache download it.
	const filePath = await getFile(youtubeSong);

	// Add the song as an AudioResource.
	try {
		const song = createAudioResource<PlayerMetadata>(fs.createReadStream(filePath), {
			inputType: StreamType.OggOpus,
			metadata: { filePath: filePath, youtubeURL: youtubeSong },
			inlineVolume: true,
		});

		queueManager.addSong(interaction.guild.id, song);
	} catch (err) {
		logger.error(err);
	}

	if (getVoiceConnection(interaction.guild.id) == undefined) {
		await interaction.followUp({ content: `Joining the channel and playing ${youtubeSong}` });
	} else {
		await interaction.followUp({ content: `Adding ${youtubeSong} to queue` });
	}

	// Initialize our connection.
	const connection =
		getVoiceConnection(interaction.guild.id) ||
		joinVoiceChannel({
			// The channel was checked up above
			channelId: (interaction.member as GuildMember).voice.channelId as string,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});

	// Test if the listener count is greater than zero so that we don't register it N number of times.
	// N being however many times the command was ran.
	if (!(connection.listenerCount(VoiceConnectionStatus.Ready) > 0)) {
		// This should only happen once.
		connection.once(VoiceConnectionStatus.Ready, function voiceReady() {
			playerManager.play(interaction, connection);
			if (interaction.guild != null) {
				playerManager.setVolume(interaction.guild.id, 50);
			}
		});
	}

	// Test if the listener count is greater than zero so that we don't register it N number of times.
	// N being however many times the command was ran.
	if (!(connection.listenerCount(VoiceConnectionStatus.Disconnected) > 0)) {
		// Handle the bot being disconnected from the voice channel
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		connection.on(VoiceConnectionStatus.Disconnected, async function disconnected(oldState, newState) {
			try {
				await Promise.race([
					entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
					entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
				]);

				// Seems to be reconnecting to a new channel - ignore disconnect
			} catch (error) {
				// Seems to be a real disconnect which SHOULDN'T be recovered from
				if (connection.state.status != VoiceConnectionStatus.Destroyed) connection.destroy();
			}
		});
	}
}

export function autocomplete(client: Client, interaction: AutocompleteInteraction): void {
	return;
}
const options = new SlashCommandBuilder()
	.setName("play")
	.setDescription("Play a song in the bot.")
	.addStringOption((option) => option.setName("query").setDescription("Youtube link, or something to search Youtube for.").setRequired(true))
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);

export const config = {
	enabled: true,

	options,
} satisfies Command["config"];
