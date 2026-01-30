module.exports = {
  SECTION_TYPE: ["INCOMING", "FINAL"],
  UNIT: ["Ω", "mΩ", "MΩ", "μΩ", "GΩ"],
  MARKING_BY_CIRCUIT: {
    A: ["T1-T2", "T1-T3", "T2-T3"],
    DELTA: ["U1-U2", "V1-V2", "W1-W2"],
    STAR: ["U1-U2", "V1-V2", "W1-W2"],
    "3_LINE": ["U-V", "U-W", "V-W"],
    STAR_DELTA: ["U1-V1", "U1-W1", "V1-W1"],
  },
};
