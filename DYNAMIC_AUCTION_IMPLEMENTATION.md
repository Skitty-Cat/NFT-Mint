# Dynamic Auction Implementation

This document explains the new dynamic auction implementation that pulls all data directly from smart contracts instead of using hardcoded values.

## Overview

The auction system has been completely refactored to be **100% dynamic**, fetching all data from the blockchain in real-time:

- ✅ **Auction Data**: Fetched from marketplace contract
- ✅ **NFT Metadata**: Fetched from NFT contract  
- ✅ **Currency Information**: Dynamic currency symbol detection
- ✅ **Auction IDs**: Automatically discovered from contract
- ✅ **Real-time Updates**: Live countdown timers and status updates

## New Architecture

### 1. Dynamic Hooks

#### `useAuctions()` Hook
```typescript
// Fetches all available auctions dynamically
const { auctionIds, totalAuctions, loading, error } = useAuctions();
```

**What it does:**
- Calls `totalAuctions()` to get total number of auctions
- Calls `getAllValidAuctions()` to get active auctions
- Automatically limits results based on configuration
- Handles errors and loading states

#### `useAuctionData(auctionId)` Hook
```typescript
// Fetches specific auction data
const { auctionData, winningBidData, isExpired, loading, error } = useAuctionData(auctionId);
```

**What it does:**
- Calls `getAuction(auctionId)` for auction details
- Calls `getWinningBid(auctionId)` for current bid
- Calls `isAuctionExpired(auctionId)` for expiration status
- Returns structured data with proper typing

#### `useNFTMetadata(assetContract, tokenId)` Hook
```typescript
// Fetches NFT metadata dynamically
const { metadata, loading, error } = useNFTMetadata(assetContract, tokenId);
```

**What it does:**
- Calls `tokenURI(tokenId)` or `uri(tokenId)` on NFT contract
- Fetches metadata from IPFS or HTTP URLs
- Handles IPFS gateway conversion
- Provides fallback metadata if fetch fails

### 2. Updated Components

#### `NFTCard` Component
**Before (Hardcoded):**
```typescript
<NFTCard
  contract={contract}
  nftInfo={{
    tokenId: BigInt(0),
    displayName: "Auction NFT #0", // Hardcoded
    description: "Exclusive NFT available for auction", // Hardcoded
  }}
  collectionAddress="0x0000..." // Hardcoded
  auctionId={BigInt(0)} // Hardcoded
/>
```

**After (Dynamic):**
```typescript
<NFTCard auctionId={auctionId} />
```

**What changed:**
- Removed all hardcoded props
- Fetches auction data using `useAuctionData()`
- Fetches NFT metadata using `useNFTMetadata()`
- Creates NFT contract dynamically from auction data
- All data comes from blockchain

#### `LandingPage` Component
**Before (Hardcoded):**
```typescript
// Used hardcoded auction IDs
{AUCTION_CONFIG.sampleAuctionIds.map((auctionId, index) => {
  const auctionData = getSampleAuctionData(index); // Hardcoded data
  return <NFTCard ... />;
})}
```

**After (Dynamic):**
```typescript
// Uses dynamic auction fetching
const { auctionIds, loading, error } = useAuctions();

{auctionIds.map((auctionId) => (
  <NFTCard key={auctionId.toString()} auctionId={auctionId} />
))}
```

### 3. Configuration Updates

#### `auction-config.ts`
**Before:**
```typescript
export const AUCTION_CONFIG = {
  sampleAuctionIds: [BigInt(0)], // Hardcoded
  sampleTokenIds: [BigInt(0)], // Hardcoded
  sampleNftNames: ["Auction NFT #0"], // Hardcoded
  sampleNftDescriptions: ["Exclusive NFT available for auction"], // Hardcoded
};
```

**After:**
```typescript
export const AUCTION_CONFIG = {
  maxAuctionsToDisplay: 12, // Configuration only
  updateInterval: 60000, // Configuration only
  defaultCurrency: { // Currency configuration
    symbol: "PLS",
    decimals: 18,
    address: "0x0000000000000000000000000000000000000000"
  }
};
```

## Data Flow

### 1. Landing Page Load
```
1. useAuctions() hook called
2. totalAuctions() contract call
3. getAllValidAuctions() contract call
4. Extract auction IDs from response
5. Render NFTCard components
```

### 2. Auction Card Load
```
1. useAuctionData(auctionId) hook called
2. getAuction(auctionId) contract call
3. getWinningBid(auctionId) contract call
4. isAuctionExpired(auctionId) contract call
5. useNFTMetadata(assetContract, tokenId) hook called
6. tokenURI(tokenId) contract call
7. Fetch metadata from URI
8. Render auction card with real data
```

### 3. Real-time Updates
```
1. useEffect with interval timer
2. Update countdown every minute/second
3. Check auction expiration status
4. Update UI accordingly
```

