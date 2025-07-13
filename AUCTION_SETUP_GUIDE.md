# Auction Setup Guide

## How to Add Your Auction Contract and NFT IDs

### Step 1: Set Environment Variables

Add these to your `.env.local` file:

```bash
# Your marketplace contract address (where auctions are created)
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xYourMarketplaceContractAddress

# Your NFT contract address (the NFTs being auctioned)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYourNFTContractAddress

# Chain ID where your contracts are deployed
NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID=1
```

### Step 2: Find Your Auction IDs

You can find auction IDs by:

1. **Check your marketplace contract events** - Look for `AuctionCreated` events
2. **Call your marketplace contract** - Use the `getAllAuctions()` method if available
3. **Check your marketplace frontend** - Look at existing auctions
4. **Create test auctions** - Create new auctions and note their IDs

### Step 3: Update the Configuration

Edit `src/lib/auction-config.ts` and replace the sample values:

```typescript
export const AUCTION_CONFIG = {
  // Your marketplace contract address
  marketplaceAddress: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0xYourMarketplaceAddress",
  
  // Your NFT contract address
  nftContractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "0xYourNFTAddress",
  
  // Chain ID
  chainId: Number(process.env.NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID) || 1,
  
  // Replace with your real auction IDs
  sampleAuctionIds: [
    BigInt(123),  // Your real auction ID
    BigInt(124),  // Your real auction ID
    BigInt(125),  // Your real auction ID
    BigInt(126),  // Your real auction ID
  ],
  
  // Replace with your real NFT token IDs
  sampleTokenIds: [
    BigInt(1),    // NFT token ID for auction 123
    BigInt(2),    // NFT token ID for auction 124
    BigInt(3),    // NFT token ID for auction 125
    BigInt(4),    // NFT token ID for auction 126
  ],
  
  // Optional: Custom names for your NFTs
  sampleNftNames: [
    "My Rare NFT #1",
    "Exclusive Artwork #2",
    "Limited Edition #3",
    "Premium Collectible #4",
  ],
  
  // Optional: Custom descriptions
  sampleNftDescriptions: [
    "A rare and exclusive NFT available for auction",
    "Exclusive digital artwork with unique properties",
    "Limited edition collectible with special features",
    "Premium NFT with high rarity and value",
  ],
};
```

### Step 4: Test with Real Data

1. **Start your development server**: `npm run dev`
2. **Visit the landing page**: `http://localhost:3000`
3. **Check the auction section** - You should see your real auction data
4. **Click on auction cards** - They should link to individual token pages

### Step 5: Verify Auction Data

The NFTCard component will display:
- ✅ Auction status (Active, Sold, Cancelled)
- ✅ Minimum bid amount
- ✅ Buyout price
- ✅ Auction end date
- ✅ NFT image and metadata

### Troubleshooting

#### "Cannot read properties of undefined (reading 'id')"
- Check that your `NEXT_PUBLIC_NFT_CONTRACT_CHAIN_ID` is set correctly
- Verify your marketplace contract address is valid

#### "Auction not found" or no data
- Verify your auction IDs exist in your marketplace
- Check that your marketplace contract is deployed on the correct chain
- Ensure your marketplace contract has the `getAuction` method

#### "Contract not found"
- Verify your contract addresses are correct
- Check that contracts are deployed on the specified chain
- Ensure you have the correct chain ID

### Example: Hard-coded Testing

For quick testing, you can hard-code values directly in `auction-config.ts`:

```typescript
export const AUCTION_CONFIG = {
  marketplaceAddress: "0x1234567890123456789012345678901234567890", // Your real address
  nftContractAddress: "0x0987654321098765432109876543210987654321", // Your real address
  chainId: 137, // Polygon mainnet
  sampleAuctionIds: [BigInt(1), BigInt(2), BigInt(3), BigInt(4)],
  sampleTokenIds: [BigInt(1), BigInt(2), BigInt(3), BigInt(4)],
  // ... rest of config
};
```

### Next Steps

Once you have real auction data working:
1. Create an `/auctions` page to show all auctions
2. Add bidding functionality
3. Implement real-time updates
4. Add auction creation features

### Support

If you need help:
1. Check the browser console for errors
2. Verify your contract addresses and chain IDs
3. Test with a single auction first
4. Use the browser's network tab to see contract calls 