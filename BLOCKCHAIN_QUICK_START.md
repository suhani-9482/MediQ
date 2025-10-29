# ⚡ Blockchain Quick Start - Stage 5

## 🚀 Get Started in 5 Steps

### Step 1: Database Migration (2 min)
```bash
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of DATABASE_BLOCKCHAIN_MIGRATION.sql
3. Paste and Run
4. Verify: You should see 9 new blockchain_* columns
```

### Step 2: Deploy Smart Contract (5 min)

#### Option A: Use Remix (Easiest)
1. Go to https://remix.ethereum.org/
2. Create new file: `DocumentRegistry.sol`
3. Copy contract code from `contracts/DocumentRegistry.sol`
4. Compile (Ctrl+S)
5. Deploy:
   - Environment: "Injected Provider - MetaMask"
   - Network: Sepolia
   - Deploy → Confirm in MetaMask
6. Copy contract address

#### Option B: Use Hardhat (Advanced)
```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize
npx hardhat init

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

### Step 3: Configure Contract Address (30 sec)

Add to your `.env` file:
```env
VITE_CONTRACT_ADDRESS=0x... (your deployed contract address)
```

Or set in browser console:
```javascript
localStorage.setItem('MEDIQ_CONTRACT_ADDRESS', '0x...')
```

### Step 4: Get Test ETH (2 min)

Get free Sepolia ETH from faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

You need ~0.01 ETH for testing.

### Step 5: Test Anchoring (2 min)
```
1. Go to Medical Records page
2. Connect MetaMask (top right)
3. Switch to Sepolia network
4. Click "⛓️ Anchor to Blockchain" on any file
5. Confirm transaction in MetaMask
6. Watch the magic! ✨
```

---

## 📂 What Was Created

### Smart Contract
```
contracts/DocumentRegistry.sol       ← Solidity smart contract
```

### Services
```
src/services/blockchain.js           ← Blockchain operations
src/services/metadata.js             ← Updated with blockchain functions
```

### Components
```
src/components/Blockchain/
  ├── MetaMaskConnect.jsx            ← Wallet connection
  ├── MetaMaskConnect.css
  ├── BlockchainAnchorButton.jsx     ← Anchor button
  ├── BlockchainAnchorButton.css
  ├── BlockchainStatusBadge.jsx      ← Status badge
  └── BlockchainStatusBadge.css
```

### Database
```
DATABASE_BLOCKCHAIN_MIGRATION.sql    ← Database migration
```

---

## 🎯 Key Features

✅ **MetaMask Integration** - Connect wallet with one click  
✅ **Document Anchoring** - Immutable proof on blockchain  
✅ **Transaction Tracking** - Real-time status updates  
✅ **Etherscan Links** - Direct verification links  
✅ **Gas Estimation** - Know costs before confirming  
✅ **Network Switching** - Auto-switch to Sepolia  

---

## 💻 Usage Examples

### Connect Wallet
```
1. Click "Connect Wallet" button
2. Approve in MetaMask
3. See address and balance
```

### Anchor Document
```
1. Click "⛓️ Anchor to Blockchain"
2. Review gas estimate
3. Confirm in MetaMask
4. Wait for confirmation
5. See "✅ Anchored on Blockchain"
```

### Verify on Etherscan
```
1. Find anchored file (green badge)
2. Click 🔗 next to TX hash
3. Opens Etherscan with transaction details
```

### Verify on Chain
```
1. Click "🔍 Verify on Chain" button
2. Checks blockchain for document hash
3. Shows confirmation message
```

---

## 🎨 Status Indicators

| Icon | Status | Color | Meaning |
|------|--------|-------|---------|
| ⛓️ | Not anchored | Gray | Click to anchor |
| ⏳ | Pending | Yellow | Transaction processing |
| ✅ | Anchored | Green | Success! |
| ❌ | Failed | Red | Click retry |

---

## 🛠️ Troubleshooting

### Issue: "MetaMask not installed"
**Fix**: Install MetaMask extension:
- Chrome: https://metamask.io/download/
- Firefox: https://metamask.io/download/
- Mobile: Download MetaMask app

### Issue: "Wrong network"
**Fix**: Click "⚠️ Wrong Network" → Auto-switches to Sepolia

### Issue: "Insufficient funds"
**Fix**: Get free Sepolia ETH from faucets (see Step 4)

### Issue: "Contract not deployed"
**Fix**: Deploy contract first (see Step 2)

### Issue: "Transaction failed"
**Fix**: Check:
1. Sufficient ETH balance
2. Correct network (Sepolia)
3. Contract deployed correctly

---

## 📊 Database Columns Added

```sql
blockchain_hash              -- SHA-256 hash of document
blockchain_tx_hash           -- Ethereum transaction hash
blockchain_block_number      -- Block number
blockchain_timestamp         -- When anchored
blockchain_status            -- none/pending/anchored/failed
blockchain_network           -- sepolia/mainnet
blockchain_gas_used          -- Gas consumed
blockchain_contract_address  -- Contract address
blockchain_anchored_by       -- Wallet address
```

---

## 🔗 Smart Contract Functions

```solidity
anchorDocument(hash, ipfsCid)  -- Anchor document
verifyDocument(hash)            -- Verify if exists
getDocument(hash)               -- Get document details
getUserDocuments(address)       -- Get user's documents
documentCount()                 -- Total anchored count
```

---

## 💰 Cost Estimation

### Sepolia Testnet (Free)
- Deployment: ~0.005 ETH (free from faucet)
- Per anchor: ~0.0001 ETH (free from faucet)
- Verification: Free (read-only)

### Mainnet (Real Cost)
- Deployment: ~$50-100 (one-time)
- Per anchor: ~$1-5 (depends on gas)
- Verification: Free (read-only)

---

## ⚡ Quick Commands

### Check if migration ran
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'file_metadata' 
AND column_name LIKE 'blockchain%';
```

Should return 9 rows!

### Check anchored files
```sql
SELECT file_name, blockchain_hash, blockchain_tx_hash 
FROM file_metadata 
WHERE blockchain_status = 'anchored';
```

### Deploy contract with Remix
```
1. https://remix.ethereum.org/
2. New file → DocumentRegistry.sol
3. Paste contract code
4. Compile → Deploy to Sepolia
```

---

## 🎉 That's It!

**You're ready to anchor documents on blockchain!**

Questions? Check the full implementation guide.

---

## 📝 Checklist

- [ ] Run database migration
- [ ] Deploy smart contract
- [ ] Set contract address
- [ ] Get Sepolia ETH
- [ ] Connect MetaMask
- [ ] Anchor first document
- [ ] Verify on Etherscan

---

**Status**: ✅ Ready to Use  
**Time to Setup**: ~10 minutes  
**Complexity**: ⭐⭐ Intermediate
