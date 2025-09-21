"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet } from "lucide-react";
import { client } from "@/lib/thirdwebClient";
import { getContract, defineChain } from "thirdweb";
import { isERC721 } from "thirdweb/extensions/erc721";
import { isERC1155 } from "thirdweb/extensions/erc1155";
import { getNFT } from "thirdweb/extensions/erc1155";
import { getContractMetadata } from "thirdweb/extensions/common";
import { getActiveClaimCondition } from "thirdweb/extensions/erc1155";
import { getActiveClaimCondition as getActiveClaimCondition721 } from "thirdweb/extensions/erc721";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import { toTokens } from "thirdweb";
import { overrideCurrencySymbol } from "@/lib/utils";
import { getNFT as getNFT721 } from "thirdweb/extensions/erc721";
import {
  ConnectButton,
  ClaimButton,
  useActiveAccount,
} from "thirdweb/react";

const CONTRACT_ADDRESS = "0xE6f3A32c7d621Ffd4CA0bA558B3D220e4CaF41AE";
const CHAIN_ID = 369; // PulseChain
const MARKETPLACE_URL = "https://thirdweb.com/pulsechain/0xE6f3A32c7d621Ffd4CA0bA558B3D220e4CaF41AE";

// Convert IPFS URLs to gateway URLs
const convertIPFSUrl = (url: string): string => {
  if (url.startsWith('ipfs://')) {
    // Use multiple IPFS gateways for redundancy
    const ipfsHash = url.replace('ipfs://', '');
    // Try multiple gateways - ipfs.io is most reliable
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }
  return url;
};

