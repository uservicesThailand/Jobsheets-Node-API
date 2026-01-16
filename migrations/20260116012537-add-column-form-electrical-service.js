"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("form_electrical_services", "data", {
      type: Sequelize.JSON,
      allowNull: false,
    });
    await queryInterface.addIndex("form_electrical_services", ["insp_id"], {
      unique: true,
      name: "idx_form_electrical_service_insp_id",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("form_electrical_services", "data");
  },
};
