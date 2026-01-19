const { toNumberOrNull } = require("../../../../utils/number.util");

const rotor = ({ balanceRotor }) => {
  return {
    rotorType: balanceRotor.rotorType || null,
    includeWith: balanceRotor.includeWith || null,
    rotorWeight: toNumberOrNull(balanceRotor.rotorWeight),
    diameterA: toNumberOrNull(balanceRotor.diameterA),
    diameterB: toNumberOrNull(balanceRotor.diameterB),
    diameterC: toNumberOrNull(balanceRotor.diameterC),
    radius1: toNumberOrNull(balanceRotor.radius1),
    radius2: toNumberOrNull(balanceRotor.radius2),
    rotorSpeed: toNumberOrNull(balanceRotor.rotorSpeed),
    note: balanceRotor.note || null,
  };
};

const rotorBalance = ({ rotorBalance }) => {
  return {
    incomingWeightDe: toNumberOrNull(rotorBalance.incomingWeightDe),
    incomingAngleDe: toNumberOrNull(rotorBalance.incomingAngleDe),
    incomingWeightNde: toNumberOrNull(rotorBalance.incomingWeightNde),
    incomingAngleNde: toNumberOrNull(rotorBalance.incomingAngleNde),
    finalWeightDe: toNumberOrNull(rotorBalance.finalWeightDe),
    finalAngleDe: toNumberOrNull(rotorBalance.finalAngleDe),
    finalWeightNde: toNumberOrNull(rotorBalance.finalWeightNde),
    finalAngleNde: toNumberOrNull(rotorBalance.finalAngleNde),
    stdToleranceDe: toNumberOrNull(rotorBalance.stdToleranceDe),
    stdToleranceNde: toNumberOrNull(rotorBalance.stdToleranceNde),
  };
};

const rotorRunout = ({ rotorRunout }) => {
  return rotorRunout.map((item) => ({
    phase: item.phase,
    side: item.side,
    point: item.point,
    position: item.position,
    value: toNumberOrNull(item.value),
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
