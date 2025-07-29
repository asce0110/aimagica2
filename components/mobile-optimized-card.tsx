"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import GlassMorphism from "@/components/glass-morphism"

interface MobileOptimizedCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: React.ReactNode
  color?: "primary" | "secondary" | "accent" | "neutral"
  glassEffect?: boolean
}

export default function MobileOptimizedCard({
  children,
  className,
  title,
  icon,
  color = "neutral",
  glassEffect = true,
}: MobileOptimizedCardProps) {
  return (
    <div className={cn("w-full", className)}>
      {glassEffect ? (
        <GlassMorphism color={color} hover border className="overflow-hidden">
          {title && (
            <div
              className={cn(
                "p-4 flex items-center space-x-2 border-b",
                color === "primary"
                  ? "border-[#2d3e2d]/20 text-[#f5f1e8]"
                  : color === "secondary"
                    ? "border-[#8b7355]/20 text-[#f5f1e8]"
                    : color === "accent"
                      ? "border-[#d4a574]/20 text-[#2d3e2d]"
                      : "border-[#f5f1e8]/20 text-[#2d3e2d]",
              )}
            >
              {icon && <div className="flex-shrink-0">{icon}</div>}
              <h3 className="font-black text-lg transform -rotate-1" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                {title}
              </h3>
            </div>
          )}
          <div className="p-4">{children}</div>
        </GlassMorphism>
      ) : (
        <div
          className={cn(
            "rounded-2xl overflow-hidden border-4 shadow-lg",
            color === "primary"
              ? "bg-[#2d3e2d] border-[#8b7355] text-[#f5f1e8]"
              : color === "secondary"
                ? "bg-[#8b7355] border-[#2d3e2d] text-[#f5f1e8]"
                : color === "accent"
                  ? "bg-[#d4a574] border-[#2d3e2d] text-[#2d3e2d]"
                  : "bg-[#f5f1e8] border-[#8b7355] text-[#2d3e2d]",
          )}
        >
          {title && (
            <div
              className={cn(
                "p-4 flex items-center space-x-2 border-b",
                color === "primary" || color === "secondary" ? "border-white/20" : "border-[#2d3e2d]/20",
              )}
            >
              {icon && <div className="flex-shrink-0">{icon}</div>}
              <h3 className="font-black text-lg transform -rotate-1" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                {title}
              </h3>
            </div>
          )}
          <div className="p-4">{children}</div>
        </div>
      )}
    </div>
  )
}
