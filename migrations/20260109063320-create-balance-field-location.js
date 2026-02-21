"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("balance_field_location", {
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

      location: {
        type: Sequelize.ENUM("P1", "P2", "P3", "P4"),
        allowNull: false,
      },

      before_h: {
        type: Sequelize.DECIMAL(10, 3),
      },

      before_v: {
        type: Sequelize.DECIMAL(10, 3),
      },

      before_a: {
        type: Sequelize.DECIMAL(10, 3),
      },

      after_h: {
        type: Sequelize.DECIMAL(10, 3),
      },

      after_v: {
        type: Sequelize.DECIMAL(10, 3),
      },

      after_a: {
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
      "balance_field_location",
      ["balance_field_id", "location"],
      {
        unique: true,
        name: "idx_balance_field_location_balance_field_id_location",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("balance_field_location");
  },
};
