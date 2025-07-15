import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "sonner";
import { ToastProvider } from "@/components/ui/toast";

const merriweather = Merriweather({ 
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"]
});

export const metadata: Metadata = {
	title: "0xSkittyCat",
	description: "Digital artist exploring the boundaries between human creativity and digital innovation. NFT collections and digital art by 0xSkittyCat.",
	icons: {
		icon: "/MarieIcon50px.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={merriweather.className}>
				<ToastProvider>
					<Toaster position="bottom-center" />
					<ThirdwebProvider>{children}</ThirdwebProvider>
				</ToastProvider>
			</body>
		</html>
	);
}
