const { toNumberOrNull } = require("../../../../utils/number.util");

const shaft = ({ balanceShaft }) => {
  return {
    rotorWeight: toNumberOrNull(balanceShaft.rotorWeight),
    diameterA: toNumberOrNull(balanceShaft.diameterA),
    diameterB: toNumberOrNull(balanceShaft.diameterB),
    diameterC: toNumberOrNull(balanceShaft.diameterC),
    radius1: toNumberOrNull(balanceShaft.radius1),
    radius2: toNumberOrNull(balanceShaft.radius2),
  };
};

const shaftBalance = ({ shaftBalance }) => {
  return {
    balancingSpeed: toNumberOrNull(shaftBalance.balancingSpeed),
    incomingWeightDe: toNumberOrNull(shaftBalance.incomingWeightDe),
    incomingWeightNde: toNumberOrNull(shaftBalance.incomingWeightNde),
    incomingPhaseDe: toNumberOrNull(shaftBalance.incomingPhaseDe),
    incomingPhaseNde: toNumberOrNull(shaftBalance.incomingPhaseNde),
    finalWeightDe: toNumberOrNull(shaftBalance.finalWeightDe),
    finalWeightNde: toNumberOrNull(shaftBalance.finalWeightNde),
    finalPhaseDe: toNumberOrNull(shaftBalance.finalPhaseDe),
    finalPhaseNde: toNumberOrNull(shaftBalance.finalPhaseNde),
  };
};

module.exports = {
  shaft,
  shaftBalance,
};
