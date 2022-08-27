import { Client, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import * as playerManager from "../managers/Player.js";
import * as queueManager from "../managers/Queue.js";

async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	if (interaction.guild == null) {
		await interaction.reply({ content: "Please run this command inside a guild." });
		return;
	}

	playerManager.destroy(interaction.guild.id);
	queueManager.destroy(interaction.guild.id);
	await interaction.reply({ content: "Left the channel and cleared the queue." });
}

const name = "stop";
const enabled = true;
const guildOnly = true;
const description = "Stops the bot from playing music AND clears the queue.";
const defaultPermission = PermissionFlagsBits.UseApplicationCommands;
const options = new SlashCommandBuilder()
	.setName(name)
	.setDescription(description)
	.setDMPermission(!guildOnly)
	.setDefaultMemberPermissions(defaultPermission);

const config = {
	name,
	enabled,
	guildOnly,
	description,
	defaultPermission,
	options,
};

export { run, config };
