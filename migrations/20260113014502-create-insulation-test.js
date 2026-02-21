"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("insulation_test", {
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

      volt: {
        type: Sequelize.DECIMAL(10, 3),
      },

      incoming_value: {
        type: Sequelize.DECIMAL(10, 3),
      },

      incoming_unit: {
        type: Sequelize.ENUM("Ω", "kΩ", "MΩ", "GΩ"),
      },

      final_value: {
        type: Sequelize.DECIMAL(10, 3),
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

    await queryInterface.addIndex("insulation_test", ["coil_brake_test_id"], {
      unique: true,
      name: "idx_insulation_test_coil_brake_test_id",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("insulation_test");
  },
};
