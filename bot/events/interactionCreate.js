const { Statistic } = require("../managers/Database.js");
const commandManager = require("../managers/Commands.js");
const commands = commandManager.getCommands();
const logger = require("../managers/Logger.js");

module.exports = async (client, interaction) => {
	// Fetch or create our statistic
	// The reason statistic is wrapped in [] is because findOrCreate actually outputs 2 variables and we only need the first.
	const [statistic] = await Statistic.findOrCreate({
		where: { guildId: interaction.guild.id },
		defaults: { guildId: interaction.guild.id },
	});

	// Add one to our statistic
	statistic.add();

	// Check if the interaction is a command or not.
	if (interaction.isCommand()) {
		try {
			// Return if it's not a command.
			if (!commands.get(interaction.commandName)) return;

			// Run the command.
			await commands.get(interaction.commandName).run(client, interaction);

			logger.log(
				`"${interaction.member.user.username}#${interaction.member.user.discriminator} ran command ${interaction.commandName} in guild "${interaction.guild.name}" (${interaction.guild.id})`,
				"cmd"
			);
		} catch (error) {
			await interaction.reply({ content: "There was an error executing this, please try again later or contact the bot owner.", ephemeral: true });
			logger.error(error);
		}
	}
};
