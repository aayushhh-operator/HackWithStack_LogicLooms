# 🏦 LoanX - Decentralized Micro-Lending DApp

A full-stack decentralized micro-lending platform with user authentication, MetaMask integration, and smart contract interaction.

## ✨ Features

### Blockchain Features

- 💰 **Request Loans** with custom terms (amount, interest, duration)
- 🤝 **Fund Loans** as a lender
- 💸 **Repay Loans** with automatic interest calculation
- 📊 **Risk Scoring** system (0-100 scale)
- ⭐ **Reputation System** for borrowers
- 🛡️ **Security**: ReentrancyGuard, Ownable, input validation
- 📢 **Event Emissions** for full transparency

### Application Features

- 🔐 **User Authentication** - Secure login with MongoDB & JWT
- 💼 **MetaMask Integration** - Seamless wallet connection
- 📈 **Live Dashboard** - Real-time blockchain data
- 📊 **Transaction History** - Track all loans on-chain
- 🎨 **Modern UI** - Beautiful, responsive interface
- ⚡ **Real-time Updates** - Fetch latest data from blockchain

## 🚀 **Quick Start - INTEGRATED VERSION**

> **✅ Full integration complete!** See [`INTEGRATION_SUMMARY.md`](./INTEGRATION_SUMMARY.md) for details.

### Prerequisites

- Node.js & npm
- Python 3.x
- MongoDB Atlas account
- MetaMask browser extension

### 1. Install Dependencies

```bash
# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

### 2. Configure Backend

Create `.env` file in `backend/` folder:

```env
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key
```

### 3. Start All Services (4 Terminals)

**Terminal 1 - Blockchain:**

```bash
cd contracts
npx hardhat node
```

**Terminal 2 - Deploy Contract:**

```bash
cd contracts
npx hardhat ignition deploy ignition/modules/MicroLending.js --network localhost
```

**Terminal 3 - Backend:**

```bash
cd backend
python app.py
```

**Terminal 4 - Frontend:**

```bash
cd frontend
npm run dev
```

### 4. Access Application

1. Open http://localhost:5173
2. Sign up or login
3. Connect MetaMask
4. Start lending or borrowing!

## 📚 Documentation

- **[Integration Summary](./INTEGRATION_SUMMARY.md)** - What was integrated and how it works
- **[Integration Complete Guide](./INTEGRATION_COMPLETE.md)** - Detailed setup and usage
- **[Integration Checklist](./INTEGRATION_CHECKLIST.md)** - Testing and verification
- **[Quick Reference](./QUICK_REFERENCE.md)** - Commands and troubleshooting
- **[MetaMask Guide](./MDs/METAMASK_GUIDE.md)** - Wallet setup help

## 🎮 **Using the DApp**

### Sign Up & Login

1. Navigate to homepage
2. Click "Get Started" to create account
3. Fill in registration details
4. Login with your credentials

### Connect Wallet

1. Click "Connect Wallet" on Dashboard
2. Approve MetaMask connection
3. Ensure you're on Hardhat Local network (Chain ID: 31337)

### View Your Data

- Dashboard shows all your loans
- Real-time stats (Total Lent, Total Borrowed)
- On-chain reputation score
- Transaction history

### Create Loans

- Visit `/metamask-test` page
- Fill in loan details
- Confirm transaction in MetaMask
- View on Dashboard

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
├─→ Backend API (Flask) → MongoDB (User Auth)
    ↓
└─→ Web3Context (Ethers.js) → MetaMask → Smart Contract (Hardhat)
```

## 🛠️ Tech Stack

### Frontend

- React 18
- Vite
- TailwindCSS
- Ethers.js v6
- React Router

### Backend

- Flask
- PyMongo
- Flask-CORS
- JWT

### Blockchain

- Hardhat
- Solidity
- Ethers.js
- OpenZeppelin

### Database

- MongoDB Atlas

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
├── contracts/
│   ├── contracts/
│   │   └── MicroLending.sol          # Main smart contract
│   ├── scripts/
│   │   └── deploy.js                 # Deployment script
│   ├── test/
│   │   └── MicroLending.test.js      # Contract tests
│   ├── ignition/
│   │   └── modules/
│   │       └── MicroLending.js       # Ignition deployment module
│   └── hardhat.config.js             # Hardhat configuration
│
└── frontend/
    ├── src/
    │   ├── components/               # React components
    │   ├── pages/                    # Page components
    │   └── contracts/                # Contract ABI and config (create this)
    └── package.json

```

## 🧪 Run Tests

```bash
cd contracts
npx hardhat test
```

## 🦊 MetaMask Setup

1. Add Hardhat Network:

   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. Import test account private keys from the hardhat node output

## 📖 Full Documentation

See **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** for:

- Detailed deployment steps
- Frontend integration guide
- Web3 context setup
- Contract interaction hooks
- Complete code examples

## 🔑 Contract Functions

- `requestLoan(amount, interestRate, duration, purpose)` - Create loan request
- `fundLoan(loanId)` - Fund a loan
- `repayLoan(loanId)` - Repay a loan
- `getLoan(loanId)` - Get loan details
- `calculateRiskScore(borrower, amount)` - Calculate risk score

## 🛠️ Tech Stack

- **Smart Contract**: Solidity ^0.8.20
- **Development**: Hardhat 3.x
- **Testing**: Mocha + Chai
- **Frontend**: React + Vite
- **Web3 Library**: ethers.js v6
- **Security**: OpenZeppelin Contracts

## ⚠️ Security Notes

- ✅ ReentrancyGuard on all payable functions
- ✅ Access control with Ownable
- ✅ Input validation
- ✅ Safe transfer patterns
- ⚠️ **Never commit private keys!**
- ⚠️ Test thoroughly before mainnet deployment

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read IMPLEMENTATION_GUIDE.md first.

---

**Built for HackWithStack Hackathon by Team LogicLooms** 🚀
