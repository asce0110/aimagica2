"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface GlassMorphismProps {
  children: React.ReactNode
  className?: string
  intensity?: "light" | "medium" | "heavy"
  color?: "primary" | "secondary" | "accent" | "neutral"
  border?: boolean
  hover?: boolean
  active?: boolean
  disabled?: boolean
}

export default function GlassMorphism({
  children,
  className,
  intensity = "medium",
  color = "primary",
  border = true,
  hover = false,
  active = false,
  disabled = false,
}: GlassMorphismProps) {
  const [supportsBackdropFilter, setSupportsBackdropFilter] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 检测设备是否支持backdrop-filter
    const isBackdropFilterSupported = "backdropFilter" in document.documentElement.style
    setSupportsBackdropFilter(isBackdropFilterSupported)

    // 检测是否为移动设备
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 根据强度设置模糊值
  const getBlurValue = () => {
    if (isMobile) {
      // 移动设备上使用较小的模糊值以提高性能，进一步减少朦胧感
      return intensity === "light" ? "2px" : intensity === "medium" ? "4px" : "6px"
    }
    // 桌面端也大幅减少模糊值，避免朦胧效果
    return intensity === "light" ? "3px" : intensity === "medium" ? "6px" : "10px"
  }

  // 根据颜色选择背景色
  const getBgColor = () => {
    // 提高透明度，让内容更清晰
    const opacity = isMobile ? "0.85" : "0.80"

    switch (color) {
      case "primary":
        return `rgba(45, 62, 45, ${opacity})`
      case "secondary":
        return `rgba(139, 115, 85, ${opacity})`
      case "accent":
        return `rgba(212, 165, 116, ${opacity})`
      case "neutral":
        return `rgba(245, 241, 232, ${opacity})`
      default:
        return `rgba(255, 255, 255, ${opacity})`
    }
  }

  // 根据颜色选择边框颜色
  const getBorderColor = () => {
    switch (color) {
      case "primary":
        return "border-[#2d3e2d]/30"
      case "secondary":
        return "border-[#8b7355]/30"
      case "accent":
        return "border-[#d4a574]/30"
      case "neutral":
        return "border-[#f5f1e8]/30"
      default:
        return "border-white/30"
    }
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300",
        border && getBorderColor(),
        border && "border-2",
        hover && "hover:shadow-lg hover:scale-[1.02]",
        active && "active:scale-[0.98]",
        disabled && "opacity-60 pointer-events-none",
        className,
      )}
      style={{
        background: getBgColor(),
        backdropFilter: supportsBackdropFilter ? `blur(${getBlurValue()})` : "none",
        WebkitBackdropFilter: supportsBackdropFilter ? `blur(${getBlurValue()})` : "none",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      }}
    >
      {/* 如果不支持backdrop-filter，添加一个模糊背景作为备用 */}
      {!supportsBackdropFilter && (
        <div
          className="absolute inset-0 z-[-1]"
          style={{
            background: getBgColor(),
            opacity: 0.9,
          }}
        />
      )}

      {/* 装饰元素 - 移动设备上减少数量 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div
          className="absolute w-16 h-16 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
            top: "10%",
            right: "10%",
          }}
        />
        {!isMobile && (
          <div
            className="absolute w-24 h-24 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
              bottom: "15%",
              left: "5%",
            }}
          />
        )}
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
