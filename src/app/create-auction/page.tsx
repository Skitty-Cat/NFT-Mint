"use client";

// CreateAuctionPage.tsx (for creating English auctions in MarketplaceV3)

import { useState } from "react";
import { useActiveAccount, ConnectButton, useSendTransaction } from "thirdweb/react";
import { createThirdwebClient, getContract, defineChain, toWei } from "thirdweb";
import { createAuction } from "thirdweb/extensions/marketplace"; // Import auction creation extension

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

export default function CreateAuctionPage() {
  const account = useActiveAccount();
  const [assetContract, setAssetContract] = useState("0x2F34457eb8c577B2e0e12cfcFe48FDeB600ea4C9"); // Default to known NFT address from previous context
  const [tokenId, setTokenId] = useState("0"); // Default to 0, user input for minted NFT ID
  const [quantity, setQuantity] = useState("1");
  const [minBid, setMinBid] = useState("0.03"); // Reserve price per token
  const [buyout, setBuyout] = useState("1000000000000000000"); // High value like 1e18 tPLS for "unlimited"
  const [durationDays, setDurationDays] = useState("1"); // Auction duration in days
  const [error, setError] = useState<string | null>(null);

  // Send transaction for creating auction
  const { mutate: sendTx, isPending: loading } = useSendTransaction({
    onSuccess: () => {
      alert("Auction created! Refresh auctions page.");
    },
    onError: (err) => {
      console.error("Create auction failed:", err);
      setError(err.message || "Failed to create auction. Ensure you own the NFT and approved the marketplace.");
    },
  });

  const createNewAuction = () => {
    if (!account) return;
    if (!assetContract || assetContract === "0x0000000000000000000000000000000000000000") {
      setError("Please enter a valid NFT contract address.");
      return;
    }
    setError(null);

    try {
      const startTime = Math.floor(Date.now() / 1000); // Now
      const endTime = startTime + (Number(durationDays) * 86400); // Days to seconds

      const tx = createAuction({
        contract: marketplaceContract,
        assetContract: assetContract,
        tokenId: BigInt(tokenId),
        quantity: BigInt(quantity),
        currency: "0x0000000000000000000000000000000000000000", // Native token (tPLS)
        minimumBidAmount: toWei(minBid),
        buyoutBidAmount: toWei(buyout), // High value to avoid bid cap
        timeBufferInSeconds: 300n, // 5 min default
        bidBufferBps: 500n, // 5% default
        startTimestamp: BigInt(startTime),
        endTimestamp: BigInt(endTime),
      });

      sendTx(tx);
    } catch (err) {
      console.error("Failed to prepare auction:", err);
      setError("Failed to prepare auction creation. Check if address is valid and inputs are numbers.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <ConnectButton client={client} chain={customChain} />

      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-2">
        <label>NFT Contract Address:</label>
        <input
          className="w-full border p-2 rounded"
          type="text"
          value={assetContract}
          onChange={(e) => setAssetContract(e.target.value)}
          placeholder="e.g., 0x2F34457eb8c577B2e0e12cfcFe48FDeB600ea4C9"
        />
      </div>

      <div className="space-y-2">
        <label>Token ID (from your minted NFT):</label>
        <input
          className="w-full border p-2 rounded"
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label>Quantity:</label>
        <input
          className="w-full border p-2 rounded"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label>Reserve Price Per Token (min bid):</label>
        <input
          className="w-full border p-2 rounded"
          type="number"
          value={minBid}
          onChange={(e) => setMinBid(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label>Buyout Price Per Token (set high for unlimited bids):</label>
        <input
          className="w-full border p-2 rounded"
          type="text" // Text for large numbers
          value={buyout}
          onChange={(e) => setBuyout(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label>Auction Duration (days):</label>
        <input
          className="w-full border p-2 rounded"
          type="number"
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
        />
      </div>

      <button
        onClick={createNewAuction}
        disabled={loading}
        className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Creating Auction..." : "Create Auction"}
      </button>
    </div>
  );
}