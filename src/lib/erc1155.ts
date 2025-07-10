import { ThirdwebContract, toTokens } from "thirdweb";
import { getActiveClaimCondition, getNFT } from "thirdweb/extensions/erc1155";
import { defaultTokenId, defaultChain, defaultChainId } from "@/lib/constants";
import { getContract } from "thirdweb";
import { client } from "@/lib/thirdwebClient";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import { overrideCurrencySymbol } from "@/lib/utils";

export async function getERC1155Info(contract: ThirdwebContract) {
  const [claimCondition, nft] = await Promise.all([
    await getActiveClaimCondition({
      contract,
      tokenId: defaultTokenId,
    }),
    await getNFT({ contract, tokenId: defaultTokenId }),
  ]);
  const priceInWei = claimCondition?.pricePerToken;
  const currencyMetadata = claimCondition?.currency
    ? await getCurrencyMetadata({
        contract: getContract({
          address: claimCondition?.currency,
          chain: defaultChain,
          client,
        }),
      })
    : null;

  const originalCurrencySymbol = currencyMetadata?.symbol || "";
  const overriddenCurrencySymbol = overrideCurrencySymbol(originalCurrencySymbol, defaultChainId);

  return {
    displayName: nft?.metadata?.name || "",
    description: nft?.metadata?.description || "",
    pricePerToken:
      currencyMetadata && priceInWei
        ? Number(toTokens(priceInWei, currencyMetadata.decimals))
        : null,
    contractImage: nft?.metadata?.image || "",
    currencySymbol: overriddenCurrencySymbol,
  };
}

export async function getAllERC1155NFTs(contract: ThirdwebContract) {
  try {
    // For ERC1155, we'll try to get a range of token IDs
    // This is a simplified approach - you might need to adjust based on your collection
    const maxTokenId = 100; // Adjust this based on your collection size
    const nftInfos = [];

    for (let i = 0; i < maxTokenId; i++) {
      try {
        const tokenId = BigInt(i);
        const [claimCondition, nft] = await Promise.all([
          getActiveClaimCondition({
            contract,
            tokenId,
          }).catch(() => null),
          getNFT({ contract, tokenId }).catch(() => null),
        ]);

        if (nft && nft.metadata) {
          const priceInWei = claimCondition?.pricePerToken;
          
          // Get currency metadata for pricing
          const currencyMetadata = claimCondition?.currency
            ? await getCurrencyMetadata({
                contract: getContract({
                  address: claimCondition.currency,
                  chain: defaultChain,
                  client,
                }),
              }).catch(() => null)
            : null;

          nftInfos.push({
            tokenId,
            displayName: nft.metadata.name || `NFT #${tokenId}`,
            description: nft.metadata.description || "",
            pricePerToken:
              currencyMetadata && priceInWei
                ? Number(toTokens(priceInWei, currencyMetadata.decimals))
                : 0,
            contractImage: nft.metadata.image || "",
            currencySymbol: currencyMetadata?.symbol || "ETH",
          });
        }
      } catch (error) {
        // Skip tokens that don't exist or have errors
        continue;
      }
    }

    return nftInfos;
  } catch (error) {
    console.error("Error fetching all ERC1155 NFTs:", error);
    return [];
  }
}
