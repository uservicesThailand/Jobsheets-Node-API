"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class InsulationTest extends Model {
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
  InsulationTest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      volt: {
        type: DataTypes.DECIMAL(10, 2),
      },

      incomingValue: {
        type: DataTypes.DECIMAL(10, 2),
        field: "incoming_value",
      },

      incomingUnit: {
        type: DataTypes.ENUM("Ω", "kΩ", "MΩ", "GΩ"),
        field: "incoming_unit",
      },

      finalValue: {
        type: DataTypes.DECIMAL(10, 2),
        field: "final_value",
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
      modelName: "InsulationTest",
      tableName: "insulation_test",
      underscored: true,
    }
  );
  return InsulationTest;
};
