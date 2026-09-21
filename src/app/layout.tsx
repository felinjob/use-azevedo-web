import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/cart/CartDrawer";
import WhatsAppFloatingButton from "@/components/common/WhatsAppFloatingButton";
import SearchModal from "@/components/layout/SearchModal";
import MobileTabBar from "@/components/layout/MobileTabBar";
import GlobalSizeGuideModal from "@/components/common/GlobalSizeGuideModal";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const brandFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: "Loja Use Azevedo",
  description: "Moda mid e plus size com modelagem exclusiva, alfaiataria premium e caimento impecável.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${brandFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <CartDrawer />
        <SearchModal />
        <MobileNavDrawer />
        <GlobalSizeGuideModal />
        <WhatsAppFloatingButton />
        <MobileTabBar />
      </body>
    </html>
  );
}
