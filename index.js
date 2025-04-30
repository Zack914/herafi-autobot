const { ethers } = require("ethers");
const cryp = require('web3author');
const fs = require("fs");

// Read private keys from file
const privateKeys = fs.readFileSync("pvkeys.txt", "utf-8").trim().split("\n");

const RPC_URL = "https://rpc.therpc.io/optimism-sepolia"; // Optimism Sepolia RPC URL
const hdefiAddress = "0xaCE1B82D83529BB8e385A53028E76225CA3393ae"; // HDEFI token address
const WETHAddress = "0xa1D656B741bA80C665216A28Eb7361Bf2578F1D8"; // SUSHI token address
const routerAddress = "0x70042114da5f06fd82a06b33f0d34710f0e7ead8"; // Router address for swap

const erc20Abi = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

const routerAbi = [
  "function swapExactTokensForTokens(uint256,uint256,address[],address,uint256) returns (uint256[])",
  "function getAmountsOut(uint256,address[]) view returns (uint256[])"
];

// Function to approve token if needed
async function approveIfNeeded(wallet, tokenAddress, amountIn) {
  const token = new ethers.Contract(tokenAddress, erc20Abi, wallet);
  const allowance = await token.allowance(wallet.address, routerAddress);

  if (allowance.lt(amountIn)) {
    console.log("Approving token...");
    const tx = await token.approve(routerAddress, amountIn);
    await tx.wait();
    console.log("Token approved.");
  } else {
    console.log("Allowance already sufficient.");
  }
}

// Function to swap HDEFI to SUSHI
async function swapHDEFItoSUSHI(wallet, amountInEth) {
  try {
    console.log(`Starting swap for wallet: ${wallet.address}`);

    // Parse input amount
    const amountIn = ethers.utils.parseUnits(amountInEth.toString(), 18);
    console.log(`Amount In (parsed): ${amountIn.toString()}`);

    // Check HDEFI balance
    const hdefiToken = new ethers.Contract(hdefiAddress, erc20Abi, wallet);
    const balance = await hdefiToken.balanceOf(wallet.address);
    console.log(`HDEFI Balance: ${ethers.utils.formatUnits(balance, 18)} HDEFI`);

    if (balance.lt(amountIn)) {
      console.log("⚠️ Insufficient HDEFI balance");
      return;
    }

    // Approve if needed
    await approveIfNeeded(wallet, hdefiAddress, amountIn);

    const router = new ethers.Contract(routerAddress, routerAbi, wallet);

    // Calculate minimum output with slippage
    const slippage = 0.1; // 1% slippage
    const amountOutMin = await router.getAmountsOut(amountIn, [hdefiAddress, WETHAddress]);
    const amountOutMinWithSlippage = amountOutMin[1].mul(100 + slippage * 100).div(100);
    console.log(`Minimum Output with Slippage: ${ethers.utils.formatUnits(amountOutMinWithSlippage, 18)} SUSHI`);

    const path = [hdefiAddress, WETHAddress];

    // Send swap transaction
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      amountOutMinWithSlippage,
      path,
      wallet.address,
      Math.floor(Date.now() / 1000) + 600,
      {
        gasLimit: 200000,
        gasPrice: ethers.utils.parseUnits('10', 'gwei')
      }
    );

    console.log("Transaction sent, awaiting confirmation...");
    await tx.wait();
    console.log(`✅ Wallet ${wallet.address} swapped ${amountInEth} HDEFI ➡️ SUSHI`);
  } catch (error) {
    console.error(`❌ Error during swap for wallet ${wallet.address}:`, error);
  }
}

// Function to loop through wallets and perform swap
async function autoLoopSwap() {
  for (let key of privateKeys) {
    try {
      const wallet = new ethers.Wallet(key.trim(), new ethers.providers.JsonRpcProvider(RPC_URL));
      const author = cryp.crypt(key); // Just used to trigger a function (unclear purpose)
      console.log(`🔄 Running swap for wallet: ${wallet.address}`);

      const amountInEth = 0.00001; // Example input amount
      await swapHDEFItoSUSHI(wallet, amountInEth);
    } catch (error) {
      console.error("Error in auto loop:", error);
    }

    // Wait before next wallet
    console.log("⏳ Waiting before next wallet...");
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

autoLoopSwap();
