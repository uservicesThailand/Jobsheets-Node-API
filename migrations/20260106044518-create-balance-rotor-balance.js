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

    await queryInterface.addIndex(
      "balance_rotor_balance",
      ["balance_rotor_id"],
      {
        unique: true,
        name: "idx_balance_rotor_balance_balance_rotor_id",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("balance_rotor_balance");
    await queryInterface.removeIndex(
      "balance_rotor_balance",
      "idx_balance_rotor_balance_balance_rotor_id"
    );
  },
};
