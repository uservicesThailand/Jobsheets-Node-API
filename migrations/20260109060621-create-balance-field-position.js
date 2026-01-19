"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("balance_field_position", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      balance_field_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "balance_field",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      position_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      position_name: {
        type: Sequelize.STRING(50),
      },

      before_unbalance: {
        type: Sequelize.DECIMAL(10, 3),
      },

      before_degree_1: {
        type: Sequelize.DECIMAL(10, 3),
      },

      before_weight: {
        type: Sequelize.DECIMAL(10, 3),
      },

      before_degree_2: {
        type: Sequelize.DECIMAL(10, 3),
      },

      after_unbalance: {
        type: Sequelize.DECIMAL(10, 3),
      },

      after_degree_1: {
        type: Sequelize.DECIMAL(10, 3),
      },

      after_weight: {
        type: Sequelize.DECIMAL(10, 3),
      },

      after_degree_2: {
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
      "balance_field_position",
      ["balance_field_id", "position_index"],
      {
        unique: true,
        name: "idx_balance_field_positions_balance_field_position_index",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("balance_field_position");
  },
};
