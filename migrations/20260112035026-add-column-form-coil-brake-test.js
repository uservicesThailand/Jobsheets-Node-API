"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("form_coil_brake_test", "frame", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("form_coil_brake_test", "type", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("form_coil_brake_test", "manufacture", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("form_coil_brake_test", "model", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("form_coil_brake_test", "power_value", {
      type: Sequelize.DECIMAL(10, 2),
    });
    await queryInterface.addColumn("form_coil_brake_test", "power_unit", {
      type: Sequelize.ENUM("KW", "HP", "NM"),
    });

    await queryInterface.addColumn("form_coil_brake_test", "speed_value", {
      type: Sequelize.DECIMAL(10, 2),
    });
    await queryInterface.addColumn("form_coil_brake_test", "speed_unit", {
      type: Sequelize.ENUM("RPM", "POLE"),
    });

    await queryInterface.addColumn("form_coil_brake_test", "serial_no", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("form_coil_brake_test", "insulation_class", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("form_coil_brake_test", "design", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("form_coil_brake_test", "frequency", {
      type: Sequelize.DECIMAL(10, 2),
    });

    await queryInterface.addColumn("form_coil_brake_test", "current", {
      type: Sequelize.DECIMAL(10, 2),
    });

    await queryInterface.addColumn("form_coil_brake_test", "volt", {
      type: Sequelize.DECIMAL(10, 2),
    });

    await queryInterface.addColumn("form_coil_brake_test", "year", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn("form_coil_brake_test", "pe", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("form_coil_brake_test", "eff", {
      type: Sequelize.DECIMAL(10, 2),
    });

    await queryInterface.addColumn("form_coil_brake_test", "ip", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("form_coil_brake_test", "weight", {
      type: Sequelize.DECIMAL(10, 2),
    });

    await queryInterface.addColumn("form_coil_brake_test", "cos", {
      type: Sequelize.DECIMAL(10, 2),
    });

    await queryInterface.addColumn("form_coil_brake_test", "note", {
      type: Sequelize.TEXT,
    });

    await queryInterface.addIndex("form_coil_brake_test", ["insp_id"], {
      unique: true,
      name: "idx_form_coil_brake_test_insp_id",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "form_coil_brake_test",
      "idx_form_coil_brake_test_insp_id"
    );
    await queryInterface.removeColumn("form_coil_brake_test", "cos");
    await queryInterface.removeColumn("form_coil_brake_test", "weight");
    await queryInterface.removeColumn("form_coil_brake_test", "ip");
    await queryInterface.removeColumn("form_coil_brake_test", "eff");
    await queryInterface.removeColumn("form_coil_brake_test", "pe");
    await queryInterface.removeColumn("form_coil_brake_test", "year");
    await queryInterface.removeColumn("form_coil_brake_test", "volt");
    await queryInterface.removeColumn("form_coil_brake_test", "current");
    await queryInterface.removeColumn("form_coil_brake_test", "frequency");
    await queryInterface.removeColumn("form_coil_brake_test", "design");
    await queryInterface.removeColumn(
      "form_coil_brake_test",
      "insulation_class"
    );
    await queryInterface.removeColumn("form_coil_brake_test", "serial_no");
    await queryInterface.removeColumn("form_coil_brake_test", "speed_unit");
    await queryInterface.removeColumn("form_coil_brake_test", "speed_value");
    await queryInterface.removeColumn("form_coil_brake_test", "power_unit");
    await queryInterface.removeColumn("form_coil_brake_test", "power_value");
    await queryInterface.removeColumn("form_coil_brake_test", "model");
    await queryInterface.removeColumn("form_coil_brake_test", "manufacture");
    await queryInterface.removeColumn("form_coil_brake_test", "type");
    await queryInterface.removeColumn("form_coil_brake_test", "frame");
    await queryInterface.removeColumn("form_coil_brake_test", "note");
  },
};
