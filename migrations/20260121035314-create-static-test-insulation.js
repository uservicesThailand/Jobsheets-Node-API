"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("static_test_insulation", {
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

      voltage_vdc: {
        type: Sequelize.INTEGER,
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

      at1_value_1: {
        type: Sequelize.DECIMAL(10, 3),
      },

      at1_value_2: {
        type: Sequelize.DECIMAL(10, 3),
      },

      at1_value_3: {
        type: Sequelize.DECIMAL(10, 3),
      },

      at1_unit: {
        type: Sequelize.STRING(5),
      },

      at10_value_1: {
        type: Sequelize.DECIMAL(10, 3),
      },

      at10_value_2: {
        type: Sequelize.DECIMAL(10, 3),
      },

      at10_value_3: {
        type: Sequelize.DECIMAL(10, 3),
      },

      at10_unit: {
        type: Sequelize.STRING(5),
      },

      min_insulation_recommend: {
        type: Sequelize.STRING,
      },

      polarization_index_recommend: {
        type: Sequelize.STRING,
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("static_test_insulation");
  },
};
