"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BalanceRotorRunoutResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.BalanceRotor, {
        foreignKey: "balanceRotorId",
        targetKey: "rotorId",
      });
    }
  }
  BalanceRotorRunoutResult.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      phase: {
        type: DataTypes.ENUM("BEFORE", "AFTER"),
        allowNull: false,
      },

      result: {
        type: DataTypes.ENUM("NORMAL", "OVER_LIMIT"),
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updated_at",
      },
    },
    {
      sequelize,
      modelName: "BalanceRotorRunoutResult",
      tableName: "balance_rotor_runout_result",
    }
  );
  return BalanceRotorRunoutResult;
};
