"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MechanicalServiceImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.FormMechanicalService, {
        foreignKey: "formId",
        targetKey: "mcsId",
      });
    }
  }
  MechanicalServiceImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "file_name",
      },

      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "file_path",
      },

      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "mime_type",
      },

      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "file_size",
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
      modelName: "MechanicalServiceImage",
      tableName: "mechanical_service_image",
      underscored: true,
    }
  );
  return MechanicalServiceImage;
};
