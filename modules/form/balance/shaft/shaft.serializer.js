const shaft = ({ balanceShaft }) => {
  return {
    rotorWeight: balanceShaft.rotorWeight,
    diameterA: balanceShaft.diameterA,
    diameterB: balanceShaft.diameterB,
    diameterC: balanceShaft.diameterC,
    radius1: balanceShaft.radius1,
    radius2: balanceShaft.radius2,
  };
};

const shaftBalance = ({ shaftBalance }) => {
  return {
    balancingSpeed: shaftBalance.balancingSpeed,
    incomingWeightDe: shaftBalance.incomingWeightDe,
    incomingWeightNde: shaftBalance.incomingWeightNde,
    incomingPhaseDe: shaftBalance.incomingPhaseDe,
    incomingPhaseNde: shaftBalance.incomingPhaseNde,
    finalWeightDe: shaftBalance.finalWeightDe,
    finalWeightNde: shaftBalance.finalWeightNde,
    finalPhaseDe: shaftBalance.finalPhaseDe,
    finalPhaseNde: shaftBalance.finalPhaseNde,
  };
};

module.exports = {
  shaft,
  shaftBalance,
};
