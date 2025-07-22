import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/components/auth/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aanstekerloos",
  description: "Created by Webdesign Borgman",
  icons: {
    icon: "/logo/favicon.ico",
    shortcut: "/logo/favicon.ico",
    apple: "/logo/apple-touch-icon.png",
  },
  manifest: "/logo/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-100`}>
      <AuthProvider>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <Toaster />
        </AuthProvider>
      </body>
      
    </html>
  );
}
