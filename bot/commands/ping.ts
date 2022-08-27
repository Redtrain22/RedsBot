import { Client, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from "discord.js";

async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
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

	const ping = new EmbedBuilder().setTitle("〽️ Ping!");

	const message = (await interaction.reply({ embeds: [ping], fetchReply: true })) as Message;

	const pong = new EmbedBuilder().setTitle("📶 Pong!").setTimestamp().setDescription(`
	  **Response Time (Round Trip)**: ${message.createdTimestamp - interaction.createdTimestamp} ms
	  **WebSocket Ping** ${Math.round(client.ws.ping)} ms
	  **Uptime** ${msToTime(client.uptime as number)}
	`);

	await interaction.editReply({ embeds: [pong] });
}

const name = "ping";
const enabled = true;
const guildOnly = true;
const description = "Ping... Pong!";
const defaultPermission = PermissionFlagsBits.UseApplicationCommands;
const options = new SlashCommandBuilder().setName(name).setDescription(description).setDefaultMemberPermissions(defaultPermission);

const config = {
	name,
	enabled,
	guildOnly,
	description,
	defaultPermission,
	options,
};

export { run, config };
