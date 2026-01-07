"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("balance_rotor_runout_result", {
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

      result: {
        type: Sequelize.ENUM("NORMAL", "OVER_LIMIT"),
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
      "balance_rotor_runout_result",
      ["balance_rotor_id", "phase"],
      {
        unique: true,
        name: "idx_balance_rotor_runout_result_balance_rotor_id_phase",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("balance_rotor_runout_result");
    await queryInterface.removeIndex(
      "balance_rotor_runout",
      "idx_balance_rotor_runout_result_balance_rotor_id_phase"
    );
  },
};
