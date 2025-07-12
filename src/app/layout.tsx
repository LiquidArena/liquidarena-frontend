import Footer from "@/components/ui/footer";
import Navbar from "@/components/ui/navbar";
import WalletProfile from "@/components/ui/wallet-profile";
import type { Metadata } from "next";
import { Saira } from "next/font/google";

import "./globals.css";
import Providers from "./providers";

const saira = Saira({
  subsets: ["latin"],
  variable: "--font-saira",
  weight: ["700", "600", "500", "400"],
});

export const metadata: Metadata = {
  title: "Liquid Arena",
  description: "Stake. Predict. Conquer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${saira.variable} antialiased`}>
        <Providers>
          <Navbar />
          <WalletProfile />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
