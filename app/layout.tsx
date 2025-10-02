import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StreamSidebar } from "@/components/layout/StreamSidebar";
import { TankBubbles } from "@/components/tank/TankBubbles";
import { SwimmingBob } from "@/components/tank/SwimmingBob";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Bob's Turtle Tank 🐢 | 69 Epic Adventure Chapters",
    template: "%s | Bob's Tank",
  },
  description: "🐢 Dive into Bob the Magical Talking Turtle's underwater world! 69 epic chapters, arcade games, treasure hunts, and more. Looking into Bob's actual tank has never been this fun!",
  keywords: ["Bob the Turtle", "turtle tank", "fantasy adventure", "browser games", "interactive fiction", "Uncle Matt", "underwater adventure", "roguelike", "trivia game", "aquarium"],
  authors: [{ name: "Uncle Matt" }],
  creator: "Uncle Matt",
  icons: {
    icon: '/bob-icon.png',
    apple: '/bob-icon.png',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bobsturtletank.fun",
    title: "Bob's Turtle Tank 🐢 | Dive Into Adventure",
    description: "Look into Bob's tank! 69 epic chapters, underwater arcade, and magical treasures await!",
    siteName: "Bob's Turtle Tank",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bob's Turtle Tank 🐢 | Adventure Awaits",
    description: "Dive into Bob's underwater world - 69 chapters, games, and treasures!",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable} font-sans antialiased`}>
        {/* Tank Environment Effects */}
        <TankBubbles />
        <SwimmingBob />
        
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <StreamSidebar />
      </body>
    </html>
  );
}
