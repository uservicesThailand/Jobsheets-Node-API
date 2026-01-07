const { POINTS_BY_SIDE } = require("./balance.constants");

const validateRunoutBusiness = (data = []) => {
  const errors = [];
  const uniqueSet = new Set();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // ✅ rule: point ต้องตรงกับ side
    const allowedPoints = POINTS_BY_SIDE[row.side] || [];
    if (!allowedPoints.includes(row.point)) {
      errors.push({
        index: i,
        message: `point '${row.point}' ไม่สอดคล้องกับ side '${row.side}'`,
      });
    }

    // ✅ rule: ห้าม duplicate combo
    const key = `${row.phase}_${row.side}_${row.point}_${row.position}`;
    if (uniqueSet.has(key)) {
      errors.push({
        index: i,
        message: `ข้อมูลซ้ำ: ${key}`,
      });
    } else {
      uniqueSet.add(key);
    }
  }

  return errors;
};

module.exports = {
  validateRunoutBusiness,
};
