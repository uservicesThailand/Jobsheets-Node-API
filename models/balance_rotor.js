"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BalanceRotor extends Model {
    static associate(models) {
      this.belongsTo(models.FormBalance, {
        foreignKey: "balanceId",
        targetKey: "balId",
      });

      this.hasOne(models.BalanceRotorBalance, {
        foreignKey: "balanceRotorId",
        targetKey: "rotorId",
      });

      this.hasMany(models.BalanceRotorRunoutResult, {
        foreignKey: "balanceRotorId",
        targetKey: "rotorId",
      });

      this.hasMany(models.BalanceRotorRunout, {
        foreignKey: "balanceRotorId",
        targetKey: "rotorId",
      });
    }
  }

  BalanceRotor.init(
    {
      rotorId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "rotor_id",
      },

      balanceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "balance_id",
      },

      rotorType: {
        type: DataTypes.STRING(50),
        field: "rotor_type",
      },

      includeWith: {
        type: DataTypes.STRING(50),
        field: "include_with",
      },

      rotorWeight: {
        type: DataTypes.DECIMAL(10, 2),
        field: "rotor_weight",
      },

      diameterA: {
        type: DataTypes.DECIMAL(10, 2),
        field: "diameter_a",
      },

      diameterB: {
        type: DataTypes.DECIMAL(10, 2),
        field: "diameter_b",
      },

      diameterC: {
        type: DataTypes.DECIMAL(10, 2),
        field: "diameter_c",
      },

      radius1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "radius_1",
      },

      radius2: {
        type: DataTypes.DECIMAL(10, 2),
        field: "radius_2",
      },

      rotorSpeed: {
        type: DataTypes.INTEGER,
        field: "rotor_speed",
      },

      note: {
        type: DataTypes.TEXT,
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
      modelName: "BalanceRotor",
      tableName: "balance_rotor",
      underscored: true,
    }
  );

  return BalanceRotor;
};
