"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CoilBrakeTest extends Model {
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
  CoilBrakeTest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      voltIncoming1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "volt_incoming_1",
      },

      voltIncoming2: {
        type: DataTypes.DECIMAL(10, 2),
        field: "volt_incoming_2",
      },

      voltIncoming3: {
        type: DataTypes.DECIMAL(10, 2),
        field: "volt_incoming_3",
      },

      voltFinal1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "volt_final_1",
      },

      voltFinal2: {
        type: DataTypes.DECIMAL(10, 2),
        field: "volt_final_2",
      },

      voltFinal3: {
        type: DataTypes.DECIMAL(10, 2),
        field: "volt_final_3",
      },

      currentIncoming1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "current_incoming_1",
      },

      currentIncoming2: {
        type: DataTypes.DECIMAL(10, 2),
        field: "current_incoming_2",
      },

      currentIncoming3: {
        type: DataTypes.DECIMAL(10, 2),
        field: "current_incoming_3",
      },

      currentFinal1: {
        type: DataTypes.DECIMAL(10, 2),
        field: "current_final_1",
      },

      currentFinal2: {
        type: DataTypes.DECIMAL(10, 2),
        field: "current_final_2",
      },

      currentFinal3: {
        type: DataTypes.DECIMAL(10, 2),
        field: "current_final_3",
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
      modelName: "CoilBrakeTest",
      tableName: "coil_brake_test",
      underscored: true,
    }
  );
  return CoilBrakeTest;
};
