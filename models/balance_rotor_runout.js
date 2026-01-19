"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BalanceRotorRunout extends Model {
    static associate(models) {
      this.belongsTo(models.BalanceRotor, {
        foreignKey: "balanceRotorId",
        targetKey: "rotorId",
      });
    }
  }

  BalanceRotorRunout.init(
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

      side: {
        type: DataTypes.ENUM("DE", "NDE"),
        allowNull: false,
      },

      point: {
        type: DataTypes.ENUM("A", "B", "C", "D", "E", "F", "G", "H", "I", "J"),
        allowNull: false,
      },

      position: {
        type: DataTypes.ENUM("TOP", "BOTTOM", "LEFT", "RIGHT"),
        allowNull: false,
      },

      value: {
        type: DataTypes.DECIMAL(10, 3),
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
      modelName: "BalanceRotorRunout",
      tableName: "balance_rotor_runout",
      underscored: true,
    }
  );

  return BalanceRotorRunout;
};
