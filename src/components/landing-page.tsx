"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectButton, MediaRenderer } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import Link from "next/link";
import { useState, useEffect } from "react";
import { contract, defaultNftContractAddress } from "@/lib/constants";
import { getERC20Info } from "@/lib/erc20";
import { getERC721Info } from "@/lib/erc721";
import { getERC1155Info } from "@/lib/erc1155";
import { isERC1155 } from "thirdweb/extensions/erc1155";
import { isERC721 } from "thirdweb/extensions/erc721";
import { Skeleton } from "./ui/skeleton";
import { ArrowRight, Sparkles, Palette, Camera, Code, Heart, ExternalLink, Copy, Check } from "lucide-react";
import { TelegramIcon } from "./ui/telegram-icon";
import { Navigation } from "./ui/navigation";
import { GallerySection } from "./gallery-section";
import { ProjectsSection } from "./projects-section";
import Image from "next/image";

// Sample gallery data - you can replace with your actual artwork
const galleryItems = [
  {
    id: 1,
    title: "Digital Dreams",
    category: "Digital Art",
    image: "/demo-mint.png",
    description: "A surreal exploration of consciousness in the digital age"
  },
  {
    id: 2,
    title: "Neon Nights",
    category: "Photography",
    image: "/placeholder.svg?height=400&width=400",
    description: "Urban landscapes bathed in artificial light"
  },
  {
    id: 3,
    title: "Abstract Harmony",
    category: "Digital Art",
    image: "/placeholder.svg?height=400&width=400",
    description: "Geometric patterns meeting organic forms"
  },
  {
    id: 4,
    title: "Portrait Series",
    category: "Portraits",
    image: "/placeholder.svg?height=400&width=400",
    description: "Human emotion captured through digital lens"
  },
  {
    id: 5,
    title: "Nature's Code",
    category: "Generative Art",
    image: "/placeholder.svg?height=400&width=400",
    description: "Algorithmic interpretations of natural patterns"
  },
  {
    id: 6,
    title: "Future Memories",
    category: "Digital Art",
    image: "/placeholder.svg?height=400&width=400",
    description: "Nostalgia reimagined through futuristic aesthetics"
  }
];

// Sample projects data
const projects = [
  {
    id: 1,
    title: "AI Art Collaboration",
    description: "Exploring the intersection of human creativity and artificial intelligence through collaborative art pieces.",
    technologies: ["AI/ML", "Digital Art", "NFTs"],
    image: "/placeholder.svg?height=300&width=400",
    link: "#"
  },
  {
    id: 2,
    title: "Generative Art Collection",
    description: "A series of algorithmically generated artworks that evolve based on blockchain data.",
    technologies: ["Generative Art", "Blockchain", "JavaScript"],
    image: "/placeholder.svg?height=300&width=400",
    link: "#"
  },
  {
    id: 3,
    title: "Interactive Installations",
    description: "Digital art installations that respond to viewer interaction and environmental data.",
    technologies: ["Interactive Art", "Sensors", "Real-time"],
    image: "/placeholder.svg?height=300&width=400",
    link: "#"
  }
];

