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

      this.hasMany(models.MechanicalServiceImage, {
        foreignKey: "formId",
        targetKey: "mcsId",
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

      basket: {
        type: DataTypes.STRING,
      },

      team: {
        type: DataTypes.ENUM("1", "2", "3", "4"),
      },

      status: {
        type: DataTypes.ENUM("NO_REPAIR", "WAIT_APPROVAL", "SENT_FOR_REPAIR"),
      },

      data: {
        type: DataTypes.JSON,
        allowNull: false,
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
