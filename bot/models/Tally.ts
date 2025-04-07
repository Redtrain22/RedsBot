import { Model, InferAttributes, InferCreationAttributes, NonAttribute, CreationOptional } from "sequelize";

export class Tally extends Model<InferAttributes<Tally>, InferCreationAttributes<Tally>> {
	declare guildId: string;
	declare userId: string;
	declare ruleName: string;
	declare tallyCount: number;

	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	async add(number = 1): Promise<NonAttribute<void>> {
		await this.increment("tallyCount", { by: number });
	}
}
