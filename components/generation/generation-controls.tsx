"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { useGenerationStore } from "@/lib/stores/generation-store"
import StyleRequirementsAlert from "@/components/ui/style-requirements-alert"

interface GenerationControlsProps {
  onStartRender: (aspectRatio?: string, styleId?: string | null, imageCount?: number, uploadedImage?: string | null, modelParams?: any) => void
}

export default function GenerationControls({ onStartRender }: GenerationControlsProps) {
  const {
    getGenerationConfig,
    validateConfiguration,
    imageCount,
    isGenerating,
    setIsGenerating
  } = useGenerationStore()

  // 验证提示对话框状态
  const [showRequirementsAlert, setShowRequirementsAlert] = useState(false)
  const [requirementsAlertData, setRequirementsAlertData] = useState<{
    title: string
    errors: string[]
    warnings: string[]
    styleName?: string
    styleEmoji?: string
  }>({
    title: '',
    errors: [],
    warnings: []
  })

  const handleStartRender = () => {
    console.log('🎨 Generation controls: handleStartRender called')
    
    // 验证配置
    const validation = validateConfiguration()
    
    if (!validation.isValid) {
      // 显示错误提示
      setRequirementsAlertData({
        title: 'Configuration Required',
        errors: validation.errors,
        warnings: validation.warnings
      })
      setShowRequirementsAlert(true)
      return
    }
    
    // 获取完整配置
    const config = getGenerationConfig()
    console.log('🎨 Generation config:', config)
    
    // 开始生成
    setIsGenerating(true)
    onStartRender(
      config.aspectRatio,
      config.styleId,
      config.imageCount,
      config.uploadedImage,
      config.modelParams
    )
    
    // 注意：setIsGenerating(false) 应该在生成完成后调用
    // 这里只是示例，实际应该在onStartRender的回调中处理
  }

  return (
    <>
      {/* Generate Button - Full Width */}
      <div className="relative">
        {/* 装饰性背景元素 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#d4a574]/20 to-[#8b7355]/20 rounded-3xl transform rotate-1 scale-105"></div>
        
        <Button
          onClick={handleStartRender}
          disabled={isGenerating}
          className="relative w-full bg-gradient-to-r from-[#d4a574] to-[#8b7355] hover:from-[#c19660] hover:to-[#6d5a42] text-[#2d3e2d] font-black text-lg py-4 rounded-2xl shadow-2xl border-4 border-[#2d3e2d] transform hover:scale-105 hover:-rotate-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0 animate-pulse"
          style={{
            fontFamily: "Fredoka One, Arial Black, sans-serif",
            textShadow: "2px 2px 0px rgba(245, 241, 232, 0.8)",
          }}
        >
          <span className="relative z-10">
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2d3e2d] inline-block mr-3"></div>
                Generating Amazing Art...
              </>
            ) : (
              <>
                ✨ Generate {imageCount} Amazing {
                  imageCount > 1 ? 'Images' : 'Image'
                } ✨
              </>
            )}
          </span>
          
          {/* 闪烁效果 */}
          {!isGenerating && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
          )}
        </Button>
      </div>

      {/* Magic Tips */}
      <div className="p-4 bg-gradient-to-br from-[#f5f1e8] to-[#ede7d3] rounded-xl border-2 border-[#8b7355] shadow-lg transform -rotate-0.5 hover:rotate-0 hover:scale-105 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a574] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#8b7355] rounded-full animate-pulse delay-500"></div>
        
        <h4
          className="text-[#2d3e2d] font-black mb-2 transform rotate-1 animate-wiggle"
          style={{
            fontFamily: "Fredoka One, Arial Black, sans-serif",
            textShadow: "2px 2px 0px #d4a574",
          }}
        >
          Magic Tips! 💡
        </h4>
        <div
          className="text-[#2d3e2d] font-bold space-y-1 text-sm"
          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
        >
          <MagicTips />
        </div>
      </div>

      {/* 风格要求提示对话框 */}
      <StyleRequirementsAlert
        isOpen={showRequirementsAlert}
        onClose={() => setShowRequirementsAlert(false)}
        title={requirementsAlertData.title}
        errors={requirementsAlertData.errors}
        warnings={requirementsAlertData.warnings}
        styleName={requirementsAlertData.styleName}
        styleEmoji={requirementsAlertData.styleEmoji}
      />
    </>
  )
}

// 魔法提示组件
function MagicTips() {
  const { creationMode } = useGenerationStore()

  const tips = {
    "text2img": [
      "📝 Detailed descriptions get better results",
      "🎨 Try adding style keywords like \"watercolor\", \"oil painting\"",
      "✨ Use emotional words like \"dreamy\", \"mysterious\""
    ],
    "img2img": [
      "🖼️ Clear, high-quality images work best",
      "🎨 Describe the transformation you want",
      "✨ Additional descriptions help guide the result"
    ],
    "text2video": [
      "🎬 Describe movement and action for better videos",
      "🎨 Include camera angles like \"close-up\", \"wide shot\"",
      "✨ Mention lighting and atmosphere for cinematic feel"
    ],
    "img2video": [
      "🖼️ Use clear, well-lit images for best results",
      "🎭 Describe specific movements you want to see",
      "✨ Keep animations simple for more realistic results"
    ]
  }

  return (
    <>
      {tips[creationMode].map((tip, index) => (
        <p key={index}>{tip}</p>
      ))}
    </>
  )
}