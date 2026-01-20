"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("static_test_section", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      static_test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "form_static_test",
          key: "stt_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      section_type: {
        type: Sequelize.ENUM("INCOMING", "FINAL"),
      },

      ambient_temperature: {
        type: Sequelize.DECIMAL(10, 3),
      },

      section_type: {
        type: Sequelize.ENUM(
          "N/A",
          "GOOD",
          "GROUND",
          "SHORT_TURN",
          "SHORT_PHASE",
        ),
      },

      circuit_type: {
        type: Sequelize.ENUM("A", "DELTA", "STAR", "3_LINE", "STAR_DELTA"),
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("static_test_sections");
  },
};
