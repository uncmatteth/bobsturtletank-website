"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "🏠 Tank View", emoji: "🏠" },
  { href: "/book", label: "💎 Treasure Chest", emoji: "💎" },
  { href: "/book/maps", label: "🗺️ Atlas", emoji: "🗺️" },
  { href: "/games", label: "🎮 Arcade", emoji: "🎮" },
  { href: "/book/characters", label: "👥 Residents", emoji: "👥" },
  { href: "/lore", label: "📖 Lore", emoji: "📖" },
  { href: "/about", label: "ℹ️ Tank Setup", emoji: "ℹ️" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full tank-rim shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Looking into Tank */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center ring-2 ring-blue-300/50 group-hover:ring-blue-400 transition-all group-hover:scale-110">
              <span className="text-2xl">🐢</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-serif font-bold text-lg leading-tight text-white drop-shadow-md">
                Bob's Tank
              </div>
              <div className="text-[10px] text-blue-100 -mt-0.5">
                🫧 Look Inside!
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Lily Pad Style */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium transition-all",
                  "bg-white/80 hover:bg-white text-gray-800 hover:shadow-lg hover:-translate-y-0.5",
                  "border-2",
                  pathname === item.href
                    ? "bg-emerald-100 border-emerald-400 shadow-md scale-105"
                    : "border-blue-200/50"
                )}
              >
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden text-lg">{item.emoji}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden bg-white/80 hover:bg-white rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu - Underwater Style */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-4 py-3 rounded-xl text-base font-medium transition-all",
                  "bg-white/80 hover:bg-white text-gray-800",
                  pathname === item.href
                    ? "bg-emerald-100 border-2 border-emerald-400 shadow-md"
                    : "border-2 border-blue-200/50"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
