"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StaticTestSection extends Model {
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
  StaticTestSection.init(
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

      ambientTemp: {
        type: DataTypes.DECIMAL(5, 2),
        field: "ambient_temperature",
      },

      surgeWaveform: {
        type: DataTypes.ENUM(
          "N/A",
          "GOOD",
          "GROUND",
          "SHORT_TURN",
          "SHORT_PHASE",
        ),
        field: "surge_waveform",
      },

      circuitType: {
        type: DataTypes.ENUM("A", "DELTA", "STAR", "3_LINE", "STAR_DELTA"),
        field: "circuit_type",
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
      modelName: "StaticTestSection",
      tableName: "static_test_section",
      underscored: true,
    },
  );
  return StaticTestSection;
};
