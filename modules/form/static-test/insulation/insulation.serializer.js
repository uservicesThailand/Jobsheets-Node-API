const { SECTION_TYPE } = require("./insulation.constants");

const mapResponse = ({ staticTestInsulations }) => {
  return staticTestInsulations.map((item) => ({
    sectionType: item.sectionType,
    voltageVdc: item.voltageVdc,
    marking1: item.marking1,
    marking2: item.marking2,
    marking3: item.marking3,
    at1Value1: item.at1Value1,
    at1Value2: item.at1Value2,
    at1Value3: item.at1Value3,
    at1Unit: item.at1Unit,
    at10Value1: item.at10Value1,
    at10Value2: item.at10Value2,
    at10Value3: item.at10Value3,
    at10Unit: item.at10Unit,
    minInsulationRec: item.minInsulationRec,
    polarizationIndexRec: item.polarizationIndexRec,
  }));
};

const generate = (staticTestId, userKey) => {
  const rows = [];

  for (const sectionType of SECTION_TYPE) {
    rows.push({
      staticTestId,
      sectionType,
      voltageVdc: null,
      marking1: null,
      marking2: null,
      marking3: null,
      at1Value1: null,
      at1Value2: null,
      at1Value3: null,
      at1Unit: null,
      at10Value1: null,
      at10Value2: null,
      at10Value3: null,
      at10Unit: null,
      minInsulationRec: null,
      polarizationIndexRec: null,
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
      voltageVdc: item.voltageVdc ?? null,
      marking1: item.marking1 ?? null,
      marking2: item.marking2 ?? null,
      marking3: item.marking3 ?? null,
      at1Value1: item.at1Value1 ?? null,
      at1Value2: item.at1Value2 ?? null,
      at1Value3: item.at1Value3 ?? null,
      at1Unit: item.at1Unit ?? null,
      at10Value1: item.at10Value1 ?? null,
      at10Value2: item.at10Value2 ?? null,
      at10Value3: item.at10Value3 ?? null,
      at10Unit: item.at10Unit ?? null,
      minInsulationRec: item.minInsulationRec ?? null,
      polarizationIndexRec: item.polarizationIndexRec ?? null,
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
