import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MicroLendingModule = buildModule("MicroLendingModule", (m) => {
  const microLending = m.contract("MicroLending");

  return { microLending };
});

export default MicroLendingModule;
