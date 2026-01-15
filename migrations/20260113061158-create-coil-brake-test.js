"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("coil_brake_test", {
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

      volt_incoming_1: {
        type: Sequelize.DECIMAL(10, 3),
      },

      volt_incoming_2: {
        type: Sequelize.DECIMAL(10, 3),
      },

      volt_incoming_3: {
        type: Sequelize.DECIMAL(10, 3),
      },

      volt_final_1: {
        type: Sequelize.DECIMAL(10, 3),
      },

      volt_final_2: {
        type: Sequelize.DECIMAL(10, 3),
      },

      volt_final_3: {
        type: Sequelize.DECIMAL(10, 3),
      },

      current_incoming_1: {
        type: Sequelize.DECIMAL(10, 3),
      },

      current_incoming_2: {
        type: Sequelize.DECIMAL(10, 3),
      },

      current_incoming_3: {
        type: Sequelize.DECIMAL(10, 3),
      },

      current_final_1: {
        type: Sequelize.DECIMAL(10, 3),
      },

      current_final_2: {
        type: Sequelize.DECIMAL(10, 3),
      },

      current_final_3: {
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

    await queryInterface.addIndex("coil_brake_test", ["coil_brake_test_id"], {
      unique: true,
      name: "idx_coil_brake_test_coil_brake_test_id",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("coil_brake_test");
  },
};
