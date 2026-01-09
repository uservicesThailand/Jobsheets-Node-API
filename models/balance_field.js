"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BalanceField extends Model {
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

      this.hasMany(models.BalanceFieldPosition, {
        foreignKey: "balanceFieldId",
        targetKey: "id",
      });
    }
  }
  BalanceField.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      check_result: {
        type: DataTypes.ENUM("C1", "C2", "C3", "C4"),
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
      modelName: "BalanceField",
      tableName: "balance_field",
      underscored: true,
    }
  );
  return BalanceField;
};
