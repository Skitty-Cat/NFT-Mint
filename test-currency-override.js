// Simple test to verify currency symbol override functionality
// This can be run with: node test-currency-override.js

function overrideCurrencySymbol(currencySymbol, chainId) {
  // PulseChain v4 testnet (chain ID 943) - override ETH to PLS
  if (chainId === 943 && currencySymbol === "ETH") {
    return "PLS";
  }
  
  return currencySymbol;
}

// Test cases
console.log("Testing currency symbol override function:");
console.log("");

// Test 1: PulseChain v4 testnet with ETH
console.log("Test 1: PulseChain v4 testnet (943) with ETH");
console.log(`Input: currencySymbol="ETH", chainId=943`);
console.log(`Output: "${overrideCurrencySymbol("ETH", 943)}"`);
console.log("Expected: PLS");
console.log("");

// Test 2: PulseChain v4 testnet with different symbol
console.log("Test 2: PulseChain v4 testnet (943) with USDC");
console.log(`Input: currencySymbol="USDC", chainId=943`);
console.log(`Output: "${overrideCurrencySymbol("USDC", 943)}"`);
console.log("Expected: USDC");
console.log("");

// Test 3: Ethereum mainnet with ETH
console.log("Test 3: Ethereum mainnet (1) with ETH");
console.log(`Input: currencySymbol="ETH", chainId=1`);
console.log(`Output: "${overrideCurrencySymbol("ETH", 1)}"`);
console.log("Expected: ETH");
console.log("");

// Test 4: Arbitrum with ETH
console.log("Test 4: Arbitrum (42161) with ETH");
console.log(`Input: currencySymbol="ETH", chainId=42161`);
console.log(`Output: "${overrideCurrencySymbol("ETH", 42161)}"`);
console.log("Expected: ETH");
console.log("");

// Test 5: Empty string
console.log("Test 5: Empty string on PulseChain");
console.log(`Input: currencySymbol="", chainId=943`);
console.log(`Output: "${overrideCurrencySymbol("", 943)}"`);
console.log("Expected: (empty string)");
console.log("");

console.log("All tests completed!"); 