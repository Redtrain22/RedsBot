import { ChatInputCommandInteraction, Client, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	const sides = interaction.options.getInteger("sides", true);
	let amount = interaction.options.getInteger("amount") || 1;
	const advantage = interaction.options.getBoolean("advantage") || false;
	const disadvantage = interaction.options.getBoolean("disadvantage") || false;
	const additive = interaction.options.getInteger("additive") || 0;

	const rolls = [];

	if (advantage || disadvantage) {
		// Reassign amount if there's advantage or disadvantage.
		amount = 2;
	}

	for (let i = 0; i < amount; i++) {
		rolls.push(Math.floor(Math.random() * sides + 1));
	}

	const formattedRolls = [];

	// Formatting is mainly done here.
	if (advantage) {
		if (rolls[0] >= rolls[1]) {
			formattedRolls.push(`(ADV) **${rolls[0]}**, ~~${rolls[1]}~~`);
			// Drop the roll from rolls so our total at the output is correct.
			rolls.pop();
		} else {
			formattedRolls.push(`(ADV) ~~${rolls[0]}~~, **${rolls[1]}**`);
			// Drop the roll from rolls so our total at the output is correct.
			rolls.shift();
		}
	} else if (disadvantage) {
		if (rolls[0] >= rolls[1]) {
			formattedRolls.push(`(DIS) ~~${rolls[0]}~~, **${rolls[1]}**`);
			// Drop the roll from rolls so our total at the output is correct.
			rolls.shift();
		} else {
			formattedRolls.push(`(DIS) **${rolls[0]}**, ~~${rolls[1]}~~`);
			// Drop the roll from rolls so our total at the output is correct.
			rolls.pop();
		}
	} else {
		for (const roll of rolls) {
			formattedRolls.push(roll == 1 || roll == sides ? `**${roll}**` : `${roll}`);
		}
	}

	// Give our rolls to the user, the rest of the formatting is done here.
	await interaction.reply({
		content: `d${sides}x${amount}: [${formattedRolls.join(", ")}]${additive > 0 ? ` + ${additive}` : ""}\n\nTotal: ${rolls.reduce(
			(total: number, rollResult: number) => total + rollResult,
			additive
		)}`,
	});
}

const name = "dice";
const enabled = true;
const guildOnly = false;
const description = "Roll a die or roll several dice.";
const defaultPermission = PermissionFlagsBits.UseApplicationCommands;
const options = new SlashCommandBuilder()
	.setName(name)
	.setDescription(description)
	.addIntegerOption((option) => option.setName("sides").setDescription("Number of sides the di(c)e will have.").setRequired(true))
	.addIntegerOption((option) => option.setName("amount").setDescription("The amount of di(c)e to roll.").setRequired(false))
	.addIntegerOption((option) => option.setName("additive").setDescription("A number to add to the roll").setRequired(false))
	.addBooleanOption((option) => option.setName("advantage").setDescription("Whether the roll has advantage or not.").setRequired(false))
	.addBooleanOption((option) => option.setName("disadvantage").setDescription("Whether the roll has disadvantage or not.").setRequired(false))
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
