"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FormCoilBrakeTest extends Model {
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
  FormCoilBrakeTest.init(
    {
      cbtId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "cbt_id",
      },

      inspSv: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "insp_sv",
      },

      frame: {
        type: DataTypes.STRING,
      },

      type: {
        type: DataTypes.STRING,
      },

      manufacture: {
        type: DataTypes.STRING,
      },

      model: {
        type: DataTypes.STRING,
      },

      powerValue: {
        type: DataTypes.DECIMAL(10, 2),
        field: "power_value",
      },

      powerUnit: {
        type: DataTypes.ENUM("KW", "HP", "NM"),
        field: "power_unit",
      },

      speedValue: {
        type: DataTypes.DECIMAL(10, 2),
        field: "speed_value",
      },

      speedUnit: {
        type: DataTypes.ENUM("RPM", "POLE"),
        field: "speed_unit",
      },

      serialNo: {
        type: DataTypes.STRING,
        field: "serial_no",
      },

      insulationClass: {
        type: DataTypes.STRING,
        field: "insulation_class",
      },

      design: {
        type: DataTypes.STRING,
      },

      frequency: {
        type: DataTypes.DECIMAL(10, 2),
      },

      current: {
        type: DataTypes.DECIMAL(10, 2),
      },

      volt: {
        type: DataTypes.DECIMAL(10, 2),
      },

      year: {
        type: DataTypes.INTEGER,
      },

      pe: {
        type: DataTypes.STRING,
      },

      eff: {
        type: DataTypes.DECIMAL(10, 2),
      },

      ip: {
        type: DataTypes.STRING,
      },

      weight: {
        type: DataTypes.DECIMAL(10, 2),
      },

      cos: {
        type: DataTypes.DECIMAL(10, 2),
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
      modelName: "FormCoilBrakeTest",
      tableName: "form_coil_brake_test",
      underscored: true,
    }
  );
  return FormCoilBrakeTest;
};
