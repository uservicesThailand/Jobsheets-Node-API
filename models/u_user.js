"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Uuser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.FormBalance, {
        foreignKey: "createdBy",
        targetKey: "userKey",
        as: "createdFormBalances",
      });

      this.hasMany(models.FormBalance, {
        foreignKey: "updatedBy",
        targetKey: "userKey",
        as: "updatedFormBalances",
      });

      this.hasMany(models.FormElectricalService, {
        foreignKey: "createdBy",
        targetKey: "userKey",
        as: "createdElectrical",
      });

      this.hasMany(models.FormElectricalService, {
        foreignKey: "updatedBy",
        targetKey: "userKey",
        as: "updatedElectrical",
      });
    }
  }
  Uuser.init(
    {
      userKey: {
        type: DataTypes.INTEGER(5),
        primaryKey: true,
        autoIncrement: true,
        field: "user_key",
      },

      name: {
        type: DataTypes.STRING(64),
      },

      lastname: {
        type: DataTypes.STRING(64),
      },

      username: {
        type: DataTypes.STRING(64),
      },

      password: {
        type: DataTypes.STRING(100),
      },

      userPhoto: {
        type: DataTypes.STRING(128),
        field: "user_photo",
      },

      userClass: {
        type: DataTypes.TINYINT(1),
        field: "user_class",
      },

      bedView: {
        type: DataTypes.STRING(64),
        field: "bed_view",
      },

      userLanguage: {
        type: DataTypes.STRING(8),
        field: "user_language",
      },

      uEmail: {
        type: DataTypes.STRING(128),
        field: "u_email",
      },

      userStatus: {
        type: DataTypes.TINYINT(1),
        field: "user_status",
      },

      userType: {
        type: DataTypes.STRING(32),
        field: "user_type",
      },

      uDepartment: {
        type: DataTypes.STRING(32),
        field: "u_department",
      },

      branchLog: {
        type: DataTypes.STRING(32),
        field: "branch_log",
      },

      uAddDate: {
        type: DataTypes.DATE,
        field: "u_add_date",
      },

      uAddBy: {
        type: DataTypes.STRING(45),
        field: "u_add_by",
      },
    },
    {
      sequelize,
      modelName: "Uuser",
      tableName: "u_user",
      underscored: true,
      timestamps: false,
    }
  );
  return Uuser;
};
