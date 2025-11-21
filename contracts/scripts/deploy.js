import hre from "hardhat";

async function main() {
  // Use the global 'ethers' object which is injected by Hardhat
  // when running with 'npx hardhat run'
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Get the ContractFactory for MicroLending
  const MicroLending = await hre.ethers.getContractFactory("MicroLending");

  // Deploy the contract
  const microLending = await MicroLending.deploy();

  // Wait for the deployment to be confirmed
  await microLending.waitForDeployment();

  console.log("MicroLending contract deployed to:", microLending.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
