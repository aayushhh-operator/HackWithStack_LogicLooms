# 🦊 MetaMask Setup Guide for MicroLend

Complete guide to setting up and using MetaMask with the MicroLend platform.

## 📋 Table of Contents

- [Installing MetaMask](#installing-metamask)
- [Creating a Wallet](#creating-a-wallet)
- [Importing Test Accounts](#importing-test-accounts)
- [Adding Hardhat Network](#adding-hardhat-network)
- [Connecting to MicroLend](#connecting-to-microlend)
- [Common Issues](#common-issues)
- [Security Best Practices](#security-best-practices)

## 🔧 Installing MetaMask

### Browser Extension (Recommended)

1. **Visit MetaMask Website**
   - Go to [metamask.io](https://metamask.io/)
   - Click "Download" button

2. **Choose Your Browser**
   - Chrome/Brave
   - Firefox
   - Edge
   - Opera

3. **Install Extension**
   - Click "Add to Chrome" (or your browser)
   - Click "Add Extension"
   - MetaMask icon will appear in browser toolbar

4. **Pin Extension**
   - Click puzzle icon in toolbar
   - Find MetaMask
   - Click pin icon to keep it visible

### Mobile App

- **iOS**: Download from App Store
- **Android**: Download from Google Play Store

## 🆕 Creating a Wallet

### First Time Setup

1. **Open MetaMask**
   - Click MetaMask icon in browser
   - Click "Get Started"

2. **Create New Wallet**
   - Click "Create a new wallet"
   - Click "I agree" to terms

3. **Create Password**
   - Enter strong password (min 8 characters)
   - Confirm password
   - Check agreement box
   - Click "Create new wallet"

4. **Secure Your Wallet**
   - Click "Secure my wallet (recommended)"
   - Watch the security video (optional)

5. **Secret Recovery Phrase**
   - Click "Reveal Secret Recovery Phrase"
   - **⚠️ CRITICAL: Write down all 12 words in order**
   - Store in a safe place (NOT on your computer)
   - Click "Next"

6. **Confirm Secret Phrase**
   - Select words in correct order
   - Click "Confirm"
   - Click "Got it!"

### ⚠️ Security Warning

**NEVER share your Secret Recovery Phrase with anyone!**

- MetaMask will NEVER ask for your phrase
- Anyone with your phrase can steal your funds
- Write it on paper, don't save digitally
- Make multiple copies stored separately

## 🔑 Importing Test Accounts

When you run the Hardhat local node, it provides 20 test accounts with 10,000 ETH each. Here's how to import them:

### Step 1: Start Hardhat Node

```bash
cd contracts
npx hardhat node
```

### Step 2: Copy Private Key

You'll see output like:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

### Step 3: Import to MetaMask

1. **Open MetaMask**
   - Click MetaMask icon
   - Click account circle (top right)

2. **Import Account**
   - Click "Import account"
   - Select "Private Key" from dropdown

3. **Paste Private Key**
   - Copy private key from terminal (without "0x" prefix is fine)
   - Paste into field
   - Click "Import"

4. **Rename Account (Optional)**
   - Click three dots next to account
   - Select "Account details"
   - Click edit icon next to name
   - Enter "Hardhat Test Account 1"
   - Click save

5. **Repeat for More Accounts**
   - Import multiple test accounts if needed
   - Each account has 10,000 ETH for testing

### ⚠️ Important Notes

- **Test accounts only**: Never use these private keys for real ETH
- **Public keys**: These are publicly known test keys
- **Reset data**: If you restart Hardhat node, you must re-import accounts

## 🌐 Adding Hardhat Network

### Method 1: Manual Configuration

1. **Open Networks Menu**
   - Click MetaMask icon
   - Click network dropdown (shows "Ethereum Mainnet" by default)
   - Scroll down and click "Add network"

2. **Add Network Manually**
   - Click "Add a network manually" at bottom

3. **Enter Network Details**

   ```
   Network Name: Hardhat Local
   New RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   Block Explorer URL: (leave empty)
   ```

4. **Save Network**
   - Click "Save"
   - Click "Switch to Hardhat Local"

### Method 2: Quick Add (from MicroLend)

When you connect your wallet on MicroLend for the first time with Hardhat running:

1. MicroLend will detect wrong network
2. You'll see a prompt to switch networks
3. Click "Switch Network"
4. MetaMask will pop up asking to add the network
5. Click "Approve" then "Switch network"

### Switching Networks

To switch between networks:

1. Click MetaMask icon
2. Click network dropdown at top
3. Select "Hardhat Local" or any other network

## 🔗 Connecting to MicroLend

### First Time Connection

1. **Navigate to MicroLend**
   - Open `http://localhost:5173` in browser
   - Ensure Hardhat node is running

2. **Click "Connect Wallet"**
   - On landing page or dashboard
   - MetaMask popup will appear

3. **Select Account**
   - Choose imported test account
   - Click "Next"

4. **Connect**
   - Review permissions
   - Click "Connect"

5. **Verify Connection**
   - You should see your address in navbar
   - Format: `0xf39F...2266`

### Approving Transactions

When you perform actions (request loan, fund loan, repay):

1. **Transaction Popup**
   - MetaMask automatically pops up
   - Shows transaction details

2. **Review Details**
   - **To**: Contract address
   - **Amount**: ETH being sent (if any)
   - **Gas Fee**: Usually very low on test network

3. **Confirm or Reject**
   - Click "Confirm" to proceed
   - Click "Reject" to cancel

4. **Wait for Confirmation**
   - Transaction processes on blockchain
   - Usually instant on local Hardhat network
   - MicroLend shows loading state

### Disconnecting Wallet

To disconnect your wallet:

1. Click MetaMask icon
2. Click three dots (top right)
3. Select "Connected sites"
4. Find "localhost:5173"
5. Click "Disconnect"

## 🐛 Common Issues

### Issue 1: "Nonce Too High" Error

**Problem**: Transaction fails with nonce error after restarting Hardhat node.

**Solution**:

1. Click MetaMask icon
2. Click account circle → Settings
3. Click "Advanced"
4. Click "Clear activity tab data"
5. Confirm by clicking "Clear"
6. Refresh MicroLend page

### Issue 2: Can't Connect to Hardhat Network

**Problem**: MetaMask can't connect to localhost.

**Solutions**:

- Ensure Hardhat node is running (`npx hardhat node`)
- Check Chain ID is 31337 (not 1337)
- Try `http://127.0.0.1:8545` instead of `http://localhost:8545`
- Disable VPN if active
- Check Windows Firewall isn't blocking port 8545

### Issue 3: Transaction Stuck Pending

**Problem**: Transaction shows "Pending" forever.

**Solutions**:

1. **Cancel Transaction**
   - Open MetaMask
   - Click "Activity" tab
   - Click pending transaction
   - Click "Cancel" or "Speed Up"

2. **Reset Account** (if cancel doesn't work)
   - Settings → Advanced
   - Click "Reset Account"
   - Confirm reset
   - **Note**: This clears transaction history but keeps wallet

### Issue 4: Insufficient Funds

**Problem**: Can't perform transactions, shows "Insufficient funds".

**Solutions**:

- Verify you're on Hardhat Local network
- Check account has ETH balance (should be ~10,000 ETH)
- If balance is 0, re-import account or restart Hardhat node
- Make sure you imported the private key correctly

### Issue 5: MetaMask Not Detected

**Problem**: MicroLend says "MetaMask not detected".

**Solutions**:

- Install MetaMask extension
- Enable extension in browser
- Refresh the page
- Try different browser
- Check browser isn't in incognito/private mode (some settings block extensions)

### Issue 6: Wrong Network

**Problem**: MetaMask connected but shows "Wrong network" on MicroLend.

**Solutions**:

1. Click network dropdown in MetaMask
2. Select "Hardhat Local"
3. If not listed, add it manually (see [Adding Hardhat Network](#adding-hardhat-network))

### Issue 7: Can't See Transaction in Activity

**Problem**: Confirmed transaction doesn't show in MetaMask activity.

**Solutions**:

- Click "Activity" tab in MetaMask
- Check you're on correct account
- Check you're on correct network (Hardhat Local)
- Transaction may still be processing (wait a few seconds)

## 🔒 Security Best Practices

### For Development (Test Networks)

✅ **DO**:
- Use test accounts provided by Hardhat
- Keep test private keys separate from real keys
- Clear browser data after testing

❌ **DON'T**:
- Use test private keys with real ETH
- Share test accounts (they're public anyway)
- Store test keys in production code

### For Production (Real Networks)

✅ **DO**:
- Use hardware wallet (Ledger, Trezor) for large amounts
- Keep Secret Recovery Phrase offline
- Use strong, unique password
- Enable password lock in MetaMask settings
- Verify website URL before connecting
- Review all transaction details before confirming
- Keep browser and MetaMask updated

❌ **DON'T**:
- Share Secret Recovery Phrase with ANYONE
- Store phrase digitally (photos, notes apps, cloud)
- Connect to unknown/suspicious websites
- Approve transactions you don't understand
- Use same password as other accounts
- Click suspicious links in emails/DMs

### Additional Security Settings

1. **Auto-Lock Timer**
   - Settings → General
   - Set "Auto-Lock Timer" to 5 minutes
   - MetaMask locks after inactivity

2. **Privacy Mode**
   - Settings → Security & Privacy
   - Enable "Privacy Mode"
   - Must approve each site connection

3. **Phishing Detection**
   - Settings → Security & Privacy
   - Enable "Phishing Detection"
   - MetaMask warns about known scam sites

4. **Show Test Networks**
   - Settings → Advanced
   - Enable "Show test networks"
   - See Sepolia, Goerli for testing

## 📱 Mobile MetaMask

Using MicroLend on mobile:

1. **Install MetaMask App**
   - Download from App/Play Store
   - Create/import wallet

2. **Connect to MicroLend**
   - Open MetaMask app
   - Tap browser icon (bottom)
   - Navigate to your deployed MicroLend URL
   - Connect wallet

3. **Local Development**
   - Cannot connect to localhost from mobile
   - Must deploy to test network (Sepolia) or use tunneling (ngrok)

## 🆘 Getting Help

If you're still having issues:

1. **Check Console**
   - Right-click page → Inspect
   - Click "Console" tab
   - Look for errors

2. **Check MetaMask**
   - Settings → Advanced
   - Enable "Show test networks" and "Show conversion on test networks"

3. **GitHub Issues**
   - Report bug: [GitHub Issues](https://github.com/aayushhh-operator/HackWithStack_LogicLooms/issues)

4. **MetaMask Support**
   - Visit: [support.metamask.io](https://support.metamask.io)
   - Community: [community.metamask.io](https://community.metamask.io)

## 🎯 Quick Reference

### Common Commands

```bash
# Start Hardhat node
cd contracts && npx hardhat node

# Deploy contract
cd contracts && npx hardhat ignition deploy ignition/modules/MicroLending.js --network localhost

# Reset MetaMask connection
# Settings → Advanced → Reset Account
```

### Network Details

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Hardhat Local | 31337 | http://127.0.0.1:8545 |
| Sepolia Testnet | 11155111 | https://sepolia.infura.io/v3/YOUR_KEY |
| Ethereum Mainnet | 1 | https://mainnet.infura.io/v3/YOUR_KEY |

### Test Account Info

- **Accounts**: 20 test accounts
- **Balance**: 10,000 ETH each
- **Reset**: Restart Hardhat node to reset balances

---

**Last Updated**: November 21, 2025

**Related Guides**:
- [Quick Start Guide](../README.md#-starting-the-application)
- [Troubleshooting](../README.md#-troubleshooting)
- [Smart Contract Functions](../README.md#-smart-contract-functions)
