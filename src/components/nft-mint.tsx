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
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [isHovering, setIsHovering] = useState(false);
	const { theme, setTheme } = useTheme();
	const account = useActiveAccount();

	// Override currency symbol based on contract chain
	const displayCurrencySymbol = overrideCurrencySymbol(
		props.currencySymbol || "", 
		props.contract.chain.id
	);

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
		<div className="min-h-screen bg-[#17130b] font-serif">
			{/* Animated background elements */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
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
						<Button className="px-6 py-3 text-base font-semibold bg-transparent border border-[#bd9740] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-serif">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Button>
					</Link>
				</div>
				
				<Card className="w-full max-w-md bg-gold-100/10 backdrop-blur-sm border border-gold-200/40 font-serif">
					<CardContent className="pt-6">
						<div 
							className="aspect-square overflow-hidden rounded-lg mb-4 relative cursor-pointer perspective-1000 transition-all duration-300 ease-out"
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
							<div className="w-full h-full">
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
							</div>
							<div className="absolute top-2 right-2 bg-[#17130b] bg-opacity-80 text-gold-200 px-2 py-1 rounded-full text-sm font-semibold font-serif">
								{props.pricePerToken} {displayCurrencySymbol}/each
							</div>
						</div>
						<h2 className="text-2xl font-bold mb-2 font-serif" style={{ color: '#bd9740' }}>
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
									className="rounded-r-none bg-transparent border border-[#bd9740] text-gold-200 hover:bg-gold-200/10 font-serif"
								>
									<Minus className="h-4 w-4 text-gold-200" />
								</Button>
								<Input
									type="number"
									value={quantity}
									onChange={handleQuantityChange}
									className="w-20 text-center rounded-none border-x-0 bg-transparent border border-[#bd9740] text-gold-200 placeholder:text-gold-200/50 font-serif"
									min="1"
								/>
								<Button
									variant="outline"
									size="icon"
									onClick={increaseQuantity}
									aria-label="Increase quantity"
									className="rounded-l-none bg-transparent border border-[#bd9740] text-gold-200 hover:bg-gold-200/10 font-serif"
								>
									<Plus className="h-4 w-4 text-gold-200" />
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
									className="w-full bg-transparent border border-[#bd9740] text-gold-200 placeholder:text-gold-200/50 font-serif"
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
									backgroundColor: "transparent",
									color: "white",
									width: "100%",
									border: "1px solid #bd9740",
									borderRadius: "0.5rem",
									padding: "0.75rem 1rem",
									fontWeight: "600",
									fontFamily: "serif",
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
				{/* Toast notifications are handled by the toast library */}
			</div>
		</div>
	);
}
