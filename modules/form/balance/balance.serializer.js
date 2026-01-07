const rotor = ({ inspection, balanceRotor }) => {
  return {
    inspection: {
      inspNo: inspection.inspNo || null,
      inspSv: inspection.inspServiceOrder || null,
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

const rotorBalance = ({ inspection, rotorBalance }) => {
  return {
    inspection: {
      inspNo: inspection.inspNo || null,
      inspSv: inspection.inspServiceOrder || null,
    },
    rotor: {
      incomingWeightDe: rotorBalance.incomingWeightDe || null,
      incomingAngleDe: rotorBalance.incomingAngleDe || null,
      incomingWeightNde: rotorBalance.incomingWeightNde || null,
      incomingAngleNde: rotorBalance.incomingAngleNde || null,
      finalWeightDe: rotorBalance.finalWeightDe || null,
      finalAngleDe: rotorBalance.finalAngleDe || null,
      finalWeightNde: rotorBalance.finalWeightNde || null,
      finalAngleNde: rotorBalance.finalAngleNde || null,
      stdToleranceDe: rotorBalance.stdToleranceDe || null,
      stdToleranceNde: rotorBalance.stdToleranceNde || null,
    },
  };
};

module.exports = {
  rotor,
  rotorBalance,
};
