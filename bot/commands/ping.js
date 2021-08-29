const { MessageEmbed } = require("discord.js");

exports.run = async (client, interaction) => {
	function msToTime(ms) {
		const days = Math.floor(ms / 86400000); // 24*60*60*1000
		const daysms = ms % 86400000; // 24*60*60*1000
		const hours = Math.floor(daysms / 3600000); // 60*60*1000
		const hoursms = ms % 3600000; // 60*60*1000
		const minutes = Math.floor(hoursms / 60000); // 60*1000
		const minutesms = ms % 60000; // 60*1000
		const sec = Math.floor(minutesms / 1000);

		let str = "";
		if (days) str += `${days}d`;
		if (hours) str += `${hours}h`;
		if (minutes) str += `${minutes}m`;
		if (sec) str += `${sec}s`;

		return str;
	}

	const embed = new MessageEmbed().setTitle("〽️ Ping!");

	const message = await interaction.reply({ embeds: [embed] });

	embed.setTitle("📶 Pong!").setTimestamp().setDescription(`
    **Ping**: ${message.createdAt - interaction.createdAt} ms
    **API** ${Math.round(client.ws.ping)} ms
    **Uptime** ${msToTime(client.uptime)}
  `);

	await interaction.editReply({ embeds: [embed] });
};

exports.help = {
	name: "ping",
	description: "Ping... Pong!",
	aliases: [""],
	level: "User",
};

exports.config = {
	enabled: true,
};
