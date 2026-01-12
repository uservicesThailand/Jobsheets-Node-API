"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CoilBrakeTestType extends Model {
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
  CoilBrakeTestType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      brakeTypeCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "brake_type_code",
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
      modelName: "CoilBrakeTestType",
      tableName: "coil_brake_test_type",
      underscored: true,
    }
  );
  return CoilBrakeTestType;
};
