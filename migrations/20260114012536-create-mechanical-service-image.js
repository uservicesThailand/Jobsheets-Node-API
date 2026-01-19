"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("mechanical_service_image", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      form_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "form_mechanical_services",
          key: "mcs_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      file_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      file_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      mime_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      file_size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex(
      "mechanical_service_image",
      ["form_id", "file_name"],
      {
        unique: true,
        name: "idx_mechanical_service_image_form_id_file_name",
      }
    );

    await queryInterface.addIndex("mechanical_service_image", ["form_id"], {
      name: "idx_mechanical_service_image_form_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("mechanical_service_image");
  },
};
