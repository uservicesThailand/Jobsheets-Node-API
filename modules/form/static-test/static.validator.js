const {
  decimalOptional,
  stringOptional,
} = require("../../../utils/validator.util");

const create = [
  decimalOptional("voltKvdc1"),
  decimalOptional("voltKvdc2"),
  stringOptional("note", { max: 500 }),
];

module.exports = {
  create,
};
