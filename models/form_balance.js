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
      FormBalance.belongsTo(models.TblInspectionList, {
        foreignKey: "inspId",
        targetKey: "inspId",
      });
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
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },

      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "FormBalance",
      tableName: "form_balance",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );
  return FormBalance;
};
