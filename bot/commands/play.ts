import * as fs from "fs";
import * as youtube from "youtube-dl-exec";
import * as queueManager from "../managers/Queue";
import * as playerManager from "../managers/Player";
import * as logger from "../managers/Logger";
import { YTSearcher } from "ytsearcher";
import { getConfig } from "../managers/Config";
const youtubeToken = getConfig().youtubeToken;
import {
	getVoiceConnection,
	joinVoiceChannel,
	VoiceConnectionStatus,
	createAudioResource,
	StreamType,
	entersState,
	VoiceConnection,
} from "@discordjs/voice";
import { Client, CommandInteraction, GuildMember } from "discord.js";
import { PlayerMetadata } from "../types/PlayerMetadata";

const regexYT = new RegExp("(^(https?\\:\\/\\/)?(www\\.youtube\\.com|youtu\\.be)\\/(watch\\?v=.{11}|.{11})$)|(^.{11}$)");
const ytSearcher = new YTSearcher(youtubeToken);

const queryOptions = {
	noCallHome: true,
	youtubeSkipDashManifest: true,
	o: "./bot/audioCache/%(title)s-%(id)s.%(ext)s",
	getFilename: true,
};

const downloadOptions = {
	extractAudio: true,
	audioFormat: "opus",
	recodeVideo: "ogg",
	audioQuality: 0,
	noCallHome: true,
	youtubeSkipDashManifest: true,
	o: "./bot/audioCache/%(title)s-%(id)s.%(ext)s",
};

/**
 * Get the ogg file path from the file path passed.
 * @param fileName - The name of the file in the cache.
 * @returns The file path that it will be after transcoding it to ogg.
 */
function getFilePath(filePath: string): string {
	const oggFilePath = filePath.substr(0, filePath.lastIndexOf(".")).concat(".ogg");

	return oggFilePath;
}

/**
 * A pure file path to check to see if it exists.
 * @param filePath - The path to a file that we want to check.
 * @returns True or False based on whether it exists or not.
 */
function checkCache(filePath: string): boolean {
	const ytId = filePath.substr(filePath.length - 15, 11);
	const audioFiles = fs.readdirSync("./bot/audioCache");

	// The only thing worrying about this is that it's a N time.
	// No idea how this would perform in say a 10000 item array.
	for (const audioFile of audioFiles) {
		const fileId = audioFile.substr(audioFile.length - 15, 11);

		if (fileId == ytId) return true;
	}

	return fs.existsSync(`${filePath}`);
}

/**
 * Search a songn on youtube.
 * @param query - The query to search youtube with.
 * @returns A youtube URL or null
 */
async function searchSong(query: string | null): Promise<string | null> {
	if (query == null) return null;
	const results = await ytSearcher.search(query, { type: "video" });

	if (results.currentPage?.first() == null) return null;

	if (results.currentPage?.first()?.url == undefined) return null;

	return results.currentPage?.first()?.url as string;
}

async function run(client: Client, interaction: CommandInteraction): Promise<void> {
	await interaction.deferReply();

	if (interaction.guild == null) {
		await interaction.followUp({ content: "Please use the command in a guild", ephemeral: true });
		return;
	}

	// If the user isn't in voice, tell them to join.
	if (!((interaction.member as GuildMember).voice.channel?.type == "GUILD_VOICE")) {
		await interaction.followUp({ content: "Please join a voice channel to use this command", ephemeral: true });
		return;
	}

	const ytSong = interaction.options.getString("youtube");
	const searchResult = await searchSong(interaction.options.getString("search"));
	const youtubeSong = ytSong || searchResult;

	if (searchResult == null || !regexYT.test(searchResult)) {
		await interaction.followUp({ content: "I couldn't find a song with that query, please try again." });
		return;
	}

	if (youtubeSong == null) {
		await interaction.followUp({ content: "Please provid a song or a search query.", ephemeral: true });
		return;
	}

	if (!regexYT.test(youtubeSong)) {
		await interaction.followUp({ content: "That's not a valid YouTube URL.", ephemeral: true });
		return;
	}

	// Generate the filePath so that we know what we're working with.
	const filePath = getFilePath((await youtube.raw(youtubeSong, queryOptions)).stdout);

	// Check the audio cache for the song
	if (!checkCache(filePath)) await youtube.raw(youtubeSong, downloadOptions);

	// Add the song as an AudioResource.
	try {
		const song = createAudioResource<PlayerMetadata>(fs.createReadStream(filePath), {
			inputType: StreamType.OggOpus,
			metadata: { filePath: filePath, youtubeURL: youtubeSong },
			inlineVolume: true,
		});

		queueManager.addSong(interaction.guild.id, song);
	} catch (error) {
		logger.error(error);
	}

	if (getVoiceConnection(interaction.guild.id) == undefined) {
		joinVoiceChannel({
			// The channel was checked up above
			channelId: (interaction.member as GuildMember).voice.channelId as string,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});

		await interaction.followUp({ content: `Joining the channel and playing ${youtubeSong}` });
	} else {
		await interaction.followUp({ content: `Adding ${youtubeSong} to queue` });
	}

	// Initialize our connection.
	const connection = getVoiceConnection(interaction.guild.id) as VoiceConnection; // Voice Connection should be valid from the if statement above.

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
					entersState(connection, VoiceConnectionStatus.Signalling, 5000),
					entersState(connection, VoiceConnectionStatus.Connecting, 5000),
				]);
				// Seems to be reconnecting to a new channel - ignore disconnect
			} catch (error) {
				// Seems to be a real disconnect which SHOULDN'T be recovered from
				connection.destroy();
			}
		});
	}
}

const help = {
	name: "play",
	description: "Play a song in the bot.",
	options: [
		{
			type: "STRING",
			name: "youtube",
			description: "A YouTube URL",
			required: false,
		},
		{
			type: "STRING",
			name: "search",
			description: "What you want to search youtube for.",
			required: false,
		},
	],
	aliases: [""],
	level: "User",
};

const config = {
	enabled: true,
};

export { run, help, config };