## Contract Functions Used

### Marketplace Contract
- `totalAuctions()` - Get total number of auctions
- `getAllValidAuctions(startId, endId)` - Get active auctions
- `getAuction(auctionId)` - Get specific auction details
- `getWinningBid(auctionId)` - Get current winning bid
- `isAuctionExpired(auctionId)` - Check if auction expired

### NFT Contract
- `tokenURI(tokenId)` - Get metadata URI (ERC721)
- `uri(tokenId)` - Get metadata URI (ERC1155)

## Error Handling

### Graceful Fallbacks
1. **Auction not found**: Shows "Auction not found" message
2. **Metadata fetch fails**: Uses fallback name/description
3. **Contract errors**: Displays error messages
4. **Network issues**: Shows loading states

### Loading States
1. **Skeleton loaders**: While fetching data
2. **Progressive loading**: Auction data → NFT metadata
3. **Error boundaries**: Catch and display errors

## Performance Optimizations

### 1. Efficient Data Fetching
- Batch auction ID discovery
- Parallel metadata fetching
- Cached contract instances

### 2. Real-time Updates
- Optimized intervals (1 minute for cards, 1 second for detail page)
- Manual cleanup of intervals
- Conditional updates based on auction status

### 3. Memory Management
- Proper cleanup of useEffect hooks
- Limited auction display count
- Efficient re-renders

## Benefits of Dynamic Implementation

### 1. **Real-time Data**
- All auction information is live from blockchain
- No stale or outdated data
- Automatic updates when auctions change

### 2. **Scalability**
- No need to update code for new auctions
- Automatically discovers all available auctions
- Handles any number of auctions

### 3. **Maintainability**
- No hardcoded values to maintain
- Single source of truth (blockchain)
- Easy to add new features

### 4. **User Experience**
- Live countdown timers
- Real-time bid updates
- Accurate auction status

## Testing

### Test Scenarios
1. **No auctions**: Shows empty state
2. **Single auction**: Displays correctly
3. **Multiple auctions**: Grid layout works
4. **Expired auctions**: Status updates correctly
5. **Network errors**: Error handling works
6. **Metadata errors**: Fallbacks work

### Test Data
- Use real marketplace contract addresses
- Create test auctions on testnet
- Test with different NFT contracts
- Verify all contract functions work

## Future Enhancements

### 1. **Bid Submission**
- Implement `bidInAuction()` function
- Add transaction handling
- Real-time bid updates

### 2. **Auction Creation**
- Implement `createAuction()` function
- Add auction creation UI
- Form validation

### 3. **Advanced Features**
- Auction filtering and search
- Bid history display
- Auction analytics
- Notifications

## Migration Guide

### From Hardcoded to Dynamic

1. **Update imports:**
```typescript
// Remove old imports
import { AUCTION_CONFIG, getSampleAuctionData } from "@/lib/auction-config";

// Add new imports
import { useAuctions } from "@/hooks/use-auctions";
import { useAuctionData } from "@/hooks/use-auctions";
import { useNFTMetadata } from "@/hooks/use-nft-metadata";
```

2. **Update component props:**
```typescript
// Before
<NFTCard contract={contract} nftInfo={nftInfo} collectionAddress={address} auctionId={id} />

// After
<NFTCard auctionId={id} />
```

3. **Update data fetching:**
```typescript
// Before
const auctionIds = AUCTION_CONFIG.sampleAuctionIds;

// After
const { auctionIds, loading, error } = useAuctions();
```

4. **Update configuration:**
```typescript
// Remove hardcoded data from auction-config.ts
// Keep only configuration values
```

## Troubleshooting

### Common Issues

1. **"No auctions found"**
   - Check marketplace contract address
   - Verify contract has auctions
   - Check network connection

2. **"Auction not found"**
   - Verify auction ID exists
   - Check auction status
   - Ensure contract is accessible

3. **"Metadata loading failed"**
   - Check NFT contract address
   - Verify token URI is accessible
   - Check IPFS gateway

4. **"Contract error"**
   - Verify contract addresses
   - Check network configuration
   - Ensure contracts are deployed

### Debug Tips

1. **Enable console logging:**
```typescript
console.log('Auction data:', auctionData);
console.log('NFT metadata:', nftMetadata);
console.log('Loading state:', loading);
```

2. **Check network tab:**
- Monitor contract calls
- Verify response data
- Check for errors

3. **Use browser dev tools:**
- React DevTools for component state
- Network tab for contract calls
- Console for errors

## Conclusion

The new dynamic implementation provides a robust, scalable, and maintainable auction system that pulls all data directly from the blockchain. This eliminates the need for hardcoded values and ensures users always see the most up-to-date information.

The system is now ready for production use and can handle any number of auctions without code changes. 