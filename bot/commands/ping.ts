import {
	Client,
	EmbedBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChatInputCommandInteraction,
	AutocompleteInteraction,
	InteractionContextType,
} from "discord.js";
import { Command } from "../types/Command.js";

export async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	function msToTime(ms: number) {
		const days = Math.floor(ms / 86400000); // 24*60*60*1000
		const daysms = ms % 86400000; // 24*60*60*1000
		const hours = Math.floor(daysms / 3600000); // 60*60*1000
		const hoursms = ms % 3600000; // 60*60*1000
		const minutes = Math.floor(hoursms / 60000); // 60*1000
		const minutesms = ms % 60000; // 60*1000
		const sec = Math.floor(minutesms / 1000);

		let str = "";
		if (days) str += `${days.toString()}d`;
		if (hours) str += `${hours.toString()}h`;
		if (minutes) str += `${minutes.toString()}m`;
		if (sec) str += `${sec.toString()}s`;

		return str;
	}

	const ping = new EmbedBuilder().setTitle("〽️ Ping!");

	const message = await interaction.reply({ embeds: [ping], withResponse: true });
	const clientUptime = client.uptime ?? 0;

	const pong = new EmbedBuilder().setTitle("📶 Pong!").setTimestamp().setDescription(`
	  **Response Time (Round Trip)**: ${(message.interaction.createdTimestamp - interaction.createdTimestamp).toString()} ms
	  **WebSocket Ping** ${Math.round(client.ws.ping).toString()} ms
	  **Uptime** ${msToTime(clientUptime)}
	`);

	await interaction.editReply({ embeds: [pong] });
}

export function autocomplete(client: Client, interaction: AutocompleteInteraction): void {
	return;
}
const options = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Ping... Pong!")
	.setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
	.setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);

export const config = {
	enabled: true,
	options,
} satisfies Command["config"];
