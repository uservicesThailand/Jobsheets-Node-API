"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("balance_shaft_balance", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      balance_shaft_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "balance_shaft",
          key: "shaft_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      balancing_speed: {
        type: Sequelize.INTEGER,
      },

      incoming_weight_de: {
        type: Sequelize.DECIMAL(10, 3),
      },

      incoming_weight_nde: {
        type: Sequelize.DECIMAL(10, 3),
      },

      incoming_phase_de: {
        type: Sequelize.DECIMAL(10, 3),
      },

      incoming_phase_nde: {
        type: Sequelize.DECIMAL(10, 3),
      },

      final_weight_de: {
        type: Sequelize.DECIMAL(10, 3),
      },

      final_weight_nde: {
        type: Sequelize.DECIMAL(10, 3),
      },

      final_phase_de: {
        type: Sequelize.DECIMAL(10, 3),
      },

      final_phase_nde: {
        type: Sequelize.DECIMAL(10, 3),
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
      "balance_shaft_balance",
      ["balance_shaft_id"],
      {
        unique: true,
        name: "idx_balance_shaft_balance_balance_shaft_id",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("balance_shaft_balance");
  },
};
