const commandManager = require("../managers/Commands.js");
const commands = commandManager.getCommands();
const aliases = commandManager.getAliases();
const logger = require("../managers/Logger.js");

module.exports = async (client, interaction) => {
	if (!interaction.isCommand()) return;

	try {
		// Return if it's not a command or alias
		if (!(interaction.commandName || aliases.get(interaction.commandName))) return;

		await commands.get(interaction.commandName || aliases.get(interaction.commandName)).run(client, interaction);
	} catch (error) {
		await interaction.reply({ content: "There was an error executing this, please try again later or contact the bot owner.", ephemeral: true });
		logger.error(error);
	}
};
