const rotor = ({ balanceRotor }) => {
  return {
    rotorType: balanceRotor.rotorType || null,
    includeWith: balanceRotor.includeWith || null,
    rotorWeight: balanceRotor.rotorWeight,
    diameterA: balanceRotor.diameterA,
    diameterB: balanceRotor.diameterB,
    diameterC: balanceRotor.diameterC,
    radius1: balanceRotor.radius1,
    radius2: balanceRotor.radius2,
    rotorSpeed: balanceRotor.rotorSpeed,
    note: balanceRotor.note || null,
  };
};

const rotorBalance = ({ rotorBalance }) => {
  return {
    incomingWeightDe: rotorBalance.incomingWeightDe,
    incomingAngleDe: rotorBalance.incomingAngleDe,
    incomingWeightNde: rotorBalance.incomingWeightNde,
    incomingAngleNde: rotorBalance.incomingAngleNde,
    finalWeightDe: rotorBalance.finalWeightDe,
    finalAngleDe: rotorBalance.finalAngleDe,
    finalWeightNde: rotorBalance.finalWeightNde,
    finalAngleNde: rotorBalance.finalAngleNde,
    stdToleranceDe: rotorBalance.stdToleranceDe,
    stdToleranceNde: rotorBalance.stdToleranceNde,
  };
};

const rotorRunout = ({ rotorRunout }) => {
  return rotorRunout.map((item) => ({
    phase: item.phase,
    side: item.side,
    point: item.point,
    position: item.position,
    value: item.value,
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
