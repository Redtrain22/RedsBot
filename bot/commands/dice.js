exports.run = async (client, interaction) => {
	// Don't need to use option chaining because this option is required.
	const sides = interaction.options.get("sides").value;
	let amount = interaction.options.get("amount")?.value || 1;
	const advantage = interaction.options.get("advantage")?.value;
	const disadvantage = interaction.options.get("disadvantage")?.value;
	const additive = interaction.options.get("additive")?.value || 0;

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
	return await interaction.reply({
		content: `d${sides}x${amount}: [${formattedRolls.join(", ")}]${additive > 0 ? ` + ${additive}` : ""}\n\nTotal: ${rolls.reduce(
			(total, rollResult) => total + rollResult,
			additive
		)}`,
	});
};

exports.help = {
	name: "dice",
	description: "Roll a die or roll several dice.",
	options: [
		{
			type: "INTEGER",
			name: "sides",
			description: "Number of sides the di(c)e will have.",
			required: true,
		},
		{
			type: "INTEGER",
			name: "amount",
			description: "The amount of di(c)e to roll.",
			required: false,
		},
		{
			type: "BOOLEAN",
			name: "advantage",
			description: "Whether the roll has advantage or not.",
			required: false,
		},
		{
			type: "BOOLEAN",
			name: "disadvantage",
			description: "Whether the roll has disadvantage or not.",
			required: false,
		},
		{
			type: "INTEGER",
			name: "additive",
			description: "A number to add to the roll",
			required: false,
		},
	],
	aliases: [""],
	level: "User",
};

exports.config = {
	enabled: true,
};
