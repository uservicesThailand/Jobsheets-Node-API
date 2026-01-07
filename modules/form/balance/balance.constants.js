const ROTOR_TYPES = ["N/A", "AC ROTOR", "DC ROTOR", "GEN ROTOR", "FAN/BLOWER"];
const INCLUDE_WITH = [
  "N/A",
  "Couping",
  "Pulley",
  "Cooling Fan",
  "Key",
  "Impeller",
];

const PHASES = ["BEFORE", "AFTER"];
const SIDES = ["DE", "NDE"];

const POINTS_BY_SIDE = {
  DE: ["A", "B", "C", "D", "E"],
  NDE: ["F", "G", "H", "I", "J"],
};

const POSITIONS = ["TOP", "BOTTOM", "LEFT", "RIGHT"];

const RESULT = ["NORMAL", "OVER_LIMIT"];

module.exports = {
  ROTOR_TYPES,
  INCLUDE_WITH,
  PHASES,
  SIDES,
  POINTS_BY_SIDE,
  POSITIONS,
  RESULT,
};
