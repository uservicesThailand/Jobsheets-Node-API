"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("form_mechanical_services", "basket", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("form_mechanical_services", "team", {
      type: Sequelize.ENUM("1", "2", "3", "4"),
    });

    await queryInterface.addColumn("form_mechanical_services", "status", {
      type: Sequelize.ENUM("NO_REPAIR", "WAIT_APPROVAL", "SENT_FOR_REPAIR"),
    });

    await queryInterface.addColumn("form_mechanical_services", "data", {
      type: Sequelize.JSON,
      allowNull: false,
    });

    await queryInterface.addIndex("form_mechanical_services", ["insp_id"], {
      unique: true,
      name: "idx_form_mechanical_services_insp_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("form_mechanical_services", "basket");
    await queryInterface.removeColumn("form_mechanical_services", "team");
    await queryInterface.removeColumn("form_mechanical_services", "status");
    await queryInterface.removeColumn("form_mechanical_services", "data");
  },
};
