"use client";

// AuctionsPage.tsx (for listing all valid auctions)

import { useState } from "react";
import { useActiveAccount, ConnectButton, useReadContract, useSendTransaction, MediaRenderer } from "thirdweb/react";
import { createThirdwebClient, getContract, defineChain, toWei } from "thirdweb";
import { bidInAuction, getAllValidAuctions, getWinningBid } from "thirdweb/extensions/marketplace";
import { formatEther } from "ethers";

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

// Wrapper to return null instead of undefined if no winning bid
const getWinningBidOrNull = async ({ contract, auctionId }: { contract: any; auctionId: bigint }) => {
  const bid = await getWinningBid({ contract, auctionId });
  return bid ?? null;
};

function AuctionCard({ auction, refetchAuctions }: { auction: any; refetchAuctions: () => void }) {
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch winning bid using the wrapper
  const { data: winningBid } = useReadContract(
    getWinningBidOrNull,
    {
      contract: marketplaceContract,
      auctionId: auction.id,
      queryOptions: { enabled: !!marketplaceContract && !!auction.id },
    }
  );

  // Compute minimum required bid
  let minRequiredBid = auction.minimumBidAmount;
  if (winningBid && winningBid.bidAmount > 0n) {
    const multiplier = 10000n + (auction.bidBufferBps ?? 0n);
    minRequiredBid = (winningBid.bidAmount * multiplier + 9999n) / 10000n;
  }

  // Send transaction for bidding
  const { mutate: sendTx, isPending: loading } = useSendTransaction({
    onSuccess: () => {
      setBidAmount("");
      setError(null);
      refetchAuctions(); // Refresh the auctions list
    },
    onError: (err) => {
      console.error("Bid failed:", err);
      setError(err.message || "Bid failed. Please check the console for details.");
    },
  });

  const placeBid = () => {
    if (!bidAmount) return;
    setError(null);

    try {
      const bidWei = toWei(bidAmount);

      // Client-side validation
      if (bidWei < minRequiredBid) {
        setError(`Bid must be at least ${formatEther(minRequiredBid)} tPLS`);
        return;
      }
      // Only check against buyout if buyout is set (> 0)
      if (auction.buyoutBidAmount > 0n && bidWei > auction.buyoutBidAmount) {
        setError(`Bid cannot exceed buyout of ${formatEther(auction.buyoutBidAmount)} tPLS`);
        return;
      }

      const tx = bidInAuction({
        contract: marketplaceContract,
        auctionId: auction.id,
        bidAmount: bidWei,
      });

      sendTx(tx);
    } catch (err) {
      console.error("Failed to prepare bid:", err);
      setError("Failed to place bid.");
    }
  };

  return (
    <div className="rounded-2xl shadow p-4 border space-y-2">
      <h2 className="text-xl font-bold">Auction #{auction.id.toString()}</h2>

      {auction.asset.metadata.image && (
        <div className="aspect-square overflow-hidden rounded-lg mb-4">
          <MediaRenderer
            client={client}
            src={auction.asset.metadata.image}
            className="w-full h-full object-cover"
            alt={`NFT ${auction.tokenId.toString()}`}
          />
        </div>
      )}

      <p className="text-sm">Asset Contract: <code>{auction.assetContractAddress}</code></p>
      <p className="text-sm">Token ID: {auction.tokenId.toString()}</p>
      <p className="text-sm">Seller: {auction.creatorAddress}</p>
      <p className="text-sm">Quantity: {auction.quantity.toString()}</p>
      <p className="text-sm">Min Bid: {formatEther(auction.minimumBidAmount)} tPLS</p>
      <p className="text-sm">Buyout: {auction.buyoutBidAmount > 0n ? `${formatEther(auction.buyoutBidAmount)} tPLS` : "None"}</p>
      <p className="text-sm">Ends: {new Date(Number(auction.endTimeInSeconds) * 1000).toLocaleString()}</p>

      <p className="text-sm">Current Highest Bid: {winningBid && winningBid.bidAmount > 0n ? `${formatEther(winningBid.bidAmount)} tPLS by ${winningBid.bidder}` : "No bids yet"}</p>
      <p className="text-sm">Minimum Required Bid: {formatEther(minRequiredBid)} tPLS</p>

      <div className="space-y-2">
        <input
          className="w-full border p-2 rounded"
          type="number"
          placeholder="Your bid in tPLS"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
        />
        <button
          onClick={placeBid}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Placing Bid..." : "Place Bid"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}

export default function AuctionsPage() {
  const account = useActiveAccount();

  // Fetch all valid auctions (pagination: start at 0, fetch up to 100)
  const { data: auctions, isLoading: loadingAuctions, error: fetchError, refetch: refetchAuctions } = useReadContract(
    getAllValidAuctions,
    {
      contract: marketplaceContract,
      start: 0,
      count: 100, // Adjust based on expected auction count; add pagination UI if >100
      queryOptions: { enabled: !!marketplaceContract },
    }
  );

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <ConnectButton client={client} chain={customChain} />

      {fetchError && <p className="text-red-500">Failed to fetch auctions: {fetchError.message}</p>}

      {loadingAuctions ? (
        <p>Loading auctions...</p>
      ) : auctions && auctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map(auction => (
            <AuctionCard key={auction.id.toString()} auction={auction} refetchAuctions={refetchAuctions} />
          ))}
        </div>
      ) : (
        <p>No active auctions found.</p>
      )}
    </div>
  );
}