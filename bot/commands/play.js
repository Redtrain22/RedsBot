const fs = require("fs");
const youtube = require("youtube-dl-exec");
const queueManager = require("../managers/Queue.js");
const playerManager = require("../managers/Player.js");
const logger = require("../managers/Logger.js");
const { YTSearcher } = require("ytsearcher");
const { youtubeToken } = require("../managers/Config.js").getConfig();
const { getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus, createAudioResource, StreamType, entersState } = require("@discordjs/voice");

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
 * @param {String} fileName - The name of the file in the cache.
 * @returns The file path that it will be after transcoding it to ogg.
 */
function getFilePath(filePath) {
	const oggFilePath = filePath.substr(0, filePath.lastIndexOf(".")).concat(".ogg");

	return oggFilePath;
}

/**
 * A pure file path to check to see if it exists.
 * @param {String} filePath - The path to a file that we want to check.
 * @returns True or False based on whether it exists or not.
 */
function checkCache(filePath) {
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

async function searchSong(query) {
	if (query == undefined) return null;
	const results = await ytSearcher.search(query, { type: "video" });

	return results.currentPage.first().url;
}

// async function checkSong(songURL) {}

exports.run = async (client, interaction) => {
	await interaction.deferReply();

	if (interaction.guild == null) return interaction.followUp({ content: "Please use the command in a guild", ephemeral: true });

	if (!interaction.member.voice.channel) return interaction.followUp({ content: "Please join a voice channel to use this command", ephemeral: true });

	const ytSong = interaction.options.get("youtube")?.value;
	const searchResult = await searchSong(interaction.options.get("search")?.value);
	const youtubeSong = ytSong || searchResult;

	if (searchResult != null && !regexYT.test(searchResult))
		return interaction.followUp({ content: "I couldn't find a song with that query, please try again." });
	if (!regexYT.test(youtubeSong)) return interaction.followUp({ content: "That's not a valid YouTube URL.", ephemeral: true });

	// Generate the filePath so that we know what we're working with.
	const filePath = getFilePath((await youtube.raw(youtubeSong, queryOptions)).stdout);

	// Check the audio cache for the song
	if (!checkCache(filePath)) await youtube.raw(youtubeSong, downloadOptions);

	// Add the song as an AudioResource.
	try {
		const song = createAudioResource(fs.createReadStream(filePath), {
			inputType: StreamType.OggOpus,
			metadata: { filePath: `FilePath: ${filePath}`, youtubeURL: youtubeSong },
			inlineVolume: true,
		});

		queueManager.addSong(interaction.guild.id, song);
	} catch (error) {
		logger.error(error);
	}

	if (getVoiceConnection(interaction.guild.id) == undefined) {
		await interaction.followUp({ content: `Joining the channel and playing ${youtubeSong}` });

		joinVoiceChannel({
			channelId: interaction.member.voice.channelId,
			guildId: interaction.guild.id,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
	} else {
		await interaction.followUp({ content: `Adding ${youtubeSong} to queue` });
	}

	// Initialize our connection.
	const connection = getVoiceConnection(interaction.guild.id);

	// Test if the listener count is greater than zero so that we don't register it N number of times.
	// N being however many times the command was ran.
	if (!(connection.listenerCount(VoiceConnectionStatus.Ready) > 0)) {
		// This should only happen once.
		connection.once(VoiceConnectionStatus.Ready, function voiceReady() {
			playerManager.play(interaction, connection);
			playerManager.setVolume(interaction.guild.id, 50);
		});
	}

	// Test if the listener count is greater than zero so that we don't register it N number of times.
	// N being however many times the command was ran.
	if (!(connection.listenerCount(VoiceConnectionStatus.Disconnected) > 0)) {
		// Handle the bot being disconnected from the voice channel
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
};

exports.help = {
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

exports.config = {
	enabled: true,
};
