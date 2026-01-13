"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("resistance_test", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      coil_brake_test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "form_coil_brake_test",
          key: "cbt_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      marking_1: {
        type: Sequelize.DECIMAL(10, 2),
      },

      marking_2: {
        type: Sequelize.DECIMAL(10, 2),
      },

      marking_3: {
        type: Sequelize.DECIMAL(10, 2),
      },

      incoming_1: {
        type: Sequelize.DECIMAL(10, 2),
      },

      incoming_2: {
        type: Sequelize.DECIMAL(10, 2),
      },

      incoming_3: {
        type: Sequelize.DECIMAL(10, 2),
      },

      incoming_unit: {
        type: Sequelize.ENUM("Ω", "kΩ", "MΩ", "GΩ"),
      },

      final_1: {
        type: Sequelize.DECIMAL(10, 2),
      },

      final_2: {
        type: Sequelize.DECIMAL(10, 2),
      },

      final_3: {
        type: Sequelize.DECIMAL(10, 2),
      },

      final_unit: {
        type: Sequelize.ENUM("Ω", "kΩ", "MΩ", "GΩ"),
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

    await queryInterface.addIndex("resistance_test", ["coil_brake_test_id"], {
      unique: true,
      name: "idx_resistance_test_coil_brake_test_id",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("resistance_test");
  },
};
