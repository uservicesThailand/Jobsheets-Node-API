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

module.exports = {
  shaft,
};
