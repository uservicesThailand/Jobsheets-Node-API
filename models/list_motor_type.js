"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ListMotorType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ListMotorType.hasMany(models.TblInspectionList, {
        foreignKey: "inspMotorCode",
        sourceKey: "motorCode",
      });
    }
  }
  ListMotorType.init(
    {
      motorCode: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
        field: "motor_code",
      },

      motorName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "motor_name",
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        field: "is_active",
      },
    },
    {
      sequelize,
      modelName: "ListMotorType",
      tableName: "list_motor_type",
      timestamps: false,
    }
  );
  return ListMotorType;
};
