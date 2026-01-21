const { SECTION_TYPE } = require("./section.constants");

const mapResponse = ({ staticTestSections }) => {
  return staticTestSections.map((item) => ({
    sectionType: item.sectionType,
    ambientTemp: item.ambientTemp,
    surgeWaveform: item.surgeWaveform,
    circuitType: item.circuitType,
  }));
};

const generate = (staticTestId, userKey) => {
  const rows = [];

  for (const sectionType of SECTION_TYPE) {
    rows.push({
      staticTestId,
      sectionType,
      ambientTemp: null,
      surgeWaveform: null,
      circuitType: null,
      updatedBy: userKey,
      createdBy: userKey,
    });
  }

  return rows;
};

const merge = (defaults, payloadList = []) => {
  const payloadMap = new Map();

  for (const item of payloadList) {
    payloadMap.set(item.sectionType, {
      ambientTemp: item.ambientTemp ?? null,
      surgeWaveform: item.surgeWaveform ?? null,
      circuitType: item.circuitType ?? null,
    });
  }

  return defaults.map((row) => {
    if (!payloadMap.has(row.sectionType)) return row;

    return {
      ...row,
      ...payloadMap.get(row.sectionType),
    };
  });
};

module.exports = { mapResponse, generate, merge };
