"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Square, Smartphone } from "lucide-react"
import { useGenerationStore } from "@/lib/stores/generation-store"

export default function AspectRatioSelector() {
  const { aspectRatio, setAspectRatio } = useGenerationStore()

  const ASPECT_RATIOS = [
    { id: "1:1", name: "Square", icon: <Square className="w-4 h-4" />, size: "1024x1024" },
    { id: "2:3", name: "Portrait", icon: <Smartphone className="w-4 h-4" />, size: "1024x1536" },
    { id: "3:2", name: "Landscape", icon: "📱", size: "1536x1024" }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl border-4 border-[#2d3e2d] p-4 transform -rotate-0.5 hover:rotate-0 hover:scale-105 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
      {/* 装饰元素 */}
      <div className="absolute -top-2 -left-2 w-5 h-5 bg-[#d4a574] rounded-full"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#8b7355] rounded-full"></div>
      
      <h4 className="text-[#2d3e2d] font-black text-base mb-3 transform rotate-1" style={{ 
        fontFamily: "Fredoka One, Arial Black, sans-serif",
        textShadow: "1px 1px 0px #d4a574"
      }}>
        Aspect Ratio 📐
      </h4>
      
      <div className="grid grid-cols-3 gap-2">
        {ASPECT_RATIOS.map((ratio, index) => (
          <Button
            key={ratio.id}
            onClick={() => setAspectRatio(ratio.id)}
            variant="outline"
            className={`h-auto py-2 px-1 border-2 font-bold transition-all transform hover:scale-105 hover:shadow-lg text-xs ${
              aspectRatio === ratio.id
                ? `bg-[#d4a574] border-[#d4a574] text-[#2d3e2d] scale-105 shadow-lg ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`
                : "bg-[#f5f1e8] border-[#8b7355] text-[#8b7355] hover:bg-[#d4a574]/20 hover:border-[#d4a574]"
            }`}
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <div className="flex flex-col items-center space-y-1">
              {typeof ratio.icon === 'string' ? (
                <span className="text-sm">{ratio.icon}</span>
              ) : (
                <div className="text-sm">{ratio.icon}</div>
              )}
              <span className="text-xs leading-tight">{ratio.name}</span>
              <span className="text-xs opacity-70">{ratio.id}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}