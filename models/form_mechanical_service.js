"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FormMechanicalService extends Model {
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
    }
  }

  FormMechanicalService.init(
    {
      mcsId: {
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

      createdBy: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        field: "created_by",
      },

      updatedBy: {
        type: DataTypes.INTEGER(11),
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
      modelName: "FormMechanicalService",
      tableName: "form_mechanical_services",
      underscored: true,
    }
  );
  return FormMechanicalService;
};
