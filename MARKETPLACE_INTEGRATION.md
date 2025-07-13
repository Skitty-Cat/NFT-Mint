# Marketplace Integration Guide

This document explains how to integrate the auction functionality with your actual Thirdweb MarketplaceV3 contract using thirdweb v5 SDK.

## Current Implementation

The current implementation uses real contract calls for reading auction data but has a placeholder for bid submission. The auction page (`src/app/auction/[listingId]/page.tsx`) is fully functional for displaying auction details.

## Marketplace Contract Address

The marketplace contract is configured in `src/lib/constants.ts`:

```typescript
export const marketplaceContract = getContract({
  address: "0xe777b9B27a9a2774A3FA96F8bEcf61E62ce0Ac3F",
  chain: defineChain(943), // PulseChain Testnet
  client,
});
```

## Thirdweb v5 Implementation Approach

### 1. Reading Auction Data (✅ Implemented)

The auction page already uses `useReadContract` hook to fetch auction data:

```typescript
const { data: auctionData, isLoading, error } = useReadContract({
  contract: marketplaceContract,
  method: "function getEnglishAuction(uint256) view returns ((uint256 id, address seller, address assetContract, uint256 tokenId, uint256 quantity, uint256 startTimestamp, uint256 endTimestamp, uint256 startBidAmount, address currency, uint8 status))",
  params: [listingId],
});
```

### 2. Submitting Bids (🔄 Needs Implementation)

For bid submission in thirdweb v5, you have several options:

#### Option A: Create a Custom Transaction Component

Create a `BidButton` component similar to `ClaimButton`:

```typescript
// components/bid-button.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import { marketplaceContract } from "@/lib/constants";
import { toast } from "sonner";

interface BidButtonProps {
  listingId: bigint;
  bidAmount: string;
  disabled?: boolean;
}

export function BidButton({ listingId, bidAmount, disabled }: BidButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = useActiveAccount();

  const handleBid = async () => {
    if (!account) return;
    
    setIsSubmitting(true);
    try {
      // Use thirdweb v5 transaction method here
      // This would involve using the appropriate transaction API
      toast.success("Bid submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button 
      onClick={handleBid}
      disabled={disabled || isSubmitting}
      className="w-full"
    >
      {isSubmitting ? "Submitting Bid..." : "Place Bid"}
    </Button>
  );
}
```

#### Option B: Use Thirdweb's Transaction API

Update the `handleBid` function in the auction page:

```typescript
const handleBid = async () => {
  if (!bidAmount || !auctionData || !account) return;
  
  const bidAmountWei = parseEther(bidAmount);
  const currentBid = auctionData.startBidAmount;
  
  if (bidAmountWei <= currentBid) {
    toast.error("Bid must be higher than current bid");
    return;
  }

  setSubmittingBid(true);
  
  try {
    // Use thirdweb v5 transaction method
    // Example (check thirdweb v5 docs for exact API):
    // const result = await sendTransaction({
    //   contract: marketplaceContract,
    //   method: "bidInEnglishAuction",
    //   params: [listingId],
    //   value: bidAmountWei,
    // });
    
    toast.success("Bid submitted successfully!");
    setBidAmount("");
  } catch (error) {
    console.error("Error submitting bid:", error);
    toast.error("Failed to submit bid. Please try again.");
  } finally {
    setSubmittingBid(false);
  }
};
```

### 3. Available Thirdweb v5 Hooks and Components

Based on your codebase, these are the available thirdweb v5 React components:

- `ConnectButton` - Wallet connection
- `MediaRenderer` - NFT media display
- `useActiveAccount` - Get connected account
- `useReadContract` - Read contract data
- `ClaimButton` - Pre-built claim component
- `NFTProvider` - NFT context provider
- `NFTMedia` - NFT media component

### 4. Transaction Methods in Thirdweb v5

For writing to contracts in thirdweb v5, you'll need to:

1. **Check the official thirdweb v5 documentation** for the correct transaction API
2. **Use the appropriate transaction method** (similar to how `ClaimButton` works)
3. **Handle transaction states** (pending, success, error)

## Implementation Steps

### Step 1: Update Auction Data Fetching (✅ Done)

The auction data fetching is already implemented and working.

### Step 2: Implement Bid Submission

1. Choose one of the implementation options above
2. Update the `handleBid` function in `src/app/auction/[listingId]/page.tsx`
3. Test with small amounts on testnet

### Step 3: Add Transaction Tracking

```typescript
// Add transaction hash tracking
const [transactionHash, setTransactionHash] = useState<string | null>(null);

// In handleBid function:
const result = await sendTransaction({...});
setTransactionHash(result.hash);

// Add transaction status monitoring
useEffect(() => {
  if (transactionHash) {
    // Monitor transaction status
    // Update UI based on confirmation
  }
}, [transactionHash]);
```

### Step 4: Error Handling

```typescript
// Add comprehensive error handling
try {
  // Transaction logic
} catch (error) {
  if (error.message.includes("insufficient funds")) {
    toast.error("Insufficient balance for bid");
  } else if (error.message.includes("auction ended")) {
    toast.error("Auction has already ended");
  } else {
    toast.error("Failed to submit bid. Please try again.");
  }
}
```

## MarketplaceV3 Contract Methods

The MarketplaceV3 contract typically includes these methods for English auctions:

- `getEnglishAuction(uint256 listingId)` - Get auction details ✅
- `bidInEnglishAuction(uint256 _auctionId) payable` - Place a bid 🔄
- `getWinningBid(uint256 listingId)` - Get current winning bid
- `getAuctionStatus(uint256 listingId)` - Get auction status

## Testing

1. Deploy your marketplace contract to PulseChain Testnet
2. Create test auctions
3. Test the integration with small amounts
4. Verify all functionality works as expected

## Security Considerations

- Always validate bid amounts on the frontend and backend
- Check auction status before allowing bids
- Handle transaction failures gracefully
- Implement proper error messages for users
- Validate user balance before allowing bids

## Next Steps

1. **Check thirdweb v5 documentation** for the correct transaction API
2. **Implement the bid submission** using the appropriate method
3. **Add transaction tracking** and status updates
4. **Test thoroughly** on testnet before mainnet deployment
5. **Add additional features** like bid history, auction events, etc.

## Resources

- [Thirdweb v5 Documentation](https://portal.thirdweb.com/)
- [Thirdweb React SDK](https://portal.thirdweb.com/react)
- [MarketplaceV3 Contract Reference](https://portal.thirdweb.com/contracts/build/extensions/general/marketplacev3) 