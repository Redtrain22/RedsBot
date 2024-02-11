import {
	Client,
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
	AutocompleteInteraction,
	EmbedBuilder,
	Collection,
} from "discord.js";
import { Tally } from "../models/Tally.js";
import { TallyRules } from "../models/TallyRules.js";
import { Command } from "../types/Command.js";

export async function run(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
	if (interaction.guild == null) {
		await interaction.reply({ content: "Please run this command inside a guild." });
		return;
	}

	switch (interaction.options.getSubcommand()) {
		case "create":
			await handleRuleCreate(interaction);
			break;

		case "bulkCreate":
			await handleRuleBulkCreate(interaction);
			break;

		case "remove":
			await handleRuleRemove(interaction);
			break;

		case "clear":
			await handleRuleClear(interaction);
			break;

		case "list":
			await handleRuleList(interaction);
			break;

		case "add":
			await handleTallyAdd(interaction);
			break;

		case "total":
			await handleTallyTotal(interaction);
			break;
	}
}

async function handleRuleCreate(interaction: ChatInputCommandInteraction) {
	if (!interaction.guild) return;
	const ruleName = interaction.options.getString("name", true);
	const [guildRules, firstRule] = await TallyRules.findOrCreate({
		where: { guildId: interaction.guild.id },
		defaults: { guildId: interaction.guild.id, rules: `${ruleName}` },
	});

	if (!firstRule) await guildRules.addRule(ruleName);

	await interaction.reply(`Added ${ruleName} to the ruleset`);
}
async function handleRuleBulkCreate(interaction: ChatInputCommandInteraction) {
	if (!interaction.guild) return;
	const input = interaction.options.getString("rules", true);
	const rules = input.split(",");

	for (const rule of rules) {
		const [guildRules, firstRule] = await TallyRules.findOrCreate({
			where: { guildId: interaction.guild.id },
			defaults: { guildId: interaction.guild.id, rules: `${rule}` },
		});

		if (!firstRule) await guildRules.addRule(rule);
	}

	await interaction.reply(`Added the following rules to the ruleset:\n${rules.join("\n")}`);
}

async function handleRuleRemove(interaction: ChatInputCommandInteraction) {
	const ruleName = interaction.options.getString("name", true);
	const guildRules = await TallyRules.findOne({ where: { guildId: interaction.guild?.id } });
	const playerTallies = await Tally.findAll({ where: { guildId: interaction.guild?.id, ruleName } });
	await guildRules?.removeRule(ruleName);

	await interaction.reply(`Removed ${ruleName} to the ruleset.`);

	for (const player of playerTallies) await player.destroy();
}

async function handleRuleClear(interaction: ChatInputCommandInteraction) {
	const ruleName = interaction.options.getString("name", true);
	const guildRules = await TallyRules.findAll({ where: { guildId: interaction.guild?.id } });
	const playerTallies = await Tally.findAll({ where: { guildId: interaction.guild?.id, ruleName } });

	for (const rule of guildRules) await rule.removeRule(ruleName);
	for (const player of playerTallies) await player.destroy();

	await interaction.reply("Removed all rulesets.");
}

async function handleRuleList(interaction: ChatInputCommandInteraction) {
	const guildRules = await TallyRules.findOne({ where: { guildId: interaction.guild?.id } });

	await interaction.reply(`The active rules are as follows:\n${guildRules?.getRules().join(", ") ?? "None"}`);
}

async function handleTallyAdd(interaction: ChatInputCommandInteraction) {
	if (!interaction.guild) return;
	const ruleName = interaction.options.getString("name", true);
	const ruleTally = interaction.options.getInteger("tally") || 1;
	const [playerTally] = await Tally.findOrCreate({
		where: { guildId: interaction.guild?.id, userId: interaction.user.id, ruleName: ruleName },
		defaults: { guildId: interaction.guild.id, userId: interaction.user.id, tallyCount: 0, ruleName },
	});

	playerTally?.add(ruleTally);
	await interaction.reply(`Added ${ruleTally} to ${ruleName}`);
}

