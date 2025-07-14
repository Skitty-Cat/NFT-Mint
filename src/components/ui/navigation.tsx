"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { Button } from "./button";
import Link from "next/link";
import { Palette } from "lucide-react";
import Image from "next/image";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/MarieIcon50px.png" alt="Logo" width={32} height={32} className="rounded-full" />
            <span className="text-xl font-bold text-white">0xSkittyCat</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {/* <Link href="/" className="text-white/80 hover:text-white transition-colors">
              Home
            </Link> */}
            {/* <Link href="/#gallery" className="text-white/80 hover:text-white transition-colors">
              Gallery
            </Link> */}
            {/* <Link href="/#projects" className="text-white/80 hover:text-white transition-colors">
              Projects
            </Link> */}
            {/* <Link href="/mint" className="text-white/80 hover:text-white transition-colors">
              Mint
            </Link> */}
            {/* <Link href="/#contact" className="text-white/80 hover:text-white transition-colors">
              Contact
            </Link> */}
          </div>

          {/* Connect Button */}
          <div className="flex items-center space-x-4">
            <ConnectButton client={client} />
          </div>
        </div>
      </div>
    </nav>
  );
} 