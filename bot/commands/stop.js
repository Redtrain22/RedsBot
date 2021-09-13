const playerManager = require("../managers/Player.js");
const queueManager = require("../managers/Queue.js");

exports.run = async (client, interaction) => {
	playerManager.destroy(interaction.guild.id);
	queueManager.destroy(interaction.guild.id);
	await interaction.reply({ content: "Left the channel and cleared the queue." });
};

exports.help = {
	name: "stop",
	description: "Stops the bot from playing music and clears the queue.",
	options: [],
	aliases: [""],
	level: "User",
};

exports.config = {
	enabled: true,
};
