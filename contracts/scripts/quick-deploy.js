const hre = require("hardhat");

async function main() {
  console.log("Deploying MicroLending contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const MicroLending = await hre.ethers.getContractFactory("MicroLending");
  const microLending = await MicroLending.deploy();
  await microLending.waitForDeployment();

  const address = await microLending.getAddress();
  console.log("MicroLending contract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
