const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MicroLending", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMicroLendingFixture() {
    const [owner, borrower, lender, otherAccount] = await ethers.getSigners();

    const MicroLending = await ethers.getContractFactory("MicroLending");
    const microLending = await MicroLending.deploy();

    return { microLending, owner, borrower, lender, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { microLending, owner } = await loadFixture(deployMicroLendingFixture);

      expect(await microLending.owner()).to.equal(owner.address);
    });

    it("Should start with 0 loans", async function () {
      const { microLending } = await loadFixture(deployMicroLendingFixture);

      expect(await microLending.getTotalLoans()).to.equal(0);
    });
  });

  describe("Loan Request", function () {
    it("Should allow a user to request a loan", async function () {
      const { microLending, borrower } = await loadFixture(deployMicroLendingFixture);

      const amount = ethers.parseEther("1.0");
      const interestRate = 500; // 5%
      const duration = 30 * 24 * 60 * 60; // 30 days
      const purpose = "Business expansion";

      const tx = await microLending.connect(borrower).requestLoan(amount, interestRate, duration, purpose);
      await tx.wait();

      // await expect(microLending.connect(borrower).requestLoan(amount, interestRate, duration, purpose))
      //   .to.emit(microLending, "LoanRequested")
      //   .withArgs(1, borrower.address, amount, interestRate, duration, anyValue);

      const loan = await microLending.getLoan(1);
      expect(loan.borrower).to.equal(borrower.address);
      expect(loan.amount).to.equal(amount);
      expect(loan.status).to.equal(0); // Requested
    });

    it("Should fail if amount is 0", async function () {
      const { microLending, borrower } = await loadFixture(deployMicroLendingFixture);

      await expect(
        microLending.connect(borrower).requestLoan(0, 500, 86400, "Test")
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Loan Funding", function () {
    it("Should allow a lender to fund a loan", async function () {
      const { microLending, borrower, lender } = await loadFixture(deployMicroLendingFixture);

      const amount = ethers.parseEther("1.0");
      await microLending.connect(borrower).requestLoan(amount, 500, 86400, "Test");

      await expect(microLending.connect(lender).fundLoan(1, { value: amount }))
        .to.emit(microLending, "LoanFunded")
        .withArgs(1, lender.address, amount);

      const loan = await microLending.getLoan(1);
      expect(loan.lender).to.equal(lender.address);
      expect(loan.status).to.equal(1); // Funded
    });

    it("Should fail if funding amount is incorrect", async function () {
      const { microLending, borrower, lender } = await loadFixture(deployMicroLendingFixture);

      const amount = ethers.parseEther("1.0");
      await microLending.connect(borrower).requestLoan(amount, 500, 86400, "Test");

      await expect(
        microLending.connect(lender).fundLoan(1, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Incorrect amount");
    });

    it("Should fail if borrower tries to fund their own loan", async function () {
      const { microLending, borrower } = await loadFixture(deployMicroLendingFixture);

      const amount = ethers.parseEther("1.0");
      await microLending.connect(borrower).requestLoan(amount, 500, 86400, "Test");

      await expect(
        microLending.connect(borrower).fundLoan(1, { value: amount })
      ).to.be.revertedWith("Cannot fund own loan");
    });
  });

  describe("Loan Repayment", function () {
    it("Should allow borrower to repay loan", async function () {
      const { microLending, borrower, lender } = await loadFixture(deployMicroLendingFixture);

      const amount = ethers.parseEther("1.0");
      const interestRate = 500; // 5%
      await microLending.connect(borrower).requestLoan(amount, interestRate, 86400, "Test");
      await microLending.connect(lender).fundLoan(1, { value: amount });

      const repaymentAmount = await microLending.calculateRepaymentAmount(1);
      
      await expect(microLending.connect(borrower).repayLoan(1, { value: repaymentAmount }))
        .to.emit(microLending, "LoanRepaid")
        .withArgs(1, borrower.address, repaymentAmount);

      const loan = await microLending.getLoan(1);
      expect(loan.status).to.equal(2); // Repaid
    });
  });
});
