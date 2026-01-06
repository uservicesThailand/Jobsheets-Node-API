"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("balance_rotor_balance", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      balance_rotor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "balance_rotor",
          key: "rotor_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      incoming_weight_de: {
        type: Sequelize.DECIMAL(10, 2),
      },

      incoming_angle_de: {
        type: Sequelize.DECIMAL(10, 2),
      },

      incoming_weight_nde: {
        type: Sequelize.DECIMAL(10, 2),
      },

      incoming_angle_nde: {
        type: Sequelize.DECIMAL(10, 2),
      },

      final_weight_de: {
        type: Sequelize.DECIMAL(10, 2),
      },

      final_angle_de: {
        type: Sequelize.DECIMAL(10, 2),
      },

      final_weight_nde: {
        type: Sequelize.DECIMAL(10, 2),
      },

      final_angle_nde: {
        type: Sequelize.DECIMAL(10, 2),
      },

      std_tolerance_de: {
        type: Sequelize.DECIMAL(10, 2),
      },

      std_tolerance_nde: {
        type: Sequelize.DECIMAL(10, 2),
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
    await queryInterface.dropTable("balance_rotor_balance");
  },
};
