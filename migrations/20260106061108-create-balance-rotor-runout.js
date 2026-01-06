"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("balance_rotor_runout", {
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

      phase: {
        type: Sequelize.ENUM("BEFORE", "AFTER"),
        allowNull: false,
      },

      side: {
        type: Sequelize.ENUM("DE", "NDE"),
        allowNull: false,
      },

      point: {
        type: Sequelize.ENUM("A", "B", "C", "D", "E", "F", "G", "H", "I", "J"),
        allowNull: false,
      },

      position: {
        type: Sequelize.ENUM("TOP", "BOTTOM", "LEFT", "RIGHT"),
        allowNull: false,
      },

      value: {
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("balance_rotor_runout");
  },
};
