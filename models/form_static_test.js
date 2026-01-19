"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FormStaticTest extends Model {
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
  FormStaticTest.init(
    {
      sttId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "stt_id",
      },

      inspSv: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "insp_sv",
      },

      voltKvdc1: {
        type: DataTypes.DECIMAL(10, 3),
        field: "volt_kvdc_1",
      },

      voltKvdc2: {
        type: DataTypes.DECIMAL(10, 3),
        field: "volt_kvdc_2",
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
      modelName: "FormStaticTest",
      tableName: "form_static_test",
      underscored: true,
    }
  );
  return FormStaticTest;
};
