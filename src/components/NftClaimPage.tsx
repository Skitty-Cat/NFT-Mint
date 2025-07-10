"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { client } from "@/lib/thirdwebClient";
import { getContract, defineChain } from "thirdweb";
import { isERC721 } from "thirdweb/extensions/erc721";
import { isERC1155 } from "thirdweb/extensions/erc1155";
import { getActiveClaimCondition, getNFT } from "thirdweb/extensions/erc1155";
import { getActiveClaimCondition as getActiveClaimCondition721 } from "thirdweb/extensions/erc721";
import { getContractMetadata } from "thirdweb/extensions/common";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import { toTokens } from "thirdweb";
import { overrideCurrencySymbol } from "@/lib/utils";
import {
  ClaimButton,
  ConnectButton,
  MediaRenderer,
  NFTProvider,
  NFTMedia,
  useActiveAccount,
} from "thirdweb/react";

type NftClaimPageProps = {
  contractAddress: string;
  chainId: number;
  title?: string;
  description?: string;
  image?: string;
};

export const NftClaimPage: React.FC<NftClaimPageProps> = ({
  contractAddress,
  chainId,
  title,
  description,
  image,
}) => {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<any>(null);
  const [ercType, setErcType] = useState<"ERC721" | "ERC1155" | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [claimCondition, setClaimCondition] = useState<any>(null);
  const [currency, setCurrency] = useState<any>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState<string>("");
  const [supply, setSupply] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const account = useActiveAccount();

  // Fetch contract and info
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const contract = getContract({
          address: contractAddress,
          chain: defineChain(chainId),
          client,
        });
        setContract(contract);
        // Detect type
        const [erc721, erc1155] = await Promise.all([
          isERC721({ contract }).catch(() => false),
          isERC1155({ contract }).catch(() => false),
        ]);
        let type: "ERC721" | "ERC1155" | null = null;
        if (erc1155) type = "ERC1155";
        else if (erc721) type = "ERC721";
        setErcType(type);
        // Fetch metadata and claim condition
        if (type === "ERC1155") {
          const tokenId = BigInt(0); // Default to 0, could be prop
          const [nft, claimCond] = await Promise.all([
            getNFT({ contract, tokenId }),
            getActiveClaimCondition({ contract, tokenId }),
          ]);
          setMeta(nft?.metadata || {});
          setClaimCondition(claimCond);
          // Use supply if available
          let supplyValue: number | null = null;
          if (nft && "supply" in nft && typeof nft.supply === "bigint") {
            supplyValue = Number(nft.supply);
          }
          setSupply(supplyValue);
          if (claimCond?.currency) {
            const currencyMeta = await getCurrencyMetadata({
              contract: getContract({
                address: claimCond.currency,
                chain: defineChain(chainId),
                client,
              }),
            });
            setCurrency(currencyMeta);
            setCurrencySymbol(overrideCurrencySymbol(currencyMeta.symbol, chainId));
            setPrice(
              claimCond.pricePerToken && currencyMeta.decimals
                ? Number(toTokens(claimCond.pricePerToken, currencyMeta.decimals))
                : null
            );
          }
        } else if (type === "ERC721") {
          const [meta, claimCond] = await Promise.all([
            getContractMetadata({ contract }),
            getActiveClaimCondition721({ contract }),
          ]);
          setMeta(meta || {});
          setClaimCondition(claimCond);
          setSupply(meta?.totalSupply ? Number(meta.totalSupply) : null);
          if (claimCond?.currency) {
            const currencyMeta = await getCurrencyMetadata({
              contract: getContract({
                address: claimCond.currency,
                chain: defineChain(chainId),
                client,
              }),
            });
            setCurrency(currencyMeta);
            setCurrencySymbol(overrideCurrencySymbol(currencyMeta.symbol, chainId));
            setPrice(
              claimCond.pricePerToken && currencyMeta.decimals
                ? Number(toTokens(claimCond.pricePerToken, currencyMeta.decimals))
                : null
            );
          }
        }
      } catch (e) {
        toast.error("Failed to load NFT drop info");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [contractAddress, chainId]);

  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!Number.isNaN(value)) setQuantity(Math.max(1, value));
  };

  if (loading) {
    return <Skeleton className="w-full h-96" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="aspect-square overflow-hidden rounded-lg mb-4 relative">
            {ercType === "ERC1155" ? (
              <NFTProvider contract={contract} tokenId={BigInt(0)}>
                <NFTMedia loadingComponent={<Skeleton className="w-full h-full object-cover" />} className="w-full h-full object-cover" />
              </NFTProvider>
            ) : (
              <MediaRenderer
                client={client}
                className="w-full h-full object-cover"
                alt=""
                src={image || meta?.image || "/placeholder.svg?height=400&width=400"}
              />
            )}
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm font-semibold">
              {price} {currencySymbol}/each
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">
            {title || meta?.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {description || meta?.description}
          </p>
          <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            {typeof supply === "number" ? `Supply Remaining: ${supply}` : null}
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={quantity <= 1} aria-label="Decrease quantity" className="rounded-r-none">
                <Minus className="h-4 w-4" />
              </Button>
              <Input type="number" value={quantity} onChange={handleQuantityChange} className="w-28 text-center rounded-none border-x-0 pl-6" min="1" />
              <Button variant="outline" size="icon" onClick={increaseQuantity} aria-label="Increase quantity" className="rounded-l-none">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-base pr-1 font-semibold dark:text-white">
              Total: {price && quantity ? price * quantity : 0} {currencySymbol}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {account ? (
            <ClaimButton
              theme={"light"}
              contractAddress={contractAddress}
              chain={defineChain(chainId)}
              client={client}
              claimParams={
                ercType === "ERC1155"
                  ? {
                      type: "ERC1155",
                      tokenId: BigInt(0),
                      quantity: BigInt(quantity),
                      to: account.address,
                      from: account.address,
                    }
                  : {
                      type: "ERC721",
                      quantity: BigInt(quantity),
                      to: account.address,
                      from: account.address,
                    }
              }
              style={{ backgroundColor: "black", color: "white", width: "100%" }}
              disabled={isMinting}
              onTransactionSent={() => toast.info("Minting NFT")}
              onTransactionConfirmed={() => toast.success("Minted successfully")}
              onError={(err) => toast.error(err.message)}
            >
              Claim {quantity} NFT{quantity > 1 ? "s" : ""}
            </ClaimButton>
          ) : (
            <ConnectButton client={client} connectButton={{ style: { width: "100%" } }} />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}; 