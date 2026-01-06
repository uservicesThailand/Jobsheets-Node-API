"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BalanceRotorBalance extends Model {
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
  BalanceRotorBalance.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      incomingWeightDe: {
        type: DataTypes.DECIMAL(10, 2),
        field: "incoming_weight_de",
      },

      incomingAngleDe: {
        type: DataTypes.DECIMAL(10, 2),
        field: "incoming_angle_de",
      },

      incomingWeightNde: {
        type: DataTypes.DECIMAL(10, 2),
        field: "incoming_weight_nde",
      },

      incomingAngleNde: {
        type: DataTypes.DECIMAL(10, 2),
        field: "incoming_angle_nde",
      },

      finalWeightDe: {
        type: DataTypes.DECIMAL(10, 2),
        field: "final_weight_de",
      },

      finalAngleDe: {
        type: DataTypes.DECIMAL(10, 2),
        field: "final_angle_de",
      },

      finalWeightNde: {
        type: DataTypes.DECIMAL(10, 2),
        field: "final_weight_nde",
      },

      finalAngleNde: {
        type: DataTypes.DECIMAL(10, 2),
        field: "final_angle_nde",
      },

      stdToleranceDe: {
        type: DataTypes.DECIMAL(10, 2),
        field: "std_tolerance_de",
      },

      stdToleranceNde: {
        type: DataTypes.DECIMAL(10, 2),
        field: "std_tolerance_nde",
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
      modelName: "BalanceRotorBalance",
      tableName: "balance_rotor_balance",
    }
  );
  return BalanceRotorBalance;
};
