"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("balance_rotor", {
      rotor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      balance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "form_balance",
          key: "bal_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      rotor_type: {
        type: Sequelize.STRING(50),
      },

      include_with: {
        type: Sequelize.STRING(50),
      },

      rotor_weight: {
        type: Sequelize.DECIMAL(10, 2),
      },

      diameter_a: {
        type: Sequelize.DECIMAL(10, 2),
      },

      diameter_b: {
        type: Sequelize.DECIMAL(10, 2),
      },

      diameter_c: {
        type: Sequelize.DECIMAL(10, 2),
      },

      radius_1: {
        type: Sequelize.DECIMAL(10, 2),
      },

      radius_2: {
        type: Sequelize.DECIMAL(10, 2),
      },

      rotor_speed: {
        type: Sequelize.INTEGER,
      },

      note: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("balance_rotor");
  },
};
