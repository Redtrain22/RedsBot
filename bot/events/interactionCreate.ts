import { getCommands } from "../managers/Commands.js";
const commands = getCommands();
import * as logger from "../managers/Logger.js";
import { ChatInputCommandInteraction, Client, Interaction, InteractionType } from "discord.js";
import { Statistic } from "../managers/Database.js";

const once = false;
const name = "interactionCreate";

const run = async (client: Client, interaction: Interaction): Promise<void> => {
	const guildId = interaction?.guild?.id ?? "0";

	// Fetch or create our statistic
	// The reason statistic is wrapped in [] is because findOrCreate actually outputs 2 variables and we only need the first.
	const [statistic] = await Statistic.findOrCreate({
		where: { guildId: guildId },
		defaults: { guildId: guildId, interactionCount: 0n },
	});

	// Add one to our statistic
	statistic.add();

	// The bot can recieve multiple types of interactions, we switch them then run a handle function.
	// The handle functions exist to break up giant case statements.
	switch (interaction.type) {
		case InteractionType.ApplicationCommand:
			if (!interaction.isChatInputCommand()) return;
			await handleCommand(client, interaction);

			break;
	}
};

async function handleCommand(client: Client, interaction: ChatInputCommandInteraction) {
	try {
		// Run the command.
		const cmd = commands.get(interaction.commandName);
		if (!cmd) return;

		if (!cmd.config.enabled) {
			await interaction.reply({
				content: `Sorry, but the ${interaction.commandName} command is currently disabled. It will be back sometime soon:tm:`,
			});
			return;
		}

		if (cmd.config.guildOnly && !interaction.guild) {
			await interaction.reply({
				content: `Sorry, but the ${interaction.commandName} command can only be run inside a guild. Please run this in a Discord server`,
			});
			return;
		}

		await cmd.run(client, interaction);

		if (!interaction.guild) {
			logger.log(
				`"${interaction.member?.user.username}#${interaction.member?.user.discriminator}" ran command ${interaction.commandName} in DMs`,
				"cmd"
			);
		} else {
			logger.log(
				`"${interaction.member?.user.username}#${interaction.member?.user.discriminator}" ran command ${interaction.commandName} in guild "${interaction.guild?.name}" (${interaction.guild?.id})`,
				"cmd"
			);
		}
	} catch (error) {
		if (interaction.deferred || interaction.replied) {
			await interaction.followUp({
				content: "There was an error executing this, please try again later or contact the bot owner.",
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: "There was an error executing this, please try again later or contact the bot owner.",
				ephemeral: true,
			});
		}
		logger.error(error);
	}
}

export { once, name, run };
