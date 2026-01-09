const rotor = ({ balanceRotor }) => {
  return {
    rotorType: balanceRotor.rotorType || null,
    rotorWeight: balanceRotor.rotorWeight || null,
    diameterA: balanceRotor.diameterA || null,
    diameterB: balanceRotor.diameterB || null,
    diameterC: balanceRotor.diameterC || null,
    radius1: balanceRotor.radius1 || null,
    radius2: balanceRotor.radius2 || null,
    rotorSpeed: balanceRotor.rotorSpeed || null,
    note: balanceRotor.note || null,
  };
};

const rotorBalance = ({ rotorBalance }) => {
  return {
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
  };
};

const rotorRunout = ({ rotorRunout }) => {
  return rotorRunout.map((item) => ({
    phase: item.phase,
    side: item.side,
    point: item.point,
    position: item.position,
    value: item.value || null,
  }));
};

const rotorRunoutResult = ({ rotorRunoutResult }) => {
  return rotorRunoutResult.map((item) => ({
    phase: item.phase,
    result: item.result || null,
  }));
};

module.exports = {
  rotor,
  rotorBalance,
  rotorRunout,
  rotorRunoutResult,
};
