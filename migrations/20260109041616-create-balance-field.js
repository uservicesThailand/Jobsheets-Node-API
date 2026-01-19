"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("balance_field", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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

      check_result: {
        type: Sequelize.ENUM("C1", "C2", "C3", "C4"),
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

    await queryInterface.addIndex("balance_field", ["balance_id"], {
      unique: true,
      name: "idx_balance_field_balance_id",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("balance_field");
  },
};
