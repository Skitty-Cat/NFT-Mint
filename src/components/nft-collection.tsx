"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { NFTCard } from "./nft-card";
import type { ThirdwebContract } from "thirdweb";

type NFTInfo = {
  tokenId: bigint;
  displayName: string;
  description: string;
  pricePerToken: number;
  contractImage: string;
  currencySymbol: string;
};

type Props = {
  contract: ThirdwebContract;
  nftInfos: NFTInfo[];
  isERC1155: boolean;
  isERC721: boolean;
};

export function NFTCollection({ contract, nftInfos, isERC1155, isERC721 }: Props) {
  if (nftInfos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <ConnectButton client={client} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">No NFTs Found</h1>
          <p className="text-gray-600 dark:text-gray-300">
            No NFTs were found in this collection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ConnectButton client={client} />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            NFT Collection
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Choose from {nftInfos.length} available NFTs to mint
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nftInfos.map((nftInfo) => (
            <NFTCard
              key={nftInfo.tokenId.toString()}
              contract={contract}
              nftInfo={nftInfo}
              isERC1155={isERC1155}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 