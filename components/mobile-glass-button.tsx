"use client"

import type React from "react"

import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface MobileGlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "neutral"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  glassEffect?: boolean
}

const MobileGlassButton = forwardRef<HTMLButtonElement, MobileGlassButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      icon,
      iconPosition = "left",
      glassEffect = true,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // 根据变体确定颜色
    const getVariantClasses = () => {
      if (!glassEffect) {
        switch (variant) {
          case "primary":
            return "bg-[#4a5a4a] text-[#f5f1e8] border-[#8b7355] hover:bg-[#5a6a5a]"
          case "secondary":
            return "bg-[#8b7355] text-[#f5f1e8] border-[#2d3e2d] hover:bg-[#6d5a42]"
          case "accent":
            return "bg-[#d4a574] text-[#2d3e2d] border-[#2d3e2d] hover:bg-[#c19660]"
          case "neutral":
            return "bg-[#f5f1e8] text-[#2d3e2d] border-[#8b7355] hover:bg-[#e6e2d9]"
        }
      }

      // 玻璃效果按钮
      switch (variant) {
        case "primary":
          return "bg-[#4a5a4a]/70 text-[#f5f1e8] border-[#4a5a4a]/30 hover:bg-[#4a5a4a]/80"
        case "secondary":
          return "bg-[#8b7355]/70 text-[#f5f1e8] border-[#8b7355]/30 hover:bg-[#8b7355]/80"
        case "accent":
          return "bg-[#d4a574]/70 text-[#2d3e2d] border-[#d4a574]/30 hover:bg-[#d4a574]/80"
        case "neutral":
          return "bg-[#f5f1e8]/70 text-[#2d3e2d] border-[#f5f1e8]/30 hover:bg-[#f5f1e8]/80"
      }
    }

    // 根据尺寸确定大小
    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "text-xs py-1 px-3"
        case "md":
          return "text-sm py-2 px-4"
        case "lg":
          return "text-base py-3 px-6"
      }
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative rounded-xl font-black border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md",
          getVariantClasses(),
          getSizeClasses(),
          (disabled || isLoading) && "opacity-70 cursor-not-allowed hover:scale-100 active:scale-100",
          glassEffect && "backdrop-blur-md",
          className,
        )}
        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
        {...props}
      >
        <div className="flex items-center justify-center space-x-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {icon && iconPosition === "left" && !isLoading && <span>{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === "right" && !isLoading && <span>{icon}</span>}
        </div>

        {/* 玻璃效果的高光 */}
        {glassEffect && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
            <div className="absolute w-full h-1/3 bg-white/20 rounded-t-xl" style={{ top: "-1px", left: 0 }}></div>
          </div>
        )}
      </button>
    )
  },
)

MobileGlassButton.displayName = "MobileGlassButton"

export default MobileGlassButton
