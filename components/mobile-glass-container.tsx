"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface MobileGlassContainerProps {
  children: React.ReactNode
  className?: string
  backgroundImage?: string
  overlayColor?: string
  enableParallax?: boolean
}

export default function MobileGlassContainer({
  children,
  className,
  backgroundImage,
  overlayColor = "rgba(45, 62, 45, 0.3)",
  enableParallax = true,
}: MobileGlassContainerProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (enableParallax) {
        setScrollPosition(window.scrollY)
      }
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", checkMobile)
    }
  }, [enableParallax])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* 背景图片 - 带视差效果 */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            transform: enableParallax && !isMobile ? `translateY(${scrollPosition * 0.1}px)` : "none",
            filter: "blur(1px)",
          }}
        />
      )}

      {/* 背景叠加层 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: overlayColor,
        }}
      />

      {/* 装饰元素 - 移动设备上减少数量 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-40 h-40 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(212,165,116,0.8) 0%, rgba(212,165,116,0) 70%)",
            top: "5%",
            right: "10%",
            transform: enableParallax && !isMobile ? `translateY(${scrollPosition * 0.2}px)` : "none",
          }}
        />
        {!isMobile && (
          <div
            className="absolute w-60 h-60 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(139,115,85,0.8) 0%, rgba(139,115,85,0) 70%)",
              bottom: "10%",
              left: "5%",
              transform: enableParallax ? `translateY(${scrollPosition * -0.1}px)` : "none",
            }}
          />
        )}
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
