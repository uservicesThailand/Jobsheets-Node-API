const rotorSerializer = ({ inspection, balanceRotor }) => {
  return {
    inspection: {
      inspNo: inspection.inspNo,
      inspSv: inspection.inspServiceOrder,
    },
    rotor: {
      rotorType: balanceRotor.rotorType || null,
      rotorWeight: balanceRotor.rotorWeight || null,
      diameterA: balanceRotor.diameterA || null,
      diameterB: balanceRotor.diameterB || null,
      diameterC: balanceRotor.diameterC || null,
      radius1: balanceRotor.radius1 || null,
      radius2: balanceRotor.radius2 || null,
      rotorSpeed: balanceRotor.rotorSpeed || null,
      note: balanceRotor.note || null,
    },
  };
};

module.exports = {
  rotorSerializer,
};
