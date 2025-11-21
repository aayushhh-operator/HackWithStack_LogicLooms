const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying MicroLending contract...");

  const MicroLending = await hre.ethers.getContractFactory("MicroLending");
  const microLending = await MicroLending.deploy();

  await microLending.waitForDeployment();
  const address = await microLending.getAddress();

  console.log("✅ MicroLending contract deployed to:", address);

  // Save deployment info
  const artifact = await hre.artifacts.readArtifact("MicroLending");

  const deploymentInfo = {
    contractAddress: address,
    network: hre.network.name,
    abi: artifact.abi,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deploymentInfo.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Copy to frontend
  const frontendPath = "../frontend/src/contracts";
  if (!fs.existsSync(frontendPath)) {
    fs.mkdirSync(frontendPath, { recursive: true });
  }

  fs.writeFileSync(
    `${frontendPath}/MicroLending.json`,
    JSON.stringify(
      {
        address: address,
        abi: artifact.abi,
      },
      null,
      2
    )
  );

  console.log("\n💾 Saved to deploymentInfo.json and frontend/src/contracts/");
  console.log("\n🌐 Network: http://127.0.0.1:8545");
  console.log("🆔 Chain ID: 1337");
  console.log("\n📝 Contract Address:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
