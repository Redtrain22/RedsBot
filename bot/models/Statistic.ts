import { Model, InferAttributes, InferCreationAttributes, NonAttribute, CreationOptional } from "sequelize";

export class Statistic extends Model<InferAttributes<Statistic>, InferCreationAttributes<Statistic>> {
	declare guildId: string;
	declare interactionCount: bigint;

	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;

	add(number = 1): NonAttribute<void> {
		this.increment("interactionCount", { by: number });
	}
}
