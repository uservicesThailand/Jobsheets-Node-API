"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StaticTestInsulation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.FormStaticTest, {
        foreignKey: "staticTestId",
        targetKey: "sttId",
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
  StaticTestInsulation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      sectionType: {
        type: DataTypes.ENUM("INCOMING", "FINAL"),
        field: "section_type",
      },

      voltageVdc: {
        type: DataTypes.INTEGER,
        field: "voltage_vdc",
      },

      marking1: {
        type: DataTypes.STRING,
        field: "marking_1",
      },

      marking2: {
        type: DataTypes.STRING,
        field: "marking_2",
      },

      marking3: {
        type: DataTypes.STRING,
        field: "marking_3",
      },

      at1Value1: {
        type: DataTypes.DECIMAL(10, 3),
        field: "at1_value_1",
      },

      at1Value2: {
        type: DataTypes.DECIMAL(10, 3),
        field: "at1_value_2",
      },

      at1Value3: {
        type: DataTypes.DECIMAL(10, 3),
        field: "at1_value_3",
      },

      at1Unit: {
        type: DataTypes.STRING(5),
        field: "at1_unit",
      },

      at10Value1: {
        type: DataTypes.DECIMAL(10, 3),
        field: "at10_value_1",
      },

      at10Value2: {
        type: DataTypes.DECIMAL(10, 3),
        field: "at10_value_2",
      },

      at10Value3: {
        type: DataTypes.DECIMAL(10, 3),
        field: "at10_value_3",
      },

      at10Unit: {
        type: DataTypes.STRING(5),
        field: "at10_unit",
      },

      minInsulationRec: {
        type: DataTypes.STRING,
        field: "min_insulation_recommend",
      },

      polarizationIndexRec: {
        type: DataTypes.STRING,
        field: "polarization_index_recommend",
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
      modelName: "StaticTestInsulation",
      tableName: "static_test_insulation",
      underscored: true,
    },
  );
  return StaticTestInsulation;
};
