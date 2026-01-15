"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BalanceShaft extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.FormBalance, {
        foreignKey: "balanceId",
        targetKey: "balId",
      });

      this.hasOne(models.BalanceShaftBalance, {
        foreignKey: "balanceShaftId",
        targetKey: "shaftId",
      });
    }
  }
  BalanceShaft.init(
    {
      shaftId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "shaft_id",
      },

      rotorWeight: {
        type: DataTypes.DECIMAL(10, 3),
        field: "rotor_weight",
      },

      diameterA: {
        type: DataTypes.DECIMAL(10, 3),
        field: "diameter_a",
      },

      diameterB: {
        type: DataTypes.DECIMAL(10, 3),
        field: "diameter_b",
      },

      diameterC: {
        type: DataTypes.DECIMAL(10, 3),
        field: "diameter_c",
      },

      radius1: {
        type: DataTypes.DECIMAL(10, 3),
        field: "radius_1",
      },

      radius2: {
        type: DataTypes.DECIMAL(10, 3),
        field: "radius_2",
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
      modelName: "BalanceShaft",
      tableName: "balance_shaft",
      underscored: true,
    }
  );
  return BalanceShaft;
};
