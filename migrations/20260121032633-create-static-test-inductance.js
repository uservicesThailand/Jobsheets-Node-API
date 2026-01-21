"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("static_test_inductance", {
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

      marking_1: {
        type: Sequelize.STRING,
      },

      marking_2: {
        type: Sequelize.STRING,
      },

      marking_3: {
        type: Sequelize.STRING,
      },

      value_1: {
        type: Sequelize.DECIMAL(10, 3),
      },

      value_2: {
        type: Sequelize.DECIMAL(10, 3),
      },

      value_3: {
        type: Sequelize.DECIMAL(10, 3),
      },

      unit: {
        type: Sequelize.STRING(5),
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
      "static_test_inductance",
      ["static_test_id", "section_type"],
      {
        unique: true,
        name: "idx_static_test_inductance_static_test_id_section_type",
      },
    );

    await queryInterface.addIndex(
      "static_test_inductance",
      ["static_test_id"],
      {
        name: "idx_static_test_inductance_static_test_id",
      },
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("static_test_inductance");
  },
};
