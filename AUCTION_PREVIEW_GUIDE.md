# Auction Preview Cards Guide

This guide explains how to use the auction preview cards in your NFT minting template with thirdweb v5.

## Overview

The auction preview cards provide a polished way to showcase auctions on your landing page, enticing users to learn more or participate. They use thirdweb v5 hooks for real-time data fetching and provide a modern, responsive design.

## Available Components

### 1. Basic AuctionCard

**File**: `src/components/auction-card.tsx`

A simple, clean auction card that displays essential auction information.

```tsx
import { AuctionCard } from "@/components/auction-card";

<AuctionCard listingId="1" />
```

**Features**:
- Real-time auction data fetching using `useReadContract`
- NFT metadata display
- Time remaining countdown
- Responsive design
- Loading states

### 2. Advanced AuctionPreviewCard

**File**: `src/components/auction-preview-card.tsx`

A feature-rich auction card with enhanced styling and additional options.

```tsx
import { AuctionPreviewCard } from "@/components/auction-preview-card";

<AuctionPreviewCard 
  listingId="1"
  showBidHistory={false}
  showSellerInfo={true}
/>
```

**Features**:
- Real-time countdown timer (updates every minute)
- Hover effects and animations
- Status badges (Active, Ended, Cancelled)
- Price badges with icons
- Optional seller information
- Enhanced loading states
- Error handling with custom UI

## Usage Examples

### Basic Implementation

```tsx
// Simple auction card
<AuctionCard listingId="1" />

// With fallback data
<AuctionCard 
  listingId="1" 
  auctionData={someAuctionData} 
/>
```

### Advanced Implementation

```tsx
// Feature-rich auction preview
<AuctionPreviewCard 
  listingId="1"
  showSellerInfo={true}
  showBidHistory={false}
/>

// Multiple auction cards in a grid
const auctionIds = ["1", "2", "3", "4"];

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {auctionIds.map((id) => (
    <AuctionPreviewCard 
      key={id} 
      listingId={id}
      showSellerInfo={true}
    />
  ))}
</div>
```

### Landing Page Integration

The landing page (`src/components/landing-page.tsx`) demonstrates how to integrate auction cards:

```tsx
// Example auction IDs to display
const exampleAuctionIds = ["1", "2", "3"];

// Render auction cards
{exampleAuctionIds.map((auctionId) => (
  <AuctionPreviewCard 
    key={auctionId} 
    listingId={auctionId}
    showSellerInfo={true}
  />
))}
```

## Thirdweb v5 Integration

### Data Fetching

Both components use `useReadContract` to fetch auction data:

```tsx
const { data: auction, isLoading, error } = useReadContract({
  contract: marketplaceContract,
  method: "function getEnglishAuction(uint256) view returns ((uint256 id, address seller, address assetContract, uint256 tokenId, uint256 quantity, uint256 startTimestamp, uint256 endTimestamp, uint256 startBidAmount, address currency, uint8 status))",
  params: [BigInt(listingId)],
});
```

### NFT Metadata

NFT metadata is fetched using `readContract`:

```tsx
const tokenUri = await readContract({
  contract: nftContract,
  method: "function tokenURI(uint256 tokenId) view returns (string)",
  params: [auction.tokenId],
});
```

### Real-time Updates

The advanced component includes real-time countdown updates:

```tsx
useEffect(() => {
  const updateTimeLeft = () => {
    // Update countdown logic
  };

  updateTimeLeft();
  const interval = setInterval(updateTimeLeft, 60000); // Every minute

  return () => clearInterval(interval);
}, [auction]);
```

## Styling and Customization

### CSS Classes

Both components use Tailwind CSS classes and support:
- Dark mode (`dark:` prefix)
- Hover effects (`hover:` prefix)
- Responsive design (`md:`, `lg:` prefixes)
- Transitions and animations

### Customization Options

#### AuctionPreviewCard Props

```tsx
interface AuctionPreviewCardProps {
  listingId: string;           // Required: Auction ID
  showBidHistory?: boolean;    // Optional: Show bid history (future feature)
  showSellerInfo?: boolean;    // Optional: Show seller address
}
```

#### Styling Customization

You can customize the appearance by modifying the component classes:

```tsx
// Example: Custom card styling
<AuctionPreviewCard 
  listingId="1"
  className="custom-card-class"
/>
```

## Error Handling

Both components handle various error states:

1. **Loading State**: Shows skeleton loaders
2. **Error State**: Shows "Auction not found" message
3. **No Data State**: Graceful fallbacks for missing metadata

## Performance Considerations

### Optimization Tips

1. **Batch Loading**: Load multiple auctions efficiently
2. **Caching**: Consider implementing data caching
3. **Lazy Loading**: Load auction cards as they come into view
4. **Debouncing**: Debounce real-time updates for better performance

### Example: Lazy Loading Implementation

```tsx
import { useInView } from 'react-intersection-observer';

function LazyAuctionCard({ listingId }: { listingId: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {inView && <AuctionPreviewCard listingId={listingId} />}
    </div>
  );
}
```

## Contract Integration

### Marketplace Contract

The components are configured to work with your marketplace contract:

```tsx
// src/lib/constants.ts
export const marketplaceContract = getContract({
  address: "0xe777b9B27a9a2774A3FA96F8bEcf61E62ce0Ac3F",
  chain: defineChain(943), // PulseChain Testnet
  client,
});
```

### NFT Contract

NFT metadata is fetched from the asset contract:

```tsx
export const nftContract = getContract({
  address: "0x2F34A57eb8c577B2e0e12cfcfe48FDeB600ea4C9",
  chain: defineChain(943), // PulseChain Testnet
  client,
});
```

## Testing

### Test Auction IDs

Use these test auction IDs for development:

```tsx
const testAuctionIds = ["1", "2", "3", "4", "5"];
```

### Testing Different States

1. **Active Auctions**: Use auction IDs that are currently active
2. **Ended Auctions**: Use auction IDs that have ended
3. **Invalid Auctions**: Use non-existent auction IDs to test error states

## Future Enhancements

### Planned Features

1. **Bid History**: Display recent bids on the card
2. **Real-time Bidding**: Live bid updates
3. **Auction Categories**: Filter auctions by category
4. **Search and Filter**: Advanced search functionality
5. **Notifications**: Bid alerts and auction updates

### Implementation Ideas

```tsx
// Future: Bid history component
<AuctionPreviewCard 
  listingId="1"
  showBidHistory={true}
  maxBidsToShow={3}
/>

// Future: Real-time updates
<AuctionPreviewCard 
  listingId="1"
  enableRealTimeUpdates={true}
  updateInterval={30000} // 30 seconds
/>
```

## Troubleshooting

### Common Issues

1. **Auction Not Found**: Check if the auction ID exists
2. **Metadata Loading**: Verify NFT contract and token URI
3. **Network Issues**: Ensure proper network connection
4. **Contract Errors**: Verify contract addresses and methods

### Debug Tips

```tsx
// Enable debug logging
console.log('Auction data:', auction);
console.log('NFT metadata:', nftMetadata);
console.log('Loading state:', isLoading);
console.log('Error state:', error);
```

## Resources

- [Thirdweb v5 Documentation](https://portal.thirdweb.com/)
- [Thirdweb React SDK](https://portal.thirdweb.com/react)
- [MarketplaceV3 Contract Reference](https://portal.thirdweb.com/contracts/build/extensions/general/marketplacev3)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the thirdweb v5 documentation
3. Check the contract integration guide
4. Verify your network and contract configuration 