async function handleTallyTotal(interaction: ChatInputCommandInteraction) {
	const ruleScores = new Collection<string, { total: number; userId: string }[]>();
	const guildRules = await TallyRules.findOne({ where: { guildId: interaction.guild?.id } });
	const playerTally = await Tally.findAll({ where: { guildId: interaction.guild?.id } });

	playerTally.forEach((player) => {
		const ruleScore = ruleScores.get(player.ruleName) ?? [];
		ruleScore.push({ total: player.tallyCount, userId: player.userId });
		ruleScores.set(player.ruleName, ruleScore);
	});

	const playerEmbed = new EmbedBuilder()
		.setTitle("Tally Total")
		.setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL() ?? undefined });
	let description = "";
	let tallyTotal = 0;

	for (const rule of guildRules?.getRules() ?? []) {
		let totalRuleTally = 0;
		description += `**${rule}**\n\n`;

		const playerTallies = ruleScores.get(rule) ?? [];
		playerTallies.forEach((value) => {
			totalRuleTally += value.total;
			description += `<@${value.userId}>'s tally is: **${value.total}**\n\n`;
		});

		tallyTotal += totalRuleTally;
		description += `The total tally of ${rule} is: ${totalRuleTally}\n\n`;
	}

	playerEmbed.setTitle(`${playerEmbed.data.title ?? ""}: ${tallyTotal}`);
	playerEmbed.setDescription(description);
	await interaction.reply({ embeds: [playerEmbed] });
}

export async function autocomplete(client: Client, interaction: AutocompleteInteraction): Promise<void> {
	if (interaction.guild == null) {
		await interaction.respond([]);
		return;
	}

	const focusedOption = interaction.options.getFocused(true);
	const guildRules = await TallyRules.findOne({ where: { guildId: interaction.guild.id } });
	const filteredRules = guildRules?.getRules().filter((rule) => rule.toLowerCase().startsWith(focusedOption.value.toLowerCase())) ?? [];
	const autocompleteOptions = filteredRules.length > 25 ? filteredRules.slice(0, 25) : filteredRules;

	await interaction.respond(autocompleteOptions.map((choice) => ({ name: choice, value: choice })));
}

const options = new SlashCommandBuilder()
	.setName("tally")
	.setDescription("Set rules for a guild or add a tally to a rule.")
	.addSubcommandGroup((subCommandGroup) =>
		subCommandGroup
			.setName("rules")
			.setDescription("Commands related to rules.")
			.addSubcommand((subCommand) =>
				subCommand
					.setName("create")
					.setDescription("Add a rule to the tally counter")
					.addStringOption((option) => option.setName("name").setDescription("Name of rule to add.").setRequired(true))
			)
			.addSubcommand((subCommand) =>
				subCommand
					.setName("bulkCreate")
					.setDescription("Add a rule to the tally counter")
					.addStringOption((option) => option.setName("rules").setDescription("A list of rules separated by commas to add.").setRequired(true))
			)
			.addSubcommand((subCommand) =>
				subCommand
					.setName("remove")
					.setDescription("Remove a rule from the tally counter")
					.addStringOption((option) => option.setName("name").setDescription("Name of rule to remove.").setRequired(true).setAutocomplete(true))
			)
			.addSubcommand((subCommand) => subCommand.setName("list").setDescription("List the active rules."))
			.addSubcommand((subCommand) => subCommand.setName("clear").setDescription("Clear the active rules."))
	)
	.addSubcommand((subCommand) =>
		subCommand
			.setName("add")
			.setDescription("Add a number to the tally. Defaults to 1")
			.addStringOption((option) =>
				option.setName("name").setDescription("The rule to add a tally to. Must be provided").setRequired(true).setAutocomplete(true)
			)
			.addIntegerOption((option) => option.setName("tally").setDescription("Number of tallies to add, defaults to 1."))
	)
	.addSubcommand(
		(subCommand) => subCommand.setName("total").setDescription("List the tally out.")
		// .addStringOption((option) => option.setName("ruleName").setDescription("The rule to list a tally to. Must be provided").setAutocomplete(true))
		// .addIntegerOption((option) => option.setName("tally").setDescription("Number of tallies to add, defaults to 1."))
	)
	.setDMPermission(false)
	.setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);

export const config = {
	enabled: true,
	options,
} satisfies Command["config"];
