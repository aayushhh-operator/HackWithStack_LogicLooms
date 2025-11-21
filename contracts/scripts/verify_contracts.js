const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  console.log("Starting verification...");

  // Read deployed address
  const deploymentPath = path.join(__dirname, "../ignition/deployments/chain-1337/deployed_addresses.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error("Deployment file not found at:", deploymentPath);
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deploymentData["MicroLendingModule#MicroLending"];
  
  console.log("Contract Address:", contractAddress);

  if (!contractAddress) {
    console.error("Contract address not found in deployment file");
    process.exit(1);
  }

  // Get contract instance
  const MicroLending = await hre.ethers.getContractFactory("MicroLending");
  const microLending = MicroLending.attach(contractAddress);

  const [owner, borrower, lender] = await hre.ethers.getSigners();
  console.log("Owner:", owner.address);
  console.log("Borrower:", borrower.address);
  console.log("Lender:", lender.address);

  // 1. Request Loan
  console.log("\n--- Requesting Loan ---");
  const amount = hre.ethers.parseEther("1.0");
  const interestRate = 500; // 5%
  const duration = 30 * 24 * 60 * 60; // 30 days
  const purpose = "Test Loan";

  try {
    const tx1 = await microLending.connect(borrower).requestLoan(amount, interestRate, duration, purpose);
    await tx1.wait();
    console.log("Loan requested successfully");
  } catch (error) {
    console.error("Error requesting loan:", error.message);
  }

  // Get Loan ID (assuming it's the last one or ID 1 if fresh)
  const loanCount = await microLending.getTotalLoans();
  const loanId = loanCount;
  console.log("Loan ID:", loanId.toString());

  const loan = await microLending.getLoan(loanId);
  console.log("Loan Status:", loan.status.toString()); // 0 = Requested

  // 2. Fund Loan
  console.log("\n--- Funding Loan ---");
  try {
    const tx2 = await microLending.connect(lender).fundLoan(loanId, { value: amount });
    await tx2.wait();
    console.log("Loan funded successfully");
  } catch (error) {
    console.error("Error funding loan:", error.message);
  }

  const loanFunded = await microLending.getLoan(loanId);
  console.log("Loan Status:", loanFunded.status.toString()); // 1 = Funded

  // 3. Repay Loan
  console.log("\n--- Repaying Loan ---");
  const repaymentAmount = await microLending.calculateRepaymentAmount(loanId);
  console.log("Repayment Amount:", hre.ethers.formatEther(repaymentAmount));

  try {
    const tx3 = await microLending.connect(borrower).repayLoan(loanId, { value: repaymentAmount });
    await tx3.wait();
    console.log("Loan repaid successfully");
  } catch (error) {
    console.error("Error repaying loan:", error.message);
  }

  const loanRepaid = await microLending.getLoan(loanId);
  console.log("Loan Status:", loanRepaid.status.toString()); // 2 = Repaid

  console.log("\nVerification Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
