"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BalanceFieldPosition extends Model {
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
  BalanceFieldPosition.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      positionName: {
        type: DataTypes.STRING(50),
        field: "position_name",
      },

      positionIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "position_index",
      },

      beforeUnbalance: {
        type: DataTypes.DECIMAL(10, 2),
        field: "before_unbalance",
      },

      beforeDegree1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "before_degree_1",
      },

      beforeWeight: {
        type: DataTypes.DECIMAL(10, 2),
        field: "before_weight",
      },

      beforeDegree2: {
        type: DataTypes.DECIMAL(10, 2),
        field: "before_degree_2",
      },

      afterUnbalance: {
        type: DataTypes.DECIMAL(10, 2),
        field: "after_unbalance",
      },

      afterDegree1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "after_degree_1",
      },

      afterWeight: {
        type: DataTypes.DECIMAL(10, 2),
        field: "after_weight",
      },

      afterDegree1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "after_degree_2",
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
      modelName: "BalanceFieldPosition",
      tableName: "balance_field_position",
      underscored: true,
    }
  );
  return BalanceFieldPosition;
};
