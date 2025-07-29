"use client"

import React, { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useGenerationStore } from "@/lib/stores/generation-store"

export default function PromptInput() {
  const { textPrompt, setTextPrompt, creationMode } = useGenerationStore()
  
  // 防重复随机提示词状态
  const [usedPromptIndices, setUsedPromptIndices] = useState<Set<number>>(new Set())

  const randomPrompts = [
    "A magical forest with glowing mushrooms and fairy lights",
    "A cyberpunk city with neon lights reflecting in the rain",
    "A serene mountain lake at sunset with mist",
    "A cute cat wizard casting colorful spells",
    "A fantasy castle floating in the clouds",
    "A steampunk airship sailing through golden sky",
    "A cozy cottage in an enchanted winter wonderland",
    "A dragon soaring over mystical ancient ruins",
    "A vibrant underwater coral reef with tropical fish",
    "A peaceful zen garden with cherry blossoms falling",
    "A majestic phoenix rising from crystalline flames",
    "A space explorer discovering alien planets with purple moons",
    "A Victorian mansion in a thunderstorm with lightning",
    "A friendly robot gardener tending to rainbow flowers",
    "An ancient library with floating books and golden dust",
    "A pirate ship sailing through starry night clouds",
    "A crystal cave filled with bioluminescent creatures",
    "A time traveler's workshop with clockwork inventions",
    "A mermaid palace built from coral and pearls",
    "A ninja cat on a moonlit rooftop in feudal Japan",
    "A floating island city with waterfalls and bridges",
    "A magical bakery where pastries glow with enchantments",
    "An arctic fox dancing with aurora borealis lights",
    "A desert oasis with palm trees and hidden treasures",
    "A clockwork butterfly in a garden of mechanical flowers",
    "A sleepy dragon curled around a tower of books",
    "A carnival in the clouds with balloon rides and cotton candy",
    "A witch's greenhouse filled with singing plants",
    "A knight's armor decorating a peaceful meadow",
    "A submarine exploring colorful deep-sea trenches",
    "A treehouse village connected by rope bridges",
    "A phoenix feather glowing in an ancient temple",
    "A robot artist painting landscapes on Mars",
    "A fairy ring of mushrooms glowing under starlight",
    "A clocktower with gears made of autumn leaves",
    "A dragon egg nestled in a field of spring flowers",
    "A ghost ship sailing through mist and moonbeams",
    "A butterfly sanctuary with rainbow-winged creatures",
    "A medieval tournament with colorful banners flying",
    "A hot air balloon race over painted desert canyons"
  ]

  const generateRandomPrompt = () => {
    // 智能防重复随机选择
    let availableIndices = Array.from({ length: randomPrompts.length }, (_, i) => i)
      .filter(i => !usedPromptIndices.has(i))

    // 如果所有提示词都用过了，重置已使用列表
    if (availableIndices.length === 0) {
      setUsedPromptIndices(new Set())
      availableIndices = Array.from({ length: randomPrompts.length }, (_, i) => i)
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
    const randomPrompt = randomPrompts[randomIndex]

    // 记录已使用的提示词索引
    setUsedPromptIndices(prev => new Set([...prev, randomIndex]))
    setTextPrompt(randomPrompt)
  }

  const isImageMode = creationMode === "img2img" || creationMode === "img2video"
  const isOptional = isImageMode

  return (
    <div className="bg-white rounded-2xl shadow-xl border-4 border-[#2d3e2d] p-4 transform rotate-0.5 hover:-rotate-0.5 hover:scale-105 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
      {/* 装饰元素 */}
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#d4a574] rounded-full"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#8b7355] rounded-full"></div>
      
      <div className="space-y-3">
        <Label
          className="text-[#2d3e2d] font-black text-base transform -rotate-1 hover:rotate-1 hover:scale-105 inline-block transition-all duration-300 cursor-pointer"
          style={{
            fontFamily: "Fredoka One, Arial Black, sans-serif",
            textShadow: "1px 1px 0px #d4a574",
          }}
        >
          {isOptional ? 
            "Describe Your Vision! (Optional) 💭" : 
            "Describe Your Vision! ✨"
          }
        </Label>
        
        <div className="relative group">
          <Textarea
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            placeholder={
              isOptional ? 
                "Describe how you want to transform your image... (Optional - AI can work with just the image!)" :
                "A magical forest with glowing mushrooms and fairy lights..."
            }
            className="border-2 border-[#8b7355] bg-[#f5f1e8] text-[#2d3e2d] placeholder:text-[#8b7355]/70 font-bold resize-none focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 pr-10 py-6"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            rows={7}
          />
          
          {/* Clear button - 只在有内容且hover时显示 */}
          {textPrompt && (
            <button
              onClick={() => setTextPrompt('')}
              className="absolute top-2 right-2 w-6 h-6 bg-[#8b7355] hover:bg-[#d4a574] text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
              style={{ 
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                fontSize: "14px",
                fontWeight: "bold"
              }}
              title="Clear text"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Random and Reset buttons */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={generateRandomPrompt}
            className="px-3 py-1 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            title="Generate random prompt"
          >
            🎲 Random
          </button>
          <button
            onClick={() => setTextPrompt('')}
            className="px-3 py-1 bg-[#8b7355] hover:bg-[#7a6449] text-white rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            title="Reset text"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  )
}