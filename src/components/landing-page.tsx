"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectButton, MediaRenderer } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import Link from "next/link";
import { useState, useEffect } from "react";
import { contract } from "@/lib/constants";
import { getERC20Info } from "@/lib/erc20";
import { getERC721Info } from "@/lib/erc721";
import { getERC1155Info } from "@/lib/erc1155";
import { isERC1155 } from "thirdweb/extensions/erc1155";
import { isERC721 } from "thirdweb/extensions/erc721";
import { Skeleton } from "./ui/skeleton";

export function LandingPage() {
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContractInfo() {
      try {
        const [isErc721, isErc1155] = await Promise.all([
          isERC721({ contract }).catch(() => false),
          isERC1155({ contract }).catch(() => false),
        ]);

        const ercType = isErc1155 ? "ERC1155" : isErc721 ? "ERC721" : "ERC20";

        let info;
        switch (ercType) {
          case "ERC20":
            info = await getERC20Info(contract);
            break;
          case "ERC721":
            info = await getERC721Info(contract);
            break;
          case "ERC1155":
            info = await getERC1155Info(contract);
            break;
          default:
            throw new Error("Unknown ERC type.");
        }

        setContractInfo(info);
      } catch (error) {
        console.error("Error fetching contract info:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContractInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="absolute top-4 right-4">
        <ConnectButton client={client} />
      </div>
      
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">
          NFT Minting Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Discover and mint amazing NFT collections
        </p>
      </div>

      {/* NFT Collections Grid */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square overflow-hidden">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <MediaRenderer
                  client={client}
                  className="w-full h-full object-cover"
                  alt={contractInfo?.displayName || "NFT Collection"}
                  src={contractInfo?.contractImage || "/placeholder.svg?height=400&width=400"}
                />
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                {loading ? "Loading..." : contractInfo?.displayName || "NFT Collection"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {loading ? "Loading description..." : contractInfo?.description || "Mint your favorite NFTs from this amazing collection"}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold dark:text-white">
                  {loading ? "..." : `${contractInfo?.pricePerToken || 0} ${contractInfo?.currencySymbol || "ETH"}`}
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Link href="/mint" className="w-full">
                <Button className="w-full" disabled={loading}>
                  Mint NFT
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 