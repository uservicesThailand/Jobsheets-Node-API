"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("coil_brake_test_type", {
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

      brake_type_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
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
      "coil_brake_test_type",
      ["coil_brake_test_id", "brake_type_code"],
      {
        unique: true,
        name: "idx_coil_brake_test_type_coil_brake_test_id_brake_type_code",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("coil_brake_test_type");
  },
};
