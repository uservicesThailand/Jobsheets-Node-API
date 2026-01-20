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

      section_type: {
        type: DataTypes.ENUM("INCOMING", "FINAL"),
      },

      ambient_temperature: {
        type: DataTypes.DECIMAL(5, 2),
      },

      section_type: {
        type: DataTypes.ENUM(
          "N/A",
          "GOOD",
          "GROUND",
          "SHORT_TURN",
          "SHORT_PHASE",
        ),
      },

      circuit_type: {
        type: DataTypes.ENUM("A", "DELTA", "STAR", "3_LINE", "STAR_DELTA"),
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
