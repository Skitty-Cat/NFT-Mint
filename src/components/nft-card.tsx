"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus } from "lucide-react";
import type { ThirdwebContract } from "thirdweb";
import {
  ClaimButton,
  ConnectButton,
  NFTProvider,
  NFTMedia,
  useActiveAccount,
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";

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
  nftInfo: NFTInfo;
  isERC1155: boolean;
};

export function NFTCard({ contract, nftInfo, isERC1155 }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const account = useActiveAccount();

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!Number.isNaN(value)) {
      setQuantity(Math.min(Math.max(1, value)));
    }
  };

  if (nftInfo.pricePerToken === null || nftInfo.pricePerToken === undefined) {
    return null;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="pt-6">
        <div className="aspect-square overflow-hidden rounded-lg mb-4 relative">
          {isERC1155 ? (
            <NFTProvider contract={contract} tokenId={nftInfo.tokenId}>
              <NFTMedia
                loadingComponent={<Skeleton className="w-full h-full object-cover" />}
                className="w-full h-full object-cover"
              />
            </NFTProvider>
          ) : (
            <img
              src={nftInfo.contractImage || "/placeholder.svg?height=400&width=400"}
              alt={nftInfo.displayName}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm font-semibold">
            {nftInfo.pricePerToken} {nftInfo.currencySymbol}/each
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 dark:text-white">
          {nftInfo.displayName}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
          {nftInfo.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="rounded-r-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 text-center rounded-none border-x-0"
              min="1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={increaseQuantity}
              aria-label="Increase quantity"
              className="rounded-l-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm font-semibold dark:text-white">
            Total: {nftInfo.pricePerToken * quantity} {nftInfo.currencySymbol}
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id={`custom-address-${nftInfo.tokenId}`}
            checked={useCustomAddress}
            onCheckedChange={setUseCustomAddress}
          />
          <Label
            htmlFor={`custom-address-${nftInfo.tokenId}`}
            className={`${useCustomAddress ? "" : "text-gray-400"} cursor-pointer text-sm`}
          >
            Mint to custom address
          </Label>
        </div>
        {useCustomAddress && (
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Enter recipient address"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="w-full text-sm"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {account ? (
          <ClaimButton
            theme={"light"}
            contractAddress={contract.address}
            chain={contract.chain}
            client={contract.client}
            claimParams={
              isERC1155
                ? {
                    type: "ERC1155",
                    tokenId: nftInfo.tokenId,
                    quantity: BigInt(quantity),
                    to: customAddress,
                    from: account.address,
                  }
                : {
                    type: "ERC721",
                    quantity: BigInt(quantity),
                    to: customAddress,
                    from: account.address,
                  }
            }
            style={{
              backgroundColor: "black",
              color: "white",
              width: "100%",
            }}
            onTransactionSent={() => toast.info("Minting NFT")}
            onTransactionConfirmed={() =>
              toast.success("Minted successfully")
            }
            onError={(err) => toast.error(err.message)}
          >
            Mint {quantity} NFT{quantity > 1 ? "s" : ""}
          </ClaimButton>
        ) : (
          <ConnectButton
            client={client}
            connectButton={{ style: { width: "100%" } }}
          />
        )}
      </CardFooter>
    </Card>
  );
} 