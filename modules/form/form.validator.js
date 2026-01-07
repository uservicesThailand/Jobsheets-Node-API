const { body } = require("express-validator");

const ROTOR_TYPES = ["N/A", "AC ROTOR", "DC ROTOR", "GEN ROTOR", "FAN/BLOWER"];
const INCLUDE_WITH = [
  "N/A",
  "Couping",
  "Pulley",
  "Cooling Fan",
  "Key",
  "Impeller",
];

const createRotor = [
  body("rotorType").optional({ nullable: true }).isIn(ROTOR_TYPES),
  body("includeWith").optional({ nullable: true }).isIn(INCLUDE_WITH),
  body("rotorWeight")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" }),
  body("diameterA")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" }),
  body("diameterB")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" }),
  body("diameterC")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" }),
  body("radius1")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" }),
  body("radius2")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" }),
  body("rotorSpeed")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" }),
  body("note").optional({ nullable: true }).isString().notEmpty().trim(),
];

module.exports = {
  createRotor,
};
