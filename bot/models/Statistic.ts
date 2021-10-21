import { Model, Optional } from "sequelize";

interface StatisticAttributes {
	guildId: string;
	interactionCount: BigInt;
}

type StatisticCreationAttributes = Optional<StatisticAttributes, "interactionCount">;

export class Statistic extends Model<StatisticAttributes, StatisticCreationAttributes> implements StatisticAttributes {
	public guildId!: string;
	public interactionCount: BigInt = 0n;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	add(number = 1): void {
		this.increment("interactionCount", { by: number });
	}
}
