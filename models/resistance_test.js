"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ResistanceTest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.FormCoilBrakeTest, {
        foreignKey: "coilBrakeTestId",
        targetKey: "cbtId",
      });
    }
  }
  ResistanceTest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      marking1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "marking_1",
      },

      marking2: {
        type: DataTypes.DECIMAL(10, 2),
        field: "marking_2",
      },

      marking3: {
        type: DataTypes.DECIMAL(10, 2),
        field: "marking_3",
      },

      incoming1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "incoming_1",
      },

      incoming2: {
        type: DataTypes.DECIMAL(10, 2),
        field: "incoming_2",
      },

      incoming3: {
        type: DataTypes.DECIMAL(10, 2),
        field: "incoming_3",
      },

      incomingUnit: {
        type: DataTypes.ENUM("Ω", "kΩ", "MΩ", "GΩ"),
        field: "incoming_unit",
      },

      final1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "final_1",
      },

      final2: {
        type: DataTypes.DECIMAL(10, 2),
        field: "final_2",
      },

      final3: {
        type: DataTypes.DECIMAL(10, 2),
        field: "final_3",
      },

      finalUnit: {
        type: DataTypes.ENUM("Ω", "kΩ", "MΩ", "GΩ"),
        field: "final_unit",
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
      modelName: "ResistanceTest",
      tableName: "resistance_test",
      underscored: true,
    }
  );
  return ResistanceTest;
};
