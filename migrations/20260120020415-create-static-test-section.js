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
        type: Sequelize.DECIMAL(5, 2),
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

      created_by: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: "u_user",
          key: "user_key",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      updated_by: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: "u_user",
          key: "user_key",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });

    await queryInterface.addIndex(
      "static_test_section",
      ["static_test_id", "section_type"],
      {
        unique: true,
        name: "idx_static_test_section_static_test_id_section_type",
      },
    );

    await queryInterface.addIndex("static_test_section", ["static_test_id"], {
      name: "idx_static_test_section_static_test_id",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("static_test_section");
  },
};
