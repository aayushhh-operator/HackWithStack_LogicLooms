// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MicroLending
 * @dev A decentralized micro-lending platform with risk scoring
 */
contract MicroLending is ReentrancyGuard, Ownable {
    // Loan status enum
    enum LoanStatus {
        Requested,
        Funded,
        Repaid,
        Defaulted,
        Cancelled
    }

    // Loan structure
    struct Loan {
        uint256 id;
        address borrower;
        address lender;
        uint256 amount;
        uint256 interestRate; // in basis points (100 = 1%)
        uint256 duration; // in seconds
        uint256 dueDate;
        uint256 repaidAmount;
        LoanStatus status;
        uint256 riskScore; // 0-100
        uint256 createdAt;
        string purpose;
    }

    // State variables
    uint256 private loanCounter;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;
    mapping(address => uint256) public userReputation; // 0-100

    uint256 public platformFee = 50; // 0.5% in basis points
    uint256 public totalPlatformFees;

    // Events
    event LoanRequested(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 interestRate,
        uint256 duration,
        uint256 riskScore
    );

    event LoanFunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 amount
    );

    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount
    );

    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);

    event LoanCancelled(uint256 indexed loanId, address indexed borrower);

    constructor() Ownable(msg.sender) {
        loanCounter = 0;
    }

    /**
     * @dev Request a new loan
     * @param _amount Loan amount in wei
     * @param _interestRate Interest rate in basis points (100 = 1%)
     * @param _duration Loan duration in seconds
     * @param _purpose Purpose of the loan
     */
    function requestLoan(
        uint256 _amount,
        uint256 _interestRate,
        uint256 _duration,
        string memory _purpose
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            _interestRate > 0 && _interestRate <= 10000,
            "Invalid interest rate"
        );
        require(
            _duration >= 1 days && _duration <= 365 days,
            "Invalid duration"
        );

        loanCounter++;
        uint256 riskScore = calculateRiskScore(msg.sender, _amount);

        loans[loanCounter] = Loan({
            id: loanCounter,
            borrower: msg.sender,
            lender: address(0),
            amount: _amount,
            interestRate: _interestRate,
            duration: _duration,
            dueDate: 0,
            repaidAmount: 0,
            status: LoanStatus.Requested,
            riskScore: riskScore,
            createdAt: block.timestamp,
            purpose: _purpose
        });

        borrowerLoans[msg.sender].push(loanCounter);

        emit LoanRequested(
            loanCounter,
            msg.sender,
            _amount,
            _interestRate,
            _duration,
            riskScore
        );

        return loanCounter;
    }

    /**
     * @dev Fund a loan request
     * @param _loanId ID of the loan to fund
     */
    function fundLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.Requested, "Loan not available");
        require(msg.sender != loan.borrower, "Cannot fund own loan");
        require(msg.value == loan.amount, "Incorrect amount");

        loan.lender = msg.sender;
        loan.status = LoanStatus.Funded;
        loan.dueDate = block.timestamp + loan.duration;

        lenderLoans[msg.sender].push(_loanId);

        // Transfer funds to borrower
        (bool success, ) = payable(loan.borrower).call{value: loan.amount}("");
        require(success, "Transfer failed");

        emit LoanFunded(_loanId, msg.sender, msg.value);
    }

    /**
     * @dev Repay a loan
     * @param _loanId ID of the loan to repay
     */
    function repayLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.Funded, "Loan not active");
        require(msg.sender == loan.borrower, "Only borrower can repay");

        uint256 totalRepayment = calculateRepaymentAmount(_loanId);
        require(msg.value >= totalRepayment, "Insufficient repayment amount");

        loan.repaidAmount = msg.value;
        loan.status = LoanStatus.Repaid;

        // Calculate platform fee
        uint256 fee = (totalRepayment * platformFee) / 10000;
        totalPlatformFees += fee;

        // Transfer to lender minus fee
        uint256 lenderAmount = msg.value - fee;
        (bool success, ) = payable(loan.lender).call{value: lenderAmount}("");
        require(success, "Transfer to lender failed");

        // Update reputation
        userReputation[msg.sender] = calculateNewReputation(msg.sender, true);

        emit LoanRepaid(_loanId, msg.sender, msg.value);
    }

    /**
     * @dev Mark loan as defaulted (can be called by lender after due date)
     * @param _loanId ID of the loan
     */
    function markAsDefaulted(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.Funded, "Loan not active");
        require(msg.sender == loan.lender, "Only lender can mark default");
        require(block.timestamp > loan.dueDate, "Loan not overdue");

        loan.status = LoanStatus.Defaulted;

        // Decrease borrower reputation
        userReputation[loan.borrower] = calculateNewReputation(
            loan.borrower,
            false
        );

        emit LoanDefaulted(_loanId, loan.borrower);
    }

    /**
     * @dev Cancel a loan request (only if not funded)
     * @param _loanId ID of the loan
     */
    function cancelLoan(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.Requested, "Cannot cancel");
        require(msg.sender == loan.borrower, "Only borrower can cancel");

        loan.status = LoanStatus.Cancelled;

        emit LoanCancelled(_loanId, msg.sender);
    }

    /**
     * @dev Calculate repayment amount including interest
     * @param _loanId ID of the loan
     * @return Total repayment amount
     */
    function calculateRepaymentAmount(
        uint256 _loanId
    ) public view returns (uint256) {
        Loan memory loan = loans[_loanId];
        uint256 interest = (loan.amount * loan.interestRate) / 10000;
        return loan.amount + interest;
    }

    /**
     * @dev Calculate risk score for a borrower
     * @param _borrower Address of borrower
     * @param _amount Loan amount
     * @return Risk score (0-100)
     */
    function calculateRiskScore(
        address _borrower,
        uint256 _amount
    ) public view returns (uint256) {
        uint256 reputation = userReputation[_borrower];
        // Ensure reputation is initialized to a neutral value if not set
        if (reputation == 0) {
            reputation = 50;
        }
        uint256 loanCount = borrowerLoans[_borrower].length;

        // Simple risk calculation
        // Higher reputation = lower risk
        // More loans = slightly lower risk (experience)
        // Larger amounts = higher risk

        uint256 reputationScore = reputation;
        uint256 experienceBonus = loanCount > 0
            ? (loanCount * 5 > 20 ? 20 : loanCount * 5)
            : 0;
        uint256 amountPenalty = _amount > 1 ether
            ? 20
            : (_amount * 20) / 1 ether;

        uint256 riskScore = 100 -
            reputationScore +
            amountPenalty -
            experienceBonus;

        return riskScore > 100 ? 100 : riskScore;
    }

    /**
     * @dev Calculate new reputation score
     * @param _user Address of user
     * @param _success Whether the loan was successful
     * @return New reputation score
     */
    function calculateNewReputation(
        address _user,
        bool _success
    ) private view returns (uint256) {
        uint256 currentRep = userReputation[_user];

        if (_success) {
            // Increase reputation on successful repayment
            uint256 newRep = currentRep + 10;
            return newRep > 100 ? 100 : newRep;
        } else {
            // Decrease reputation on default
            return currentRep > 20 ? currentRep - 20 : 0;
        }
    }

    /**
     * @dev Get all loans for a borrower
     * @param _borrower Address of borrower
     * @return Array of loan IDs
     */
    function getBorrowerLoans(
        address _borrower
    ) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }

    /**
     * @dev Get all loans for a lender
     * @param _lender Address of lender
     * @return Array of loan IDs
     */
    function getLenderLoans(
        address _lender
    ) external view returns (uint256[] memory) {
        return lenderLoans[_lender];
    }

    /**
     * @dev Get loan details
     * @param _loanId ID of the loan
     * @return Loan struct
     */
    function getLoan(uint256 _loanId) external view returns (Loan memory) {
        return loans[_loanId];
    }

    /**
     * @dev Get total number of loans
     * @return Total loan count
     */
    function getTotalLoans() external view returns (uint256) {
        return loanCounter;
    }

    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 amount = totalPlatformFees;
        totalPlatformFees = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Update platform fee (only owner)
     * @param _newFee New fee in basis points
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 500, "Fee too high"); // Max 5%
        platformFee = _newFee;
    }

    // Receive function to accept ETH
    receive() external payable {}
}