export function LandingPage() {
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(defaultNftContractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
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
    <div className="min-h-screen bg-[#17130b]">
      {/* Navigation */}
      <Navigation />
      {/* Animated background elements (scroll with page) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gold-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      {/* Hero Section */}
      <div className="relative z-10 text-center py-2 px-4 pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Artist Badge */}

          {/* Artist Name */}
          <h1 className="text-5xl md:text-8xl font-semibold mb-6 font-serif font-rochester" style={{ color: '#bd9740' }}>
            0xSkittyCat
            {/* <span className="block font-serif" style={{ color: '#ffdd75' }}>
              Artist
            </span> */}
          </h1>

          {/* Artist Bio */}
          <p className="text-xl md:text-2xl text-gold-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Making Web3 Cuter
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/mint">
              <Button className="px-8 py-2 text-lg font-medium bg-transparent border border-[#bd9740] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Mint My Latest Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="relative z-10 py-2 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative w-full max-w-2xl mx-auto">
              <div className="aspect-square overflow-hidden rounded-2xl w-full h-full">
                <Image src="/GoldenCleaver2Shadow.png" alt="Golden VRoid" fill className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-center my-12">
        <div
          className="w-48 h-1 rounded-full"
          style={{
            backgroundColor: "#bd9740",
            boxShadow: "0 0 16px 4px #bd9740, 0 0 32px 4px #bd9740"
          }}
        />
      </div>


      {/* Featured Collection Section */}
      <div className="relative z-10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold mb-4 font-serif" style={{ color: '#bd9740' }}>Latest Collection</h2>
            <p className="text-xl text-gold-100 max-w-2xl mx-auto">
              My newest NFT collection - Coming Soon
            </p>
          </div>
          <div className="flex flex-col items-center gap-8">

            {/* Collection Image */}
            {/* <div 
              className="relative w-full max-w-md mx-auto cursor-pointer perspective-1000"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className="aspect-square overflow-hidden rounded-2xl bg-gold-100/20 p-1 transition-all duration-300 ease-out"
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
                <div className="w-full h-full rounded-2xl overflow-hidden">
                  {loading ? (
                    <Skeleton className="w-full h-full" />
                  ) : (
                    <MediaRenderer
                      client={client}
                      className="w-full h-full object-cover"
                      alt={contractInfo?.displayName || "Latest NFT Collection"}
                      src={contractInfo?.contractImage || "/placeholder.svg?height=600&width=600"}
                    />
                  )}
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-gold-100 text-black px-4 py-2 rounded-full font-medium text-sm">
                <Sparkles className="inline h-4 w-4 mr-1" />
                New Release
              </div>
            </div> */}

            {/* Collection Details */}
            {/* <div className="w-full max-w-2xl mx-auto space-y-6 text-center">
              <div>
                <h3 className="text-3xl font-semibold mb-4 font-serif" style={{ color: '#bd9740' }}>
                  {loading ? "Loading..." : contractInfo?.displayName || "Digital Dreams Collection"}
                </h3>
                <p className="text-lg text-gold-100 leading-relaxed mb-4">
                  {loading ? "Loading description..." : contractInfo?.description || "A deeply personal collection exploring themes of digital identity and human connection in the modern age. Each piece represents a moment of introspection and artistic evolution."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gold-100/10 backdrop-blur-sm rounded-xl p-4 border border-gold-200/20">
                  <div className="text-2xl font-semibold text-gold-100">
                    {loading ? "..." : `${contractInfo?.pricePerToken || 0}`}
                  </div>
                  <div className="text-gold-200 text-sm">
                    {loading ? "Loading..." : `${contractInfo?.currencySymbol || "ETH"} per NFT`}
                  </div>
                </div>
                <div className="bg-gold-100/10 backdrop-blur-sm rounded-xl p-4 border border-gold-200/20">
                  <div className="text-2xl font-semibold text-gold-100">Limited</div>
                  <div className="text-gold-200 text-sm">Edition Size</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/mint" className="flex-1">
                  <Button className="w-full py-4 text-lg font-medium bg-transparent border border-[#bd9740] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" disabled={loading}>
                    {loading ? "Loading..." : "Mint Now"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-gold-200">Contract Address</span>
                <div className="relative group">
                  <Button
                    onClick={copyToClipboard}
                    className="px-6 py-3 text-base font-medium bg-transparent border border-[#bd9740] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        {defaultNftContractAddress.slice(0, 6)}...{defaultNftContractAddress.slice(-4)}
                      </>
                    )}
                  </Button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                    DO NOT SEND FUNDS TO THIS CONTRACT
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      
      {/* Footer */}
      <div id="contact" className="relative z-10 py-12 px-4 border-t border-gold-100/40">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gold-200 mb-4">
            © 2025 0xSkittyCat. Digital Artist & Creator.
          </p>
          <div className="flex justify-center gap-6">
            <a href="https://x.com/0xskittycat" className="text-gold-200 hover:text-gold-300 transition-colors">X</a>
            <a href="https://t.me/buhuclothing" className="text-gold-200 hover:text-gold-300 transition-colors flex items-center gap-2">
              <TelegramIcon className="h-5 w-5" />
              <span className="sr-only">Telegram</span>
            </a>
            {/* <a href="#" className="text-gold-200 hover:text-gold-300 transition-colors">Contact</a> */}
          </div>
        </div>
      </div>
    </div>
  );
} 