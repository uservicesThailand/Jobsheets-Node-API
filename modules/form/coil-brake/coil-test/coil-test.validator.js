const {
  decimalOptional,
  arrayMaxLengthOpt,
} = require("../../../../utils/validator.util");

const create = [
  arrayMaxLengthOpt({ min: 3, max: 3 }, "volt.incoming"),
  decimalOptional("volt.incoming.*"),

  arrayMaxLengthOpt({ min: 3, max: 3 }, "volt.final"),
  decimalOptional("volt.final.*"),

  arrayMaxLengthOpt({ min: 3, max: 3 }, "current.incoming"),
  decimalOptional("current.incoming.*"),

  arrayMaxLengthOpt({ min: 3, max: 3 }, "current.final"),
  decimalOptional("current.final.*"),
];

module.exports = {
  create,
};
