import { AudioResource } from "@discordjs/voice";
import { Collection } from "discord.js";
import { PlayerMetadata } from "../types/PlayerMetadata";

const queue = new Collection<string, AudioResource<PlayerMetadata>[]>();
const currentSong = new Collection<string, AudioResource<PlayerMetadata> | undefined>();

/**
 * Remove everything from the guild's queue.
 * @param guildId - The guild's ID from discord.
 */
export function destroy(guildId: string): void {
	queue.delete(guildId);
	currentSong.delete(guildId);
}

/**
 * Add a song to the queue.
 * @param guildId - The guild's ID from discord.
 * @param song - A string that's a YouTube URL.
 */
export function addSong(guildId: string, song: AudioResource<PlayerMetadata>): void {
	if (queue.get(guildId) == undefined) {
		queue.set(guildId, [song]);
	} else {
		queue.get(guildId)?.concat(song);
	}
}

/**
 * Shift the queue over one value.
 * @param guildId - The guild's ID from discord.
 */
export function shiftQueue(guildId: string): void {
	currentSong.set(guildId, queue.get(guildId)?.shift());
}

/**
 * Get the next song from the queue.
 * @param guildId - The guild's ID from discord.
 * @returns The next song in queue.
 */
export function getNextSong(guildId: string): AudioResource<PlayerMetadata> | undefined {
	return queue.get(guildId)?.[0];
}

/**
 * Get the current song in the queue.
 * @param guildId - The guild's ID from discord.
 * @returns The current song.
 */
export function getCurrentSong(guildId: string): AudioResource<PlayerMetadata> | undefined {
	return currentSong.get(guildId);
}

/**
 * Get the queue.
 * @param guildId - The guild's ID from discord.
 * @returns An array containing all the queued items.
 */
export function getQueue(guildId: string): AudioResource<PlayerMetadata>[] | undefined {
	return queue.get(guildId);
}
