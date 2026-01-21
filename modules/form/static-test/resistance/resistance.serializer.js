const { SECTION_TYPE } = require("./resistance.constants");

const mapResponse = ({ staticTestResistances }) => {
  return staticTestResistances.map((item) => ({
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

const merge = (defaults, payloadList = []) => {
  const payloadMap = new Map();

  for (const item of payloadList) {
    payloadMap.set(item.sectionType, {
      marking1: item.marking1 ?? null,
      marking2: item.marking2 ?? null,
      marking3: item.marking3 ?? null,
      value1: item.value1 ?? null,
      value2: item.value2 ?? null,
      value3: item.value3 ?? null,
      unit: item.unit ?? null,
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

module.exports = {
  mapResponse,
  generate,
  merge,
};
