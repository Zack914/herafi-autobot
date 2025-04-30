==============================
HDEFI to SUSHI Swap Bot (Optimism Sepolia)
==============================

This Node.js bot automatically swaps HDEFI tokens for SUSHI tokens on the Optimism Sepolia testnet using multiple wallet private keys.

------------------------------
Requirements
------------------------------
- Node.js (v16 or later)
- NPM
- RPC provider for Optimism Sepolia (already in script)
- HDEFI and SUSHI token contracts deployed on Optimism Sepolia
------------------------------
Setup Instructions
------------------------------

1. Clone the Repository
------------------------------
git clone https://github.com/Zack914/herafi-autobot.git
cd herafi-autobot

2. Install Dependencies
------------------------------
npm install

3. Add Private Keys
------------------------------
Create a file named `pvkeys.txt` with one private key per line:
Example:
0xabc123...
0xdef456...
...

4. Run the Bot
------------------------------
node index.js

------------------------------
Configuration
------------------------------
Edit the following in `index.js` if needed:
- amountInEth: Amount of HDEFI to swap per wallet
- RPC_URL: Use your preferred Sepolia RPC provider
- gasLimit & gasPrice: Adjust based on network usage

------------------------------
Security Warning
------------------------------
- NEVER commit or expose your `pvkeys.txt` file
- Only use Sepolia (testnet) wallets
- Store your private keys securely

------------------------------
Supported Tokens & Network
------------------------------
- Network: Optimism Sepolia Testnet
- Swap: HDEFI -> SUSHI (ERC-20)

------------------------------
TODO / Improvements
------------------------------
- ✅ Add retry logic
- ✅ CLI-configurable slippage
- 🔄 Log swap history to file
- 🔒 Encrypt private keys
