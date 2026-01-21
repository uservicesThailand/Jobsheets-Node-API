"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StaticTestResistance extends Model {
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
  StaticTestResistance.init(
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

      value1: {
        type: DataTypes.DECIMAL(10, 3),
        field: "value_1",
      },

      value2: {
        type: DataTypes.DECIMAL(10, 3),
        field: "value_2",
      },

      value3: {
        type: DataTypes.DECIMAL(10, 3),
        field: "value_3",
      },

      unit: {
        type: DataTypes.STRING(5),
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
      modelName: "StaticTestResistance",
      tableName: "static_test_resistance",
      underscored: true,
    },
  );
  return StaticTestResistance;
};
