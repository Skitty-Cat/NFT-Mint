"use client";

// CancelAuctionPage.tsx (for cancelling English auctions in MarketplaceV3)

import { useState } from "react";
import { useActiveAccount, ConnectButton, useSendTransaction } from "thirdweb/react";
import { createThirdwebClient, getContract, defineChain } from "thirdweb";
import { cancelAuction } from "thirdweb/extensions/marketplace"; // Import auction cancel extension

const client = createThirdwebClient({ clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID! });
const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!;
const chainId = Number(process.env.NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID!);

const customChain = defineChain({
  id: chainId,
  name: "PulseChain Testnet",
  rpc: "https://rpc.v4.testnet.pulsechain.com",
  nativeCurrency: {
    name: "Test Pulse",
    symbol: "tPLS",
    decimals: 18,
  },
  testnet: true,
});

const marketplaceContract = getContract({
  client,
  chain: customChain,
  address: marketplaceAddress,
});

export default function CancelAuctionPage() {
  const account = useActiveAccount();
  const [auctionId, setAuctionId] = useState(""); // User input for auction ID to cancel
  const [error, setError] = useState<string | null>(null);

  // Send transaction for cancelling auction
  const { mutate: sendTx, isPending: loading } = useSendTransaction({
    onSuccess: () => {
      alert("Auction cancelled! Refresh auctions page.");
    },
    onError: (err) => {
      console.error("Cancel auction failed:", err);
      setError(err.message || "Failed to cancel auction. Ensure you're the creator and no bids exist.");
    },
  });

  const cancelExistingAuction = () => {
    if (!account || !auctionId) return;
    setError(null);

    try {
      const tx = cancelAuction({
        contract: marketplaceContract,
        auctionId: BigInt(auctionId),
      });

      sendTx(tx);
    } catch (err) {
      console.error("Failed to prepare cancel:", err);
      setError("Failed to prepare auction cancel.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <ConnectButton client={client} chain={customChain} />

      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-2">
        <label>Auction ID (from your auctions list):</label>
        <input
          className="w-full border p-2 rounded"
          type="number"
          value={auctionId}
          onChange={(e) => setAuctionId(e.target.value)}
          placeholder="e.g., 1"
        />
      </div>

      <button
        onClick={cancelExistingAuction}
        disabled={loading}
        className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Cancelling Auction..." : "Cancel Auction"}
      </button>
    </div>
  );
}