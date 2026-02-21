"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BalanceFieldLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.BalanceField, {
        foreignKey: "balanceFieldId",
        targetKey: "id",
      });
    }
  }
  BalanceFieldLocation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      location: {
        type: DataTypes.ENUM("P1", "P2", "P3", "P4"),
        allowNull: false,
      },

      beforeH: {
        type: DataTypes.DECIMAL(10, 3),
        field: "before_h",
      },

      beforeV: {
        type: DataTypes.DECIMAL(10, 3),
        field: "before_v",
      },

      beforeA: {
        type: DataTypes.DECIMAL(10, 3),
        field: "before_a",
      },

      afterH: {
        type: DataTypes.DECIMAL(10, 3),
        field: "after_h",
      },

      afterV: {
        type: DataTypes.DECIMAL(10, 3),
        field: "after_v",
      },

      afterA: {
        type: DataTypes.DECIMAL(10, 3),
        field: "after_a",
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
      modelName: "BalanceFieldLocation",
      tableName: "balance_field_location",
      underscored: true,
    }
  );
  return BalanceFieldLocation;
};
