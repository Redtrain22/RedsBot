const { Model } = require("sequelize");

class Statistic extends Model {
	/**
	 * Add a number to the interactionCount.
	 * @param {BigInt} number - The number to add to the statistic.
	 */
	add(number = 1) {
		this.increment("interactionCount", { by: number });
	}
}

module.exports = (sequelize, DataTypes) => {
	Statistic.init(
		{
			guildId: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			interactionCount: {
				type: DataTypes.BIGINT,
				defaultValue: 0,
			},
		},
		{ sequelize: sequelize, modelName: "Statistic" }
	);

	return Statistic;
};
