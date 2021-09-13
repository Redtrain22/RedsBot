const { createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus } = require("@discordjs/voice");
const { Collection } = require("discord.js");
const queueManager = require("./Queue.js");

const audioPlayers = new Collection();

/**
 * Initialize an audioPlayer for the guild.
 * @param {BigInt} guildId - The guild's ID from discord.
 */
function init(guildId) {
	const audioPlayer = createAudioPlayer({
		behaviors: {
			noSubscriber: NoSubscriberBehavior.Pause,
		},
	});

	audioPlayers.set(guildId, audioPlayer);
}

/**
 * Destroy the player for the guild and the connection for the guild.
 * @param {BigInt} guildId - The guild's ID from discord.
 */
function destroy(guildId) {
	const connection = audioPlayers.get(guildId).playable.find((connection) => connection.joinConfig.guildId == guildId);
	connection.destroy();
	audioPlayers.get(guildId).stop();
}

/**
 * Play something in the bot.
 * @param {Interaction} interaction - The interaction that caused this command.
 * @param {VoiceConnection} connection - The connection currently in use.
 */
function play(interaction, connection) {
	// If we don't have an audio player, we make one.
	// AudioPlayers are meant to be reused.
	if (audioPlayers.get(interaction.guild.id) == undefined) {
		init(interaction.guild.id);
	}

	// Get the audioPlayer from the Collection.
	const audioPlayer = audioPlayers.get(interaction.guild.id);
	// We shift the queue here so that we know what the current song is.
	queueManager.shiftQueue(interaction.guild.id);

	// Base case for recursion.
	if (
		(queueManager.getQueue(interaction.guild.id) == undefined || queueManager.getQueue(interaction.guild.id).length == 0) &&
		queueManager.getCurrentSong(interaction.guild.id) == undefined
	) {
		setTimeout(async function leave() {
			// We test again to make sure there's no songs in queue or in the current song.
			if (
				(queueManager.getQueue(interaction.guild.id) == undefined || queueManager.getQueue(interaction.guild.id).length == 0) &&
				queueManager.getCurrentSong(interaction.guild.id) == undefined
			) {
				await interaction.channel.send({ content: "Nothing in queue, leaving channel." });
				connection.destroy();
			}
		}, 10000);
	} else {
		audioPlayer.play(queueManager.getCurrentSong(interaction.guild.id));
		connection.subscribe(audioPlayer);

		// We only want to attach one listener to the audioPlayer.
		if (!(audioPlayer.listenerCount(AudioPlayerStatus.Idle) > 0)) {
			audioPlayer.once(AudioPlayerStatus.Idle, function playNextSong() {
				play(interaction, connection);
			});
		}
	}
}

/**
 * Get the audioPlayer for the guild.
 * @param {BigInt} guildId - The guild's ID from discord.
 */
function getPlayer(guildId) {
	audioPlayers.get(guildId);
}

/**
 * Set the volume of the current audioResource.
 * @param {BigInt} guildId - The guild's ID from discord.
 * @param {Integer} volume - The percent that you want the volume to be in integer form.
 */
function setVolume(guildId, volume) {
	queueManager.getCurrentSong(guildId).volume.setVolume(volume / 100);
}

/**
 * Get the volume of the current song.
 * @param {BigInt} guildId - The guild's ID from discord.
 * @returns The volume as a number.
 */
function getVolume(guildId) {
	return queueManager.getCurrentSong(guildId).volume.volume;
}

module.exports = {
	init,
	destroy,
	play,
	getPlayer,
	setVolume,
	getVolume,
};
