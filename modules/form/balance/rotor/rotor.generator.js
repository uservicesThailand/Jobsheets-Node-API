const {
  PHASES,
  SIDES,
  POINTS_BY_SIDE,
  POSITIONS,
} = require("./rotor.constants");

const generateAllCombos = (balanceRotorId) => {
  const rows = [];

  for (const phase of PHASES) {
    for (const side of SIDES) {
      const points = POINTS_BY_SIDE[side];

      for (const point of points) {
        for (const position of POSITIONS) {
          rows.push({
            balanceRotorId,
            phase,
            side,
            point,
            position,
            value: null,
          });
        }
      }
    }
  }

  return rows;
};

const mergeRunoutData = (allCombos, payloadList = []) => {
  const payloadMap = new Map();

  for (const item of payloadList) {
    const key = `${item.phase}_${item.side}_${item.point}_${item.position}`;
    payloadMap.set(key, item.value ?? null);
  }

  return allCombos.map((row) => {
    const key = `${row.phase}_${row.side}_${row.point}_${row.position}`;

    if (payloadMap.has(key)) {
      return {
        ...row,
        value: payloadMap.get(key),
      };
    }

    return row;
  });
};

const resultGenerate = (balanceRotorId) => {
  return PHASES.map((phase) => ({
    balanceRotorId,
    phase,
    result: null,
  }));
};

const mergeResultPayload = (defaults, payloadList = []) => {
  const payloadMap = new Map();

  for (const item of payloadList) {
    payloadMap.set(item.phase, item.result ?? null);
  }

  return defaults.map((row) => ({
    ...row,
    result: payloadMap.has(row.phase) ? payloadMap.get(row.phase) : null,
  }));
};

module.exports = {
  generateAllCombos,
  mergeRunoutData,
  mergeResultPayload,
  resultGenerate,
};
