import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Override currency symbol for specific chains
 * @param currencySymbol - The original currency symbol
 * @param chainId - The chain ID to check
 * @returns The overridden currency symbol or the original if no override is needed
 * 
 * Expected behavior:
 * - On PulseChain v4 testnet (chain ID 943), "ETH" should display as "PLS"
 * - On other chains, the symbol should remain unchanged
 * - ERC20 tokens should not be affected by this override
 */
export function overrideCurrencySymbol(currencySymbol: string, chainId: number): string {
  // PulseChain v4 testnet (chain ID 943) - override ETH to PLS
  if (chainId === 943 && currencySymbol === "ETH") {
    return "PLS";
  }
  
  return currencySymbol;
}
