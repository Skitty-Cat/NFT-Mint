import { ThirdwebContract, toTokens } from "thirdweb";
import { getActiveClaimCondition } from "thirdweb/extensions/erc20";
import { getContractMetadata } from "thirdweb/extensions/common";
import { defaultChain, defaultChainId } from "@/lib/constants";
import { getContract } from "thirdweb";
import { client } from "@/lib/thirdwebClient";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";
import { overrideCurrencySymbol } from "@/lib/utils";

export async function getERC20Info(contract: ThirdwebContract) {
  const [claimCondition, contractMetadata] = await Promise.all([
    getActiveClaimCondition({ contract }),
    getContractMetadata({ contract }),
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
    displayName: contractMetadata?.name || "",
    description: contractMetadata?.description || "",
    pricePerToken:
      currencyMetadata && priceInWei
        ? Number(toTokens(priceInWei, currencyMetadata.decimals))
        : null,
    contractImage: contractMetadata?.image || "",
    currencySymbol: overriddenCurrencySymbol,
  };
}