export const SkittyCatCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [contractReady, setContractReady] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const account = useActiveAccount();
  
  // Create contract with proper error handling
  let contract;
  try {
    contract = getContract({
      address: CONTRACT_ADDRESS,
      chain: defineChain(CHAIN_ID),
      client,
    });
  } catch (error) {
    console.error("Failed to create contract:", error);
    contract = null;
  }
  const [nftData, setNftData] = useState<{
    name: string;
    description: string;
    image: string;
    price: number | null;
    currencySymbol: string;
    ercType: "ERC721" | "ERC1155" | null;
    tokenId: string | null;
    traits: Array<{trait_type: string; value: string}> | null;
    collectionName: string;
    creator: string;
    supply: number | null;
  }>({
    name: "SkittyCat",
    description: "",
    image: "",
    price: null,
    currencySymbol: "",
    ercType: null,
    tokenId: null,
    traits: null,
    collectionName: "",
    creator: "",
    supply: null,
  });

  useEffect(() => {
    async function fetchNftData() {
      setLoading(true);
      try {
        const contract = getContract({
          address: CONTRACT_ADDRESS,
          chain: defineChain(CHAIN_ID),
          client,
        });

        // Detect token type
        const [erc721, erc1155] = await Promise.all([
          isERC721({ contract }).catch(() => false),
          isERC1155({ contract }).catch(() => false),
        ]);

        let ercType: "ERC721" | "ERC1155" | null = null;
        if (erc1155) ercType = "ERC1155";
        else if (erc721) ercType = "ERC721";

        let metadata: any = {};
        let price: number | null = null;
        let currencySymbol = "";
        let tokenId: string | null = null;
        let traits: Array<{trait_type: string; value: string}> | null = null;
        let collectionName = "";
        let creator = "";
        let supply: number | null = null;

        if (ercType === "ERC1155") {
          const tokenIdBigInt = BigInt(0);
          const [nft, claimCondition] = await Promise.all([
            getNFT({ contract, tokenId: tokenIdBigInt }),
            getActiveClaimCondition({ contract, tokenId: tokenIdBigInt }),
          ]);
          
          metadata = nft?.metadata || {};
          tokenId = tokenIdBigInt.toString();
          
          // Extract traits from metadata
          if (metadata.attributes) {
            traits = metadata.attributes.map((attr: any) => ({
              trait_type: attr.trait_type || attr.traitType || "Unknown",
              value: attr.value || "Unknown"
            }));
          }
          
          // Get supply information
          if (nft && "supply" in nft && typeof nft.supply === "bigint") {
            supply = Number(nft.supply);
          }
          
          if (claimCondition?.currency) {
            const currencyMeta = await getCurrencyMetadata({
              contract: getContract({
                address: claimCondition.currency,
                chain: defineChain(CHAIN_ID),
                client,
              }),
            });
            currencySymbol = "PLS"; // Always show PLS for PulseChain
            price = claimCondition.pricePerToken && currencyMeta.decimals
              ? Number(toTokens(claimCondition.pricePerToken, currencyMeta.decimals))
              : null;
          }
        } else if (ercType === "ERC721") {
          const tokenIdBigInt = BigInt(0);
          const [contractMeta, claimCondition, nft] = await Promise.all([
            getContractMetadata({ contract }),
            getActiveClaimCondition721({ contract }),
            getNFT721({ contract, tokenId: tokenIdBigInt }).catch(() => null),
          ]);
          
          metadata = nft?.metadata || contractMeta || {};
          tokenId = tokenIdBigInt.toString();
          collectionName = contractMeta?.name || "Unknown Collection";
          
          // Extract traits from metadata
          if (metadata.attributes) {
            traits = metadata.attributes.map((attr: any) => ({
              trait_type: attr.trait_type || attr.traitType || "Unknown",
              value: attr.value || "Unknown"
            }));
          }
          
          // Get supply information
          if (contractMeta?.totalSupply) {
            supply = Number(contractMeta.totalSupply);
          }
          
          if (claimCondition?.currency) {
            const currencyMeta = await getCurrencyMetadata({
              contract: getContract({
                address: claimCondition.currency,
                chain: defineChain(CHAIN_ID),
                client,
              }),
            });
            currencySymbol = "PLS"; // Always show PLS for PulseChain
            price = claimCondition.pricePerToken && currencyMeta.decimals
              ? Number(toTokens(claimCondition.pricePerToken, currencyMeta.decimals))
              : null;
          }
        }

        setNftData({
          name: metadata.name || "SkittyCat",
          description: metadata.description || "",
          image: convertIPFSUrl(metadata.image || "/placeholder.svg"),
          price,
          currencySymbol,
          ercType,
          tokenId,
          traits,
          collectionName: collectionName || metadata.name || "SkittyCat Collection",
          creator: "SkittyCat",
          supply,
        });
        setContractReady(true);
      } catch (error) {
        console.error("Failed to fetch NFT data:", error);
        // Set fallback data
        setNftData(prev => ({
          ...prev,
          description: "",
          image: "/placeholder.svg",
        }));
      } finally {
        setLoading(false);
      }
    }

    fetchNftData();
  }, []);

  const handlePurchaseClick = () => {
    window.open(MARKETPLACE_URL, "_blank", "noopener,noreferrer");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="p-0">
          <Skeleton className="w-full h-64 rounded-t-lg" />
        </CardContent>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-[#17130b] border border-[#bd9740]/20 hover:shadow-2xl hover:shadow-[#bd9740]/20 transition-all duration-300 transform hover:scale-105">
      <CardContent className="p-0">
        <div 
          className="relative aspect-square overflow-hidden rounded-t-lg cursor-pointer perspective-1000"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: isHovering 
              ? `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale3d(1.05, 1.05, 1.05) translateZ(20px)`
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)',
            transformStyle: 'preserve-3d',
            boxShadow: isHovering 
              ? '0 20px 40px rgba(189, 151, 64, 0.3), 0 0 60px rgba(189, 151, 64, 0.2)'
              : '0 8px 16px rgba(189, 151, 64, 0.1), 0 0 30px rgba(189, 151, 64, 0.05)'
          }}
        >
          <img
            src={nftData.image}
            alt={nftData.name}
            className="w-full h-full object-contain transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const currentSrc = target.src;
              
              // If it's an IPFS URL that failed, try alternative gateways
              if (currentSrc.includes('ipfs.io/ipfs/')) {
                const ipfsHash = currentSrc.split('ipfs.io/ipfs/')[1];
                // Try alternative gateways
                const alternatives = [
                  `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
                  `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
                  `https://dweb.link/ipfs/${ipfsHash}`,
                ];
                
                let currentIndex = 0;
                const tryNextGateway = () => {
                  if (currentIndex < alternatives.length) {
                    target.src = alternatives[currentIndex];
                    currentIndex++;
                  } else {
                    // All gateways failed, use placeholder
                    target.src = "/placeholder.svg";
                  }
                };
                
                target.onerror = tryNextGateway;
                tryNextGateway();
              } else {
                // Not an IPFS URL, use placeholder
                target.src = "/placeholder.svg";
              }
            }}
          />
          {nftData.price && (
            <div 
              className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold text-black backdrop-blur-sm"
              style={{ 
                backgroundColor: '#bd9740',
                boxShadow: '0 0 16px 4px #bd9740, 0 0 32px 4px #bd9740'
              }}
            >
              {nftData.price} {nftData.currencySymbol}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold font-serif" style={{ color: '#bd9740' }}>
            {nftData.name}
          </h3>
          {nftData.tokenId && (
            <span className="text-xs text-gold-200 bg-gold-100/10 px-2 py-1 rounded">
              #{nftData.tokenId}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gold-200">by</span>
          <span className="text-sm font-medium text-gold-100">{nftData.creator}</span>
        </div>
        
        {nftData.description && (
          <p className="text-gold-100 text-sm mb-4 line-clamp-2">
            {nftData.description}
          </p>
        )}
        
        {/* Traits Section */}
        {nftData.traits && nftData.traits.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gold-200 mb-2">Traits ({nftData.traits.length})</div>
            <div className="grid grid-cols-2 gap-2">
              {nftData.traits.slice(0, 4).map((trait, index) => (
                <div key={index} className="bg-gold-100/10 rounded px-2 py-1">
                  <div className="text-xs text-gold-200">{trait.trait_type}</div>
                  <div className="text-xs text-gold-100 font-medium">{trait.value}</div>
                </div>
              ))}
              {nftData.traits.length > 4 && (
                <div className="bg-gold-100/10 rounded px-2 py-1 flex items-center justify-center">
                  <span className="text-xs text-gold-200">+{nftData.traits.length - 4} more</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {nftData.supply && (
          <div className="text-sm text-gold-200">
            <span className="text-xs">Supply: {nftData.supply}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        {account && contract && contractReady ? (
          <ClaimButton
            contractAddress={CONTRACT_ADDRESS}
            chain={defineChain(CHAIN_ID)}
            client={client}
            claimParams={
              nftData.ercType === "ERC1155"
                ? {
                    type: "ERC1155",
                    tokenId: BigInt(0),
                    quantity: BigInt(1),
                  }
                : {
                    type: "ERC721",
                    quantity: BigInt(1),
                  }
            }
            className="w-full bg-transparent border border-[#bd9740] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-[#bd9740]/20 flex items-center justify-center gap-2"
            disabled={isMinting}
            onTransactionSent={() => {
              setIsMinting(true);
              console.log("Minting transaction sent");
            }}
            onTransactionConfirmed={() => {
              setIsMinting(false);
              console.log("Minting successful!");
            }}
            onError={(error) => {
              setIsMinting(false);
              console.error("Minting failed:", error);
            }}
          >
            <Wallet className="h-4 w-4" />
            {isMinting ? "Minting..." : `Mint ${nftData.price} ${nftData.currencySymbol}`}
          </ClaimButton>
        ) : account && (!contract || !contractReady) ? (
          <Button 
            disabled
            className="w-full bg-transparent border border-[#bd9740] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 opacity-50"
          >
            <Wallet className="h-4 w-4" />
            Loading Contract...
          </Button>
        ) : (
          <ConnectButton 
            client={client}
            connectButton={{
              className: "w-full bg-transparent border border-[#bd9740] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-[#bd9740]/20 flex items-center justify-center gap-2"
            }}
          />
        )}
      </CardFooter>
    </Card>
  );
};
