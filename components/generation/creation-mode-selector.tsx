"use client"

import React from "react"
import { Type, ImageIcon, Video, Film } from "lucide-react"
import { useGenerationStore } from "@/lib/stores/generation-store"
import type { CreationMode } from "@/lib/stores/generation-store"

interface CreationModeSelectorProps {
  hideModeSelector?: boolean
  forcedMode?: CreationMode
}

export default function CreationModeSelector({ hideModeSelector, forcedMode }: CreationModeSelectorProps) {
  const { 
    creationMode, 
    setCreationMode, 
    selectedStyleData,
    setUploadedImage 
  } = useGenerationStore()

  // 如果隐藏模式选择器，不渲染
  if (hideModeSelector) {
    return null
  }

  // 强制模式处理
  React.useEffect(() => {
    if (forcedMode && creationMode !== forcedMode) {
      setCreationMode(forcedMode)
    }
  }, [forcedMode, creationMode, setCreationMode])

  const handleModeChange = (mode: CreationMode) => {
    // 检查选择的风格是否禁止图片上传
    if (selectedStyleData?.prohibits_image_upload && (mode === "img2img" || mode === "img2video")) {
      // 这里应该显示错误提示，暂时跳过
      console.warn(`${selectedStyleData.name} style does not support image upload`)
      return
    }
    
    setCreationMode(mode)
    
    // 如果选择的风格禁止图片上传，切换回相应的文本模式
    if (selectedStyleData?.prohibits_image_upload) {
      if (mode === "img2img") {
        setCreationMode("text2img")
        setUploadedImage(null)
      } else if (mode === "img2video") {
        setCreationMode("text2video")
        setUploadedImage(null)
      }
    }
  }

  const modes = [
    {
      id: "text2img" as const,
      name: "Text to Image",
      icon: Type,
      disabled: false
    },
    {
      id: "img2img" as const,
      name: "Image to Image", 
      icon: ImageIcon,
      disabled: selectedStyleData?.prohibits_image_upload
    },
    {
      id: "text2video" as const,
      name: "Text to Video",
      icon: Video,
      disabled: false
    },
    {
      id: "img2video" as const,
      name: "Image to Video",
      icon: Film,
      disabled: selectedStyleData?.prohibits_image_upload
    }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl border-4 border-[#2d3e2d] p-4 transform rotate-1 hover:rotate-0 transition-all duration-300 relative overflow-hidden">
      {/* 装饰元素 */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#d4a574] rounded-full"></div>
      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-[#8b7355] rounded-full"></div>
      
      <h3
        className="text-[#2d3e2d] font-black text-lg mb-4 transform -rotate-2"
        style={{
          fontFamily: "Fredoka One, Arial Black, sans-serif",
          textShadow: "2px 2px 0px #d4a574",
        }}
      >
        Choose Creation Mode! 🎯
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {modes.map((mode, index) => {
          const Icon = mode.icon
          const isSelected = creationMode === mode.id
          const rotation = index % 2 === 0 ? "rotate-1" : "-rotate-1"
          
          return (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              disabled={mode.disabled}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 hover:${rotation} ${
                mode.disabled
                  ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50"
                  : isSelected
                    ? `bg-[#d4a574] border-[#d4a574] text-[#2d3e2d] scale-105 ${rotation} shadow-lg`
                    : "bg-[#f5f1e8] border-[#8b7355] text-[#8b7355] hover:border-[#d4a574] hover:bg-white"
              }`}
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <div className="font-bold text-sm">{mode.name}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}