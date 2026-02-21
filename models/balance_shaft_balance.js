"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BalanceShaftBalance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.BalanceShaft, {
        foreignKey: "balanceShaftId",
        targetKey: "shaftId",
      });
    }
  }
  BalanceShaftBalance.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      balancingSpeed: {
        type: DataTypes.INTEGER,
        field: "balancing_speed",
      },

      incomingWeightDe: {
        type: DataTypes.DECIMAL(10, 3),
        field: "incoming_weight_de",
      },

      incomingWeightNde: {
        type: DataTypes.DECIMAL(10, 3),
        field: "incoming_weight_nde",
      },

      incomingPhaseDe: {
        type: DataTypes.DECIMAL(10, 3),
        field: "incoming_phase_de",
      },

      incomingPhaseNde: {
        type: DataTypes.DECIMAL(10, 3),
        field: "incoming_phase_nde",
      },

      finalWeightDe: {
        type: DataTypes.DECIMAL(10, 3),
        field: "final_weight_de",
      },

      finalWeightNde: {
        type: DataTypes.DECIMAL(10, 3),
        field: "final_weight_nde",
      },

      finalPhaseDe: {
        type: DataTypes.DECIMAL(10, 3),
        field: "final_phase_de",
      },

      finalPhaseNde: {
        type: DataTypes.DECIMAL(10, 3),
        field: "final_phase_nde",
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
      modelName: "BalanceShaftBalance",
      tableName: "balance_shaft_balance",
      underscored: true,
    }
  );
  return BalanceShaftBalance;
};
