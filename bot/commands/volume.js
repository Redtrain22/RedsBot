const playerManager = require("../managers/Player.js");

exports.run = async (client, interaction) => {
	const volume = interaction.options.get("volume")?.value;

	if (volume) {
		playerManager.setVolume(interaction.guild.id, volume);
		return await interaction.reply({ content: `Set volume to ${volume}` });
	} else {
		return await interaction.reply({ content: `Current Volume: ${playerManager.getVolume(interaction.guild.id) * 100}` });
	}
};

exports.help = {
	name: "volume",
	description: "Shows or edits the current volume.",
	options: [
		{
			type: "INTEGER",
			name: "volume",
			description: "The volume number.",
			required: false,
		},
	],
	aliases: [""],
	level: "User",
};

exports.config = {
	enabled: true,
};
