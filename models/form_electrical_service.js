"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FormElectricalService extends Model {
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

      this.belongsTo(models.Uuser, {
        foreignKey: "createdBy",
        targetKey: "userKey",
        as: "createdUser",
      });

      this.belongsTo(models.Uuser, {
        foreignKey: "updatedBy",
        targetKey: "userKey",
        as: "updatedUser",
      });
    }
  }
  FormElectricalService.init(
    {
      els_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "mcs_id",
      },

      inspSv: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "insp_sv",
      },

      basket: {
        type: DataTypes.STRING,
      },

      data: {
        type: DataTypes.JSON,
        allowNull: false,
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
      modelName: "FormElectricalService",
      tableName: "form_electrical_services",
      underscored: true,
    }
  );
  return FormElectricalService;
};
