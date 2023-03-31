import { Model, InferAttributes, InferCreationAttributes, NonAttribute, CreationOptional } from "sequelize";

export class TallyRules extends Model<InferAttributes<TallyRules>, InferCreationAttributes<TallyRules>> {
	declare guildId: string;
	declare rules: string;

	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	async addRule(rule: string): Promise<NonAttribute<void>> {
		const rulesArr = this.rules.split("\0");
		rulesArr.push(rule);
		this.rules = rulesArr.join("\0");

		await this.save();
	}

	async removeRule(rule: string): Promise<NonAttribute<void>> {
		const rulesArr = this.rules.split("\0");
		rulesArr.splice(rulesArr.indexOf(rule), 1);
		this.rules = rulesArr.join("\0");

		if (rulesArr.indexOf("") != -1) rulesArr.splice(rulesArr.indexOf(""), 1);

		await this.save();
	}

	getRules(): NonAttribute<string[]> {
		return this.rules.split("\0");
	}
}
