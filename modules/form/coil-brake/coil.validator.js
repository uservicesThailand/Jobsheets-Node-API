const {
  decimalOptional,
  enumOptional,
  stringOptional,
  arrayMaxLength,
} = require("../../../utils/validator.util");

const { BRAKE_TYPES, SPEED_UNIT, POWER_UNIT } = require("./coil.constants");

const create = [
  stringOptional("frame", { max: 255 }),
  stringOptional("type", { max: 255 }),
  stringOptional("manufacture", { max: 255 }),
  stringOptional("model", { max: 255 }),
  stringOptional("serialNo", { max: 255 }),
  stringOptional("design", { max: 255 }),
  stringOptional("pe", { max: 255 }),
  stringOptional("ip", { max: 255 }),

  decimalOptional("frequency"),
  decimalOptional("current"),
  decimalOptional("volt"),
  decimalOptional("eff"),
  decimalOptional("year"),
  decimalOptional("weight"),
  decimalOptional("cos"),

  decimalOptional("power.value"),
  enumOptional("power.unit", POWER_UNIT),
  decimalOptional("speed.value"),
  enumOptional("speed.unit", SPEED_UNIT),

  arrayMaxLength(5, "brakeTypes").custom((arr) => {
    const unique = new Set(arr);
    if (unique.size !== arr.length) {
      throw new Error("must not contain duplicate values");
    }
    return true;
  }),

  ,
  enumOptional("brakeTypes.*", BRAKE_TYPES),
];

module.exports = {
  create,
};
