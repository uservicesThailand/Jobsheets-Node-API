"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("form_static_test", "volt_kvdc_1", {
      type: Sequelize.DECIMAL(10, 3),
    });

    await queryInterface.addColumn("form_static_test", "volt_kvdc_2", {
      type: Sequelize.DECIMAL(10, 3),
    });

    await queryInterface.addColumn("form_static_test", "note", {
      type: Sequelize.TEXT,
    });

    await queryInterface.addIndex("form_static_test", ["insp_id"], {
      unique: true,
      name: "idx_form_static_test_insp_id",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("form_static_test", "volt_kvdc_1");
    await queryInterface.removeColumn("form_static_test", "volt_kvdc_2");
    await queryInterface.removeColumn("form_static_test", "note");
  },
};
