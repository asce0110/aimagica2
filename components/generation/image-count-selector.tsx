"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useGenerationStore } from "@/lib/stores/generation-store"

export default function ImageCountSelector() {
  const { imageCount, setImageCount, creationMode } = useGenerationStore()

  const counts = [1, 2, 4]

  return (
    <div className="bg-white rounded-2xl shadow-xl border-4 border-[#2d3e2d] p-4 transform rotate-0.5 hover:-rotate-0.5 hover:scale-105 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
      {/* 装饰元素 */}
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#d4a574] rounded-full"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#8b7355] rounded-full"></div>
      
      <h4 className="text-[#2d3e2d] font-black text-base mb-3 transform -rotate-1" style={{ 
        fontFamily: "Fredoka One, Arial Black, sans-serif",
        textShadow: "1px 1px 0px #d4a574"
      }}>
        Number of {creationMode.includes("video") ? "Videos" : "Images"} 🖼️
      </h4>
      
      <div className="grid grid-cols-3 gap-3">
        {counts.map((count, index) => (
          <Button
            key={count}
            onClick={() => {
              console.log(`🐛 Setting imageCount to ${count}`)
              setImageCount(count)
            }}
            variant="outline"
            className={`h-16 px-4 py-3 border-3 font-black transition-all transform hover:scale-110 hover:shadow-xl text-base rounded-xl ${
              imageCount === count
                ? `bg-[#d4a574] border-[#d4a574] text-[#2d3e2d] scale-110 shadow-xl ${index % 2 === 0 ? 'rotate-2' : '-rotate-2'}`
                : "bg-[#f5f1e8] border-[#8b7355] text-[#8b7355] hover:bg-[#d4a574]/20 hover:border-[#d4a574]"
            }`}
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-2xl font-black">{count}</span>
              <span className="text-xs opacity-80">
                {creationMode.includes("video") ? "Video" : "Image"}{count > 1 ? 's' : ''}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}