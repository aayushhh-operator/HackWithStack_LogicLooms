const hre = require("hardhat");

async function main() {
  const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  console.log(`Checking code at ${address}...`);
  
  const code = await hre.ethers.provider.getCode(address);
  console.log("Code length:", code.length);
  
  if (code === "0x") {
    console.error("NO CODE FOUND at this address!");
  } else {
    console.log("Code found!");
  }
}

main().catch(console.error);
