import fs from "fs";
import hre from "hardhat";

async function main() {
  console.log("\n🚀 MicroLending Contract - Deploy & Interact Demo\n");
  console.log("=".repeat(60));

  // STEP 1: Deploy the contract
  console.log("\n📦 STEP 1: Deploying Contract");
  console.log("-".repeat(60));

  const MicroLending = await hre.ethers.getContractFactory("MicroLending");
  const microLending = await MicroLending.deploy();
  await microLending.waitForDeployment();

  const contractAddress = await microLending.getAddress();
  console.log("✅ Contract deployed to:", contractAddress);

  // Get signers (test accounts)
  const [owner, borrower, lender] = await hre.ethers.getSigners();

  console.log("\n👥 Accounts:");
  console.log("   Owner/Deployer:", owner.address);
  console.log("   Borrower:", borrower.address);
  console.log("   Lender:", lender.address);
  console.log("=".repeat(60));

  // TRANSACTION 1: Borrower requests a loan
  console.log("\n💰 TRANSACTION 1: Request Loan");
  console.log("-".repeat(60));

  const loanAmount = hre.ethers.parseEther("2"); // 2 ETH
  const interestRate = 500; // 5% (500 basis points)
  const duration = 30 * 24 * 60 * 60; // 30 days in seconds
  const purpose = "Business expansion for my startup";

  console.log("   Borrower:", borrower.address);
  console.log("   Amount:", hre.ethers.formatEther(loanAmount), "ETH");
  console.log("   Interest Rate: 5%");
  console.log("   Duration: 30 days");
  console.log("   Purpose:", purpose);

  const borrowerContract = microLending.connect(borrower) as any;
  const tx1 = await borrowerContract.requestLoan(
    loanAmount,
    interestRate,
    duration,
    purpose
  );

  console.log("\n   ⏳ Transaction sent:", tx1.hash);
  const receipt1 = await tx1.wait();
  console.log("   ✅ Transaction confirmed! Block:", receipt1.blockNumber);

  // Assume loan ID is 0 (first loan)
  const loanId = 0;
  console.log("   🆔 Loan ID:", loanId);

  // TRANSACTION 2: Get loan details
  console.log("\n📊 TRANSACTION 2: Get Loan Details");
  console.log("-".repeat(60));

  const loan = await microLending.getLoan(loanId);
  console.log("   Loan ID:", loan[0].toString()); // id
  console.log("   Borrower:", loan[1]); // borrower
  console.log("   Amount:", hre.ethers.formatEther(loan[3]), "ETH"); // amount
  console.log("   Interest Rate:", (Number(loan[4]) / 100).toFixed(2) + "%"); // interestRate
  console.log(
    "   Status:",
    ["Requested", "Funded", "Repaid", "Defaulted", "Cancelled"][loan[9]]
  ); // status
  console.log("   Risk Score:", loan[8].toString()); // riskScore

  // TRANSACTION 3: Lender funds the loan
  console.log("\n💸 TRANSACTION 3: Fund Loan");
  console.log("-".repeat(60));

  console.log("   Lender:", lender.address);
  console.log("   Funding Amount:", hre.ethers.formatEther(loanAmount), "ETH");

  const lenderContract = microLending.connect(lender) as any;
  const tx2 = await lenderContract.fundLoan(loanId, { value: loanAmount });

  console.log("\n   ⏳ Transaction sent:", tx2.hash);
  const receipt2 = await tx2.wait();
  console.log("   ✅ Transaction confirmed! Block:", receipt2.blockNumber);

  // Check updated loan status
  const fundedLoan = await microLending.getLoan(loanId);
  console.log(
    "   📈 Loan Status:",
    ["Requested", "Funded", "Repaid", "Defaulted", "Cancelled"][fundedLoan[9]]
  );
  console.log("   🤝 Lender:", fundedLoan[2]); // lender

  // TRANSACTION 4: Calculate repayment amount
  console.log("\n🧮 TRANSACTION 4: Calculate Repayment");
  console.log("-".repeat(60));

  const repaymentAmount = await microLending.calculateRepaymentAmount(loanId);
  const interestAmount = repaymentAmount - loanAmount;
  console.log("   Principal:", hre.ethers.formatEther(loanAmount), "ETH");
  console.log(
    "   Interest (5%):",
    hre.ethers.formatEther(interestAmount),
    "ETH"
  );
  console.log(
    "   Total Repayment:",
    hre.ethers.formatEther(repaymentAmount),
    "ETH"
  );

  // TRANSACTION 5: Borrower repays the loan
  console.log("\n💵 TRANSACTION 5: Repay Loan");
  console.log("-".repeat(60));

  console.log("   Borrower:", borrower.address);
  console.log("   Repaying:", hre.ethers.formatEther(repaymentAmount), "ETH");

  const tx3 = await borrowerContract.repayLoan(loanId, {
    value: repaymentAmount,
  });

  console.log("\n   ⏳ Transaction sent:", tx3.hash);
  const receipt3 = await tx3.wait();
  console.log("   ✅ Transaction confirmed! Block:", receipt3.blockNumber);

  // Check final loan status
  const repaidLoan = await microLending.getLoan(loanId);
  console.log(
    "   📊 Final Loan Status:",
    ["Requested", "Funded", "Repaid", "Defaulted", "Cancelled"][repaidLoan[9]]
  );
  console.log(
    "   💰 Repaid Amount:",
    hre.ethers.formatEther(repaidLoan[7]),
    "ETH"
  ); // repaidAmount

  // TRANSACTION 6: Check borrower reputation
  console.log("\n⭐ TRANSACTION 6: Check Reputation");
  console.log("-".repeat(60));

  const reputation = await microLending.userReputation(borrower.address);
  console.log("   Borrower:", borrower.address);
  console.log("   Reputation Score:", reputation.toString(), "/ 100");
  console.log("   (Increased by 10 after successful repayment!)");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 ALL TRANSACTIONS COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log("\n📋 Summary:");
  console.log("   ✅ Contract deployed to:", contractAddress);
  console.log("   ✅ Loan requested by borrower");
  console.log("   ✅ Loan funded by lender");
  console.log("   ✅ Loan repaid with interest");
  console.log("   ✅ Reputation updated");
  console.log("\n💡 Total transactions: 6 (1 deployment + 5 interactions)");
  console.log("💰 Principal: 2 ETH");
  console.log("📈 Interest paid: 0.1 ETH (5%)");
  console.log("⭐ Borrower reputation: +10 points\n");

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    transactions: {
      deployment: tx1.hash,
      funding: tx2.hash,
      repayment: tx3.hash,
    },
  };

  fs.writeFileSync(
    "./demo-deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to demo-deployment.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
