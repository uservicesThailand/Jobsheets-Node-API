const { SECTION_TYPE, MARKING_BY_CIRCUIT } = require("./inductance.constants");

const mapResponse = ({ staticTestInductances }) => {
  return staticTestInductances.map((item) => ({
    sectionType: item.sectionType,
    marking1: item.marking1,
    marking2: item.marking2,
    marking3: item.marking3,
    value1: item.value1,
    value2: item.value2,
    value3: item.value3,
    unit: item.unit,
  }));
};

const generate = (staticTestId, userKey) => {
  const rows = [];

  for (const sectionType of SECTION_TYPE) {
    rows.push({
      staticTestId,
      sectionType,
      marking1: null,
      marking2: null,
      marking3: null,
      value1: null,
      value2: null,
      value3: null,
      unit: null,
      updatedBy: userKey,
      createdBy: userKey,
    });
  }

  return rows;
};

const merge = (defaults, payloadList = [], staticTestSections) => {
  const payloadMap = new Map();
  const circuitMap = new Map();

  for (const section of staticTestSections) {
    circuitMap.set(section.sectionType, section.circuitType);
  }

  for (const item of payloadList) {
    payloadMap.set(item.sectionType, {
      value1: item.value1 ?? null,
      value2: item.value2 ?? null,
      value3: item.value3 ?? null,
      unit: item.unit ?? null,
    });
  }

  return defaults.map((row) => {
    const circuitType = circuitMap.get(row.sectionType);
    const payload = payloadMap.get(row.sectionType);

    const markings = MARKING_BY_CIRCUIT[circuitType] ?? [];

    return {
      ...row,
      marking1: markings[0] ?? null,
      marking2: markings[1] ?? null,
      marking3: markings[2] ?? null,
      ...(payload ?? {}),
    };
  });
};

module.exports = {
  mapResponse,
  generate,
  merge,
};
