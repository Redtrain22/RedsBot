import { createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnection, AudioPlayer, AudioResource } from "@discordjs/voice";
import { Collection, CommandInteraction, Guild } from "discord.js";
import * as queueManager from "./Queue.js";

const audioPlayers = new Collection<string, AudioPlayer>();

/**
 * Initialize an audioPlayer for the guild.
 * @param guildId - The guild's ID from discord.
 */
export function init(guildId: string): void {
	const audioPlayer = createAudioPlayer({
		behaviors: {
			noSubscriber: NoSubscriberBehavior.Pause,
		},
	});

	audioPlayers.set(guildId, audioPlayer);
}

/**
 * Destroy the player for the guild and the connection for the guild.
 * @param guildId - The guild's ID from discord.
 */
export function destroy(guildId: string): void {
	const connection = audioPlayers.get(guildId)?.playable.find((connection) => connection.joinConfig.guildId == guildId);

	if (connection) {
		connection.destroy();
	}
	audioPlayers.get(guildId)?.stop();
}

/**
 * Play something in the bot.
 * @param interaction - The interaction that caused this command.
 * @param connection - The connection currently in use.
 */
export function play(interaction: CommandInteraction, connection: VoiceConnection): void {
	// Check the guild just in case.
	if (interaction.guild == null) return;

	// If we don't have an audio player, we make one.
	// AudioPlayers are meant to be reused.
	if (audioPlayers.get(interaction.guild.id) == undefined) {
		init(interaction.guild.id);
	}

	// Get the audioPlayer from the Collection.
	const audioPlayer = audioPlayers.get(interaction.guild.id) as AudioPlayer;
	// We shift the queue here so that we know what the current song is.
	queueManager.shiftQueue(interaction.guild.id);

	// Base case for recursion.
	if (
		(queueManager.getQueue(interaction.guild.id) == undefined || queueManager.getQueue(interaction.guild.id)?.length == 0) &&
		queueManager.getCurrentSong(interaction.guild.id) == undefined
	) {
		setTimeout(async function leave() {
			// We test again to make sure there's no songs in queue or in the current song.
			if (
				// The guild should be in the interaction, since it was sent from a voic channel.
				// Also it was checked above.
				(queueManager.getQueue((interaction.guild as Guild).id) == undefined ||
					queueManager.getQueue((interaction.guild as Guild).id)?.length == 0) &&
				queueManager.getCurrentSong((interaction.guild as Guild).id) == undefined
			) {
				if (interaction.channel) {
					await interaction.channel.send({ content: "Nothing in queue, leaving channel." });
				}
				connection.destroy();
			}
		}, 10000);
	} else {
		audioPlayer?.play(queueManager.getCurrentSong(interaction.guild.id) as AudioResource); // We've check that the current song isn't undefined above.
		connection.subscribe(audioPlayer);

		// We only want to attach one listener to the audioPlayer.
		if (!(audioPlayer?.listenerCount(AudioPlayerStatus.Idle) > 0)) {
			audioPlayer?.once(AudioPlayerStatus.Idle, function playNextSong() {
				play(interaction, connection);
			});
		}
	}
}

/**
 * Get the audioPlayer for the guild.
 * @param guildId - The guild's ID from discord.
 */
export function getPlayer(guildId: string): AudioPlayer | undefined {
	return audioPlayers.get(guildId);
}

/**
 * Set the volume of the current audioResource.
 * @param guildId - The guild's ID from discord.
 * @param  volume - The percent that you want the volume to be in integer form.
 */
export function setVolume(guildId: string, volume: number): void {
	queueManager.getCurrentSong(guildId)?.volume?.setVolume(volume / 100);
}

/**
 * Get the volume of the current song.
 * @param guildId - The guild's ID from discord.
 * @returns The volume as a number.
 */
export function getVolume(guildId: string): number | undefined {
	return queueManager.getCurrentSong(guildId)?.volume?.volume;
}
