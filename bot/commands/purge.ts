import { ChatInputCommandInteraction, Client, Collection, Message, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";

async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	await interaction.deferReply();
	const numMessges = interaction.options.getInteger("amount", true) + 1;
	const messages = await interaction.channel?.messages.fetch({ limit: numMessges, cache: true });

	if (messages == undefined) {
		await interaction.followUp({ content: "Unable to fetch messages." });
		return;
	}

	const date = new Date(Date.now().valueOf());
	const ageLimit = date.setDate(date.getDate() - 14).valueOf();

	let actualMessages = 0;
	const manualMessages = new Collection<string, Message<boolean>>();

	messages.forEach((message, key) => {
		if (message.interaction?.id == interaction.id) messages.delete(key); // We don't want to delete the message that started it, would throw an Error.
		if (message.createdTimestamp <= ageLimit) {
			messages.delete(key);
			manualMessages.set(key, message);
		} else {
			actualMessages++;
		}
	});

	await (interaction.channel as TextChannel).bulkDelete(messages);

	if (manualMessages.size > 0) {
		for (const key of manualMessages.keys()) {
			await interaction.channel?.messages.delete(key);
			actualMessages++;
		}
	}

	await interaction.followUp({ content: `Cleaned up ${actualMessages - 1} messages.` });
	return;
}

const name = "purge";
const enabled = true;
const guildOnly = true;
const description = "Purge X number of messages from the channel";
const defaultPermission = PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers;
const options = new SlashCommandBuilder()
	.setName(name)
	.setDescription(description)
	.addIntegerOption((option) => option.setName("amount").setDescription("Number of messages to purge").setRequired(true))
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
