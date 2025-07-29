"use client"

import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"

interface MagicLoadingProps {
  size?: "small" | "medium" | "large"
  message?: string
  showMessage?: boolean
  className?: string
}

export default function MagicLoading({ 
  size = "medium", 
  message = "Creating magic...", 
  showMessage = true,
  className = "" 
}: MagicLoadingProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    small: {
      container: "w-8 h-8",
      sparkles: "w-4 h-4",
      text: "text-xs mt-1"
    },
    medium: {
      container: "w-12 h-12",
      sparkles: "w-6 h-6", 
      text: "text-sm mt-2"
    },
    large: {
      container: "w-16 h-16",
      sparkles: "w-8 h-8",
      text: "text-base mt-3"
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* 旋转的魔法光环 */}
      <div className={`relative ${currentSize.container}`}>
        {/* 外圈光环 */}
        <div className="absolute inset-0 rounded-full border-2 border-[#d4a574]/30 animate-spin"></div>
        
        {/* 内圈光环 - 反向旋转 */}
        <div className="absolute inset-1 rounded-full border-2 border-[#8b7355]/50 animate-[spin_1.5s_linear_infinite_reverse]"></div>
        
        {/* 中心星星图标 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles 
            className={`${currentSize.sparkles} text-[#8b7355] animate-pulse`}
          />
        </div>
        
        {/* 魔法粒子效果 */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#d4a574] rounded-full animate-ping"></div>
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#8b7355] rounded-full animate-ping delay-300"></div>
        <div className="absolute top-1/2 -left-2 w-1 h-1 bg-[#f5f1e8] rounded-full animate-ping delay-700"></div>
      </div>

      {/* 加载消息 */}
      {showMessage && (
        <div 
          className={`${currentSize.text} text-[#8b7355] font-bold text-center`}
          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
        >
          {message}{dots}
        </div>
      )}
    </div>
  )
} 