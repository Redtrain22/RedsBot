import { Client, CommandInteraction, Message, MessageEmbed } from "discord.js";

async function run(client: Client, interaction: CommandInteraction): Promise<void> {
	function msToTime(ms: number) {
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

	const ping = new MessageEmbed().setTitle("〽️ Ping!");

	const message = (await interaction.reply({ embeds: [ping], fetchReply: true })) as Message;

	const pong = new MessageEmbed().setTitle("📶 Pong!").setTimestamp().setDescription(`
	  **Response Time**: ${message.createdAt.getMilliseconds() - interaction.createdAt.getMilliseconds()} ms
	  **WebSocket Ping** ${Math.round(client.ws.ping)} ms
	  **Uptime** ${msToTime(client.uptime as number)}
	`);

	await interaction.editReply({ embeds: [pong] });
}

const help = {
	name: "ping",
	description: "Ping... Pong!",
	options: [],
	aliases: [""],
	level: "User",
};

const config = {
	enabled: true,
};

export { run, help, config };
