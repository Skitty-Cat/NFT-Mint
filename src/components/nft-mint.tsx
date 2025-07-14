"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import {
	ClaimButton,
	ConnectButton,
	MediaRenderer,
	NFTProvider,
	NFTMedia,
	useActiveAccount,
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import React from "react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { overrideCurrencySymbol } from "@/lib/utils";
import Link from "next/link";
import { Navigation } from "./ui/navigation";

type Props = {
	contract: ThirdwebContract;
	displayName: string;
	description: string;
	contractImage: string;
	pricePerToken: number | null;
	currencySymbol: string | null;
	isERC1155: boolean;
	isERC721: boolean;
	tokenId: bigint;
};

export function NftMint(props: Props) {
	// console.log(props);
	const [isMinting, setIsMinting] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [useCustomAddress, setUseCustomAddress] = useState(false);
	const [customAddress, setCustomAddress] = useState("");
	const { theme, setTheme } = useTheme();
	const account = useActiveAccount();

	// Override currency symbol based on contract chain
	const displayCurrencySymbol = overrideCurrencySymbol(
		props.currencySymbol || "", 
		props.contract.chain.id
	);

	const decreaseQuantity = () => {
		setQuantity((prev) => Math.max(1, prev - 1));
	};

	const increaseQuantity = () => {
		setQuantity((prev) => prev + 1); // Assuming a max of 10 NFTs can be minted at once
	};

	const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(e.target.value);
		if (!Number.isNaN(value)) {
			setQuantity(Math.min(Math.max(1, value)));
		}
	};

	// const toggleTheme = () => {
	// 	setTheme(theme === "dark" ? "light" : "dark");
	// };
	if (props.pricePerToken === null || props.pricePerToken === undefined) {
		console.error("Invalid pricePerToken");
		return null;
	}
	return (
		<div className="min-h-screen bg-[#18181b] font-serif">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
				<div className="absolute top-40 left-40 w-80 h-80 bg-gold-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
			</div>

			{/* Navigation */}
			<Navigation />

			{/* Main Content */}
			<div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-16 font-serif">
				{/* Back button */}
				<div className="absolute top-20 left-4">
					<Link href="/">
						<Button variant="outline" size="sm" className="bg-gold-100/10 backdrop-blur-sm border-gold-200/40 text-gold-200 hover:bg-gold-100/20 font-serif">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Portfolio
						</Button>
					</Link>
				</div>
				
				<Card className="w-full max-w-md bg-gold-100/10 backdrop-blur-sm border border-gold-200/20 font-serif">
					<CardContent className="pt-6">
						<div className="aspect-square overflow-hidden rounded-lg mb-4 relative">
							{props.isERC1155 ? (
								<NFTProvider contract={props.contract} tokenId={props.tokenId}>
									<NFTMedia
										loadingComponent={<Skeleton className="w-full h-full object-cover" />}
										className="w-full h-full object-cover" />
								</NFTProvider>
							) : (
								<MediaRenderer
									client={client}
									className="w-full h-full object-cover"
									alt=""
									src={
										props.contractImage || "/placeholder.svg?height=400&width=400"
									}
								/>
							)}
							<div className="absolute top-2 right-2 bg-[#18181b] bg-opacity-80 text-gold-200 px-2 py-1 rounded-full text-sm font-semibold font-serif">
								{props.pricePerToken} {displayCurrencySymbol}/each
							</div>
						</div>
						<h2 className="text-2xl font-bold mb-2 font-serif" style={{ color: '#ffdd75' }}>
							{props.displayName}
						</h2>
						<p className="text-gold-100 mb-4 font-serif">
							{props.description}
						</p>
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center">
								<Button
									variant="outline"
									size="icon"
									onClick={decreaseQuantity}
									disabled={quantity <= 1}
									aria-label="Decrease quantity"
									className="rounded-r-none bg-gold-100 text-black border-gold-200 hover:bg-gold-200 font-serif"
								>
									<Minus className="h-4 w-4 text-black" />
								</Button>
								<Input
									type="number"
									value={quantity}
									onChange={handleQuantityChange}
									className="w-20 text-center rounded-none border-x-0 bg-gold-100 text-black placeholder:text-gold-200 border-gold-200 font-serif"
									min="1"
								/>
								<Button
									variant="outline"
									size="icon"
									onClick={increaseQuantity}
									aria-label="Increase quantity"
									className="rounded-l-none bg-gold-100 text-black border-gold-200 hover:bg-gold-200 font-serif"
								>
									<Plus className="h-4 w-4 text-black" />
								</Button>
							</div>
							<div className="text-base pr-1 font-semibold text-gold-200 font-serif">
								Total: {props.pricePerToken * quantity} {displayCurrencySymbol}
							</div>
						</div>

						<div className="flex items-center space-x-2 mb-4">
							<Switch
								id="custom-address"
								checked={useCustomAddress}
								onCheckedChange={setUseCustomAddress}
							/>
							<Label
								htmlFor="custom-address"
								className={`${useCustomAddress ? "text-gold-200" : "text-gold-100/60"} cursor-pointer font-serif`}
							>
								Mint to a custom address
							</Label>
						</div>
						{useCustomAddress && (
							<div className="mb-4">
								<Input
									id="address-input"
									type="text"
									placeholder="Enter recipient address"
									value={customAddress}
									onChange={(e) => setCustomAddress(e.target.value)}
									className="w-full bg-gold-100/10 border-gold-200/20 text-gold-200 placeholder:text-gold-100/50 font-serif"
								/>
							</div>
						)}
					</CardContent>
					<CardFooter>
						{account ? (
							<ClaimButton
								theme={"light"}
								contractAddress={props.contract.address}
								chain={props.contract.chain}
								client={props.contract.client}
								claimParams={
									props.isERC1155
										? {
											type: "ERC1155",
											tokenId: props.tokenId,
											quantity: BigInt(quantity),
											to: customAddress,
											from: account.address,
										}
										: props.isERC721
											? {
												type: "ERC721",
												quantity: BigInt(quantity),
												to: customAddress,
												from: account.address,
											}
											: {
												type: "ERC20",
												quantity: String(quantity),
												to: customAddress,
												from: account.address,
											}
								}
								style={{
									backgroundColor: "black",
									color: "white",
									width: "100%",
								}}
								disabled={isMinting}
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
				{true && (
					<Toast className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md">
						Successfully minted {quantity} NFT{quantity > 1 ? "s" : ""}
						{useCustomAddress && customAddress ? ` to ${customAddress}` : ""}!
					</Toast>
				)}
			</div>
		</div>
	);
}
