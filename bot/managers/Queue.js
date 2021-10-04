const { Collection } = require("discord.js");

const queue = new Collection();
const currentSong = new Collection();

/**
 * Remove everything from the guild's queue.
 * @param {BigInt} guildId - The guild's ID from discord.
 */
function destroy(guildId) {
	queue.delete(guildId);
	currentSong.delete(guildId);
}

/**
 * Add a song to the queue.
 * @param {BigInt} guildId - The guild's ID from discord.
 * @param {String} song - A string that's a YouTube URL.
 */
function addSong(guildId, song) {
	queue.set(guildId, queue.get(guildId) ? queue.get(guildId).concat(song) : [song]);
}

/**
 * Shift the queue over one value.
 * @param {BigInt} guildId - The guild's ID from discord.
 */
function shiftQueue(guildId) {
	currentSong.set(guildId, queue.get(guildId).shift());
}

/**
 * Get the next song from the queue.
 * @param {BigInt} guildId - The guild's ID from discord.
 * @returns The next song in queue.
 */
function getNextSong(guildId) {
	return queue.get(guildId)[0];
}

/**
 * Get the current song in the queue.
 * @param {BigInt} guildId - The guild's ID from discord.
 * @returns {import("@discordjs/voice").AudioResource} The current song.
 */
function getCurrentSong(guildId) {
	return currentSong.get(guildId);
}

/**
 * Get the queue.
 * @param {BigInt} guildId - The guild's ID from discord.
 * @returns {import("discord.js").Collection} An array containing all the queued items.
 */
function getQueue(guildId) {
	return queue.get(guildId);
}

module.exports = {
	destroy,
	addSong,
	shiftQueue,
	getNextSong,
	getCurrentSong,
	getQueue,
};
