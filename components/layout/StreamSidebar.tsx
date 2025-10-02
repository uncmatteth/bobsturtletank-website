"use client"

import { useState } from "react"
import { X, Maximize2, Minimize2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function StreamSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPopped, setIsPopped] = useState(false)

  const handlePopOut = () => {
    window.open(
      "https://portal.abs.xyz/stream/UncleMatt",
      "BobsTurtleTank",
      "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no"
    )
    setIsPopped(true)
    setIsOpen(false)
  }

  if (isPopped) return null

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 shadow-lg"
          size="lg"
        >
          🐢 Watch Bob's Tank Live
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-background border-l shadow-2xl transition-all duration-300 z-50",
          isOpen ? "translate-x-0" : "translate-x-full",
          isExpanded ? "w-full md:w-3/4 lg:w-2/3" : "w-full md:w-96"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
          <h2 className="font-semibold flex items-center gap-2">
            <span className="text-2xl">🐢</span>
            Bob's Tank Live Stream
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Minimize" : "Maximize"}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePopOut}
              title="Pop out to new window"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stream Content */}
        <div className="w-full h-[calc(100%-4rem)] bg-black">
          <iframe
            src="https://portal.abs.xyz/stream/UncleMatt"
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Bob's Turtle Tank Live Stream"
          />
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

