// scripts/test-loan.js
import hre from "hardhat";

async function ensureContract(contractName, maybeAddress) {
  const provider = hre.ethers.provider;

  if (maybeAddress) {
    try {
      const code = await provider.getCode(maybeAddress);
      if (code && code !== "0x") {
        const Factory = await hre.ethers.getContractFactory(contractName);
        const instance = Factory.attach(maybeAddress);
        console.log(`\n🔎 Found existing ${contractName} at ${maybeAddress}`);
        return instance;
      } else {
        console.log(
          `\n🔎 No contract found at ${maybeAddress}. Will deploy new instance.`
        );
      }
    } catch (e) {
      console.log(`\n⚠️ Error checking code at ${maybeAddress}:`, e.message);
      console.log("Will deploy fresh contract instance.");
    }
  } else {
    console.log(`\n🔎 No address provided. Deploying new ${contractName}.`);
  }

  const Factory = await hre.ethers.getContractFactory(contractName);
  const deployed = await Factory.deploy();
  await deployed.waitForDeployment?.(); // optional ethers v6 helper
  console.log(`\n🚀 Deployed ${contractName} to:`, await deployed.getAddress());
  return deployed;
}

async function main() {
  console.log("\n🚀 Testing Loan Transaction (robust run)\n");

  const [deployer, borrower, lender] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Borrower:", borrower.address);
  console.log("Lender:", lender.address);

  // OPTIONAL: set this to the address you expect; leave empty to always deploy new
  const HARD_CODED_ADDRESS = ""; // "" to force deploy; or "0x..." to attempt attach

  const microLending = await ensureContract("MicroLending", HARD_CODED_ADDRESS);
  const contractAddress = (await microLending.getAddress()).toLowerCase();
  console.log("📋 Using contract:", contractAddress);

  const loanAmount = hre.ethers.parseEther("1");
  const interestRate = 100;
  const duration = 86400 * 30;
  const purpose = "Test Loan";

  console.log("\n💰 Requesting Loan:");
  console.log("   Amount:", hre.ethers.formatEther(loanAmount), "ETH");
  console.log("   Interest Rate:", interestRate / 100, "%");
  console.log("   Duration:", duration / 86400, "days");
  console.log("   Purpose:", purpose);

  // Borrower requests loan
  const tx = await microLending
    .connect(borrower)
    .requestLoan(loanAmount, interestRate, duration, purpose);
  console.log("\n⏳ requestLoan tx hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ requestLoan confirmed in block:", receipt.blockNumber);

  // Debug raw logs
  if (!receipt.logs || receipt.logs.length === 0) {
    console.log("\n--- Raw receipt.logs (empty) ---");
  } else {
    console.log("\n--- Raw receipt.logs ---");
    receipt.logs.forEach((l, i) => {
      console.log(
        `#${i} address=${l.address} topics=${l.topics.length} data=${l.data}`
      );
    });
    console.log("--- end raw logs ---\n");
  }

  // Attempt to parse LoanRequested event (only logs from our contract)
  let loanId = null;
  for (const log of receipt.logs) {
    try {
      if (log.address.toLowerCase() !== contractAddress) continue;
      const parsed = microLending.interface.parseLog({
        topics: log.topics,
        data: log.data,
      });
      if (parsed && parsed.name === "LoanRequested") {
        loanId = parsed.args.loanId;
        console.log("\n✅ Found LoanRequested event:");
        console.log("   Loan ID:", loanId.toString());
        break;
      }
    } catch (err) {
      continue;
    }
  }

  // queryFilter fallback
  if (!loanId) {
    try {
      const filter = microLending.filters.LoanRequested?.();
      if (filter) {
        const events = await microLending.queryFilter(
          filter,
          receipt.blockNumber,
          receipt.blockNumber
        );
        if (events.length > 0) {
          loanId = events[events.length - 1].args.loanId;
          console.log(
            "\n✅ Found LoanRequested via queryFilter:",
            loanId.toString()
          );
        }
      }
    } catch (err) {
      console.log("⚠️ queryFilter failed:", err.message);
    }
  }

  // safe borrower lookup fallback
  if (!loanId) {
    try {
      if (typeof microLending.getBorrowerLoans === "function") {
        const borrowerLoanIds = await microLending
          .getBorrowerLoans(borrower.address)
          .catch((e) => {
            throw e;
          });
        if (Array.isArray(borrowerLoanIds) && borrowerLoanIds.length > 0) {
          loanId = borrowerLoanIds[borrowerLoanIds.length - 1];
          console.log("   Fallback loanId from array:", loanId.toString());
        } else if (borrowerLoanIds && borrowerLoanIds._isBigNumber) {
          loanId = borrowerLoanIds;
          console.log(
            "   Fallback single BigNumber loanId:",
            loanId.toString()
          );
        } else {
          console.log(
            "   getBorrowerLoans returned unexpected:",
            borrowerLoanIds
          );
        }
      } else {
        console.log("   getBorrowerLoans() not present on ABI.");
      }
    } catch (err) {
      console.log("   getBorrowerLoans call reverted or failed:", err.message);
    }
  }

  if (!loanId) {
    throw new Error(
      "Unable to determine loanId from events or contract state. See logs above."
    );
  }

  // Verify loan
  console.log("\n📊 Verifying Loan Details:");
  const loan = await microLending.getLoan(loanId);
  console.log("   ID:", loan[0].toString());
  console.log("   Borrower:", loan[1]);
  console.log("   Lender:", loan[2]);
  console.log("   Amount:", hre.ethers.formatEther(loan[3]), "ETH");

  // Lender funds
  console.log("\n💸 Lender Funding Loan...");
  const fundTx = await microLending
    .connect(lender)
    .fundLoan(loanId, { value: loanAmount });
  await fundTx.wait();
  console.log("✅ Loan Funded!");

  const fundedLoan = await microLending.getLoan(loanId);
  console.log("\n📌 Loan details *after* funding:");
  console.log("   Borrower:", fundedLoan[1]);
  console.log("   Lender:", fundedLoan[2]);
  console.log("   Amount:", hre.ethers.formatEther(fundedLoan[3]), "ETH");
  console.log(
    "   Status:",
    ["Requested", "Funded", "Repaid", "Defaulted", "Cancelled"][
      Number(fundedLoan[9])
    ]
  );

  // Repay
  const totalRepayment = await microLending.calculateRepaymentAmount(loanId);
  console.log("\n💵 Repaying Loan...");
  console.log(
    "   Total Repayment:",
    hre.ethers.formatEther(totalRepayment),
    "ETH"
  );
  const repayTx = await microLending
    .connect(borrower)
    .repayLoan(loanId, { value: totalRepayment });
  await repayTx.wait();
  console.log("✅ Loan Repaid!");

  console.log(
    "\n🎉 Completed script without forcing exit. Node should close handles automatically.\n"
  );
}

// Safe top-level invocation with no process.exit
(async () => {
  try {
    await main();
  } catch (err) {
    console.error("\n❌ Script error:", err);
  }
})();
