const {
  decimalOptional,
  enumRequired,
  enumOptional,
  arrayMaxLength,
} = require("../../../../utils/validator.util");

const {
  SECTION_TYPE,
  SURGR_WAVE,
  CIRCUIT_TYPE,
} = require("./section.constants");

const create = [
  arrayMaxLength(2),
  enumRequired("data.*.sectionType", SECTION_TYPE),
  enumOptional("data.*.surgeWaveform", SURGR_WAVE),
  enumOptional("data.*.circuitType", CIRCUIT_TYPE),
  decimalOptional("data.*.ambientTemp", { max: 2 }),
];

module.exports = { create };
