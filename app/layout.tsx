import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StreamSidebar } from "@/components/layout/StreamSidebar";

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
    default: "Bob's Turtle Tank | Adventure Realm Games & Stories",
    template: "%s | Bob's Turtle Tank",
  },
  description: "Explore Bob the Magical Talking Turtle's Adventure Realm - Play games, read epic fantasy chapters, discover characters, and test your knowledge with trivia!",
  keywords: ["Bob the Turtle", "fantasy adventure", "browser games", "interactive fiction", "Uncle Matt", "turtle tank", "roguelike", "trivia game"],
  authors: [{ name: "Uncle Matt" }],
  creator: "Uncle Matt",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bobsturtletank.fun",
    title: "Bob's Turtle Tank | Adventure Realm",
    description: "Play games, read epic adventures, and explore the magical world of Bob the Turtle",
    siteName: "Bob's Turtle Tank",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bob's Turtle Tank | Adventure Realm",
    description: "Play games, read epic adventures, and explore the magical world of Bob the Turtle",
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
