import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "sonner";
import { ToastProvider } from "@/components/ui/toast";
import AnimatedBackground from "@/components/animated-background";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"]
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
	title: "0xSkittyCat",
	description: "Digital artist exploring the boundaries between human creativity and digital innovation. NFT collections and digital art by 0xSkittyCat.",
	icons: {
		icon: "/SiteIcon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AnimatedBackground />
				<ToastProvider>
					<Toaster position="bottom-center" />
					<ThirdwebProvider>{children}</ThirdwebProvider>
				</ToastProvider>
			</body>
		</html>
	);
}
