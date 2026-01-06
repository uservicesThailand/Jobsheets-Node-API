"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FormBalance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.TblInspectionList, {
        foreignKey: "inspId",
        targetKey: "inspId",
      });

      this.hasOne(models.BalanceRotor, { foreignKey: "balId" });
    }
  }
  FormBalance.init(
    {
      balId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "bal_id",
      },

      inspId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "insp_id",
      },

      inspSv: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "insp_sv",
      },

      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "created_by",
      },

      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "updated_by",
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
      modelName: "FormBalance",
      tableName: "form_balance",
    }
  );
  return FormBalance;
};
