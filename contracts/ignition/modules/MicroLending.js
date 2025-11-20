const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const MicroLendingModule = buildModule("MicroLendingModule", (m) => {
  const microLending = m.contract("MicroLending");

  return { microLending };
});

module.exports = MicroLendingModule;
