import fs from "fs";
import hre from "hardhat";
import path from "path";

async function main() {
  console.log("🚀 Deploying MicroLending contract...\n");

  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  const MicroLending = await hre.ethers.getContractFactory("MicroLending");
  const microLending = await MicroLending.deploy();

  await microLending.waitForDeployment();
  const contractAddress = await microLending.getAddress();

  console.log("✅ MicroLending contract deployed to:", contractAddress);
  console.log("🌐 Network:", hre.network.name);
  console.log("⛓️  Chain ID:", hre.network.config.chainId || "unknown");

  // Get the artifact
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/MicroLending.sol/MicroLending.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const deploymentPath = path.join(__dirname, "../deploymentInfo.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:", deploymentPath);

  // Copy to frontend
  const frontendDir = path.join(__dirname, "../../frontend/src/contracts");

  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
    console.log("📁 Created frontend contracts directory");
  }

  const frontendConfig = {
    address: contractAddress,
    abi: artifact.abi,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
  };

  const frontendPath = path.join(frontendDir, "MicroLending.json");
  fs.writeFileSync(frontendPath, JSON.stringify(frontendConfig, null, 2));

  console.log("💾 Contract info copied to:", frontendPath);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Details:");
  console.log("   Address:", contractAddress);
  console.log("   Network:", hre.network.name);
  console.log("   Chain ID:", hre.network.config.chainId || "N/A");
  console.log("\n🔑 Test Accounts:");
  console.log("   Use Account #0 as deployer/owner");
  console.log("   Use Account #1 as borrower");
  console.log("   Use Account #2 as lender");
  console.log("\n🌐 RPC URL: http://127.0.0.1:8545");
  console.log("🆔 Chain ID: 1337 (for MetaMask)\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
