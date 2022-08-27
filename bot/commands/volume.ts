import { Client, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import * as playerManager from "../managers/Player.js";

async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	const volume = interaction.options.getInteger("volume");

	if (interaction.guild == null) {
		await interaction.reply({ content: "Please run this command from a guild." });
		return;
	}

	if (volume) {
		playerManager.setVolume(interaction.guild.id, volume);
		await interaction.reply({ content: `Set volume to ${volume}` });
		return;
	} else {
		await interaction.reply({ content: `Current Volume: ${playerManager.getVolume(interaction.guild.id) || 0.5 * 100}` });
		return;
	}
}

const name = "volume";
const enabled = true;
const guildOnly = true;
const description = "Shows or edits the current volume.";
const defaultPermission = PermissionFlagsBits.UseApplicationCommands;
const options = new SlashCommandBuilder()
	.setName(name)
	.setDescription(description)
	.addIntegerOption((option) => option.setName("volume").setDescription("The volume expressed as a percentage").setRequired(false))
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
