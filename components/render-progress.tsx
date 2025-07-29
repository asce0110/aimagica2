"use client"
import { Progress } from "@/components/ui/progress"
import { Cpu, Palette, Sparkles, CheckCircle, Clock, Zap } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import MagicImage from "@/components/ui/magic-image"
import WaitingGame from "@/components/waiting-game"

interface RenderProgressProps {
  progress: number
  generatedImages?: Array<{ url: string; revised_prompt?: string }>
  selectedStyleId?: string | null
  isGenerationFailed?: boolean
  generationError?: string | null
  onClearError?: () => void
}

const stages = [
  {
    name: "Preparing",
    range: [0, 10],
    icon: Cpu,
    tip: "Preparing your creative request...",
    emoji: "🔍",
    color: "#8b7355"
  },
  {
    name: "Connecting",
    range: [10, 20],
    icon: Zap,
    tip: "Connecting to AI magic factory...",
    emoji: "🚀",
    color: "#d4a574"
  },
  {
    name: "Creating",
    range: [20, 85],
    icon: Palette,
    tip: "AI is painting your masterpiece...",
    emoji: "🎨",
    color: "#2d3e2d"
  },
  {
    name: "Polishing",
    range: [85, 95],
    icon: Sparkles,
    tip: "Adding final magic touches...",
    emoji: "✨",
    color: "#8b7355"
  },
  {
    name: "Complete!",
    range: [95, 100],
    icon: CheckCircle,
    tip: "Your masterpiece is born!",
    emoji: "🎉",
    color: "#2d3e2d"
  }
]

export default function RenderProgress({ progress, generatedImages, selectedStyleId, isGenerationFailed, generationError, onClearError }: RenderProgressProps) {
  // 状态管理
  const [selectedStyleData, setSelectedStyleData] = useState<any>(null)
  const [stylePreviewImages, setStylePreviewImages] = useState<any[]>([])
  const [isLoadingStyleData, setIsLoadingStyleData] = useState(false)
  const [showGameModal, setShowGameModal] = useState(false)
  const [showGameReminder, setShowGameReminder] = useState(false)
  const [gameReminderDismissed, setGameReminderDismissed] = useState(false)
  const [gameTimerStarted, setGameTimerStarted] = useState(false)

  // 获取选中风格的数据和示例图片
  useEffect(() => {
    const fetchStyleData = async () => {
      console.log('🎨 [RenderProgress] Starting fetchStyleData, selectedStyleId:', selectedStyleId)
      
      if (!selectedStyleId) {
        console.log('🎨 [RenderProgress] No selectedStyleId, using default preview images')
        // 如果没有选中风格，使用默认示例图片
        setStylePreviewImages([
          {
            url: "/api/placeholder/200/200",
            style: "Miniature Style",
            prompt: "cute diorama scene"
          },
          {
            url: "/api/placeholder/200/200", 
            style: "Chibi Art",
            prompt: "kawaii character design"
          },
          {
            url: "/api/placeholder/200/200",
            style: "Tilt-shift Effect", 
            prompt: "aerial miniature world"
          },
          {
            url: "/api/placeholder/200/200",
            style: "Vibrant Colors",
            prompt: "colorful artistic scene"
          }
        ])
        return
      }

      try {
        setIsLoadingStyleData(true)
        console.log('🎨 [RenderProgress] Loading style data...')
        
        // 获取选中风格的详细信息
        const styleResponse = await fetch(`/api/styles`)
        const styleData = await styleResponse.json()
        console.log('🎨 [RenderProgress] Style API response:', styleData)
        
        const selectedStyle = styleData.styles?.find((style: any) => style.id === selectedStyleId)
        console.log('🎨 [RenderProgress] Selected style found:', selectedStyle)
        
        if (selectedStyle) {
          setSelectedStyleData(selectedStyle)
          
          // 获取该风格的示例图片（从画廊中筛选）
          const galleryUrl = `/api/gallery/public?style=${encodeURIComponent(selectedStyle.name)}&limit=4&optimize=true`
          console.log('🎨 [RenderProgress] Fetching gallery images from:', galleryUrl)
          console.log('🎨 [RenderProgress] Selected style name:', selectedStyle.name)
          
          const galleryResponse = await fetch(galleryUrl)
          const galleryData = await galleryResponse.json()
          console.log('🎨 [RenderProgress] Gallery API response:', galleryData)
          console.log('🎨 [RenderProgress] Gallery API response type:', typeof galleryData)
          console.log('🎨 [RenderProgress] Gallery API response keys:', Object.keys(galleryData))
          
          if (galleryData.images && galleryData.images.length > 0) {
            console.log(`🎨 [RenderProgress] Found ${galleryData.images.length} style-matching images`)
            // 随机选择4张图片
            const shuffled = galleryData.images.sort(() => 0.5 - Math.random())
            const selectedImages = shuffled.slice(0, 4).map((img: any) => ({
              url: img.url,
              style: selectedStyle.name,
              prompt: img.prompt || "Creative artwork",
              id: img.id
            }))
            console.log('🎨 [RenderProgress] Selected preview images:', selectedImages)
            setStylePreviewImages(selectedImages)
          } else {
            console.log('🎨 [RenderProgress] No matching style images found, trying to get any gallery images as fallback')
            
            // 如果没有找到该风格的图片，尝试获取任意画廊图片作为备用
            try {
              const fallbackResponse = await fetch('/api/gallery/public?limit=4&optimize=true')
              const fallbackData = await fallbackResponse.json()
              console.log('🎨 [RenderProgress] Fallback gallery response:', fallbackData)
              
              if (fallbackData.images && fallbackData.images.length > 0) {
                console.log('🎨 [RenderProgress] Using fallback gallery images')
                const fallbackImages = fallbackData.images.slice(0, 4).map((img: any) => ({
                  url: img.url,
                  style: img.style || selectedStyle.name,
                  prompt: img.prompt || "Gallery artwork",
                  id: img.id
                }))
                setStylePreviewImages(fallbackImages)
              } else {
                console.log('🎨 [RenderProgress] No gallery images available, using placeholder images')
                // 最后的备用方案：使用占位符图片
                setStylePreviewImages([
                  {
                    url: selectedStyle.image_url || "/api/placeholder/200/200",
                    style: selectedStyle.name,
                    prompt: selectedStyle.description || "Creative artwork"
                  },
                  {
                    url: "/api/placeholder/200/200",
                    style: selectedStyle.name,
                    prompt: selectedStyle.description || "Creative artwork"
                  },
                  {
                    url: "/api/placeholder/200/200",
                    style: selectedStyle.name,
                    prompt: selectedStyle.description || "Creative artwork"
                  },
                  {
                    url: "/api/placeholder/200/200",
                    style: selectedStyle.name,
                    prompt: selectedStyle.description || "Creative artwork"
                  }
                ])
              }
            } catch (fallbackError) {
              console.error('🎨 [RenderProgress] Error fetching fallback images:', fallbackError)
              // 使用占位符图片
              setStylePreviewImages([
                {
                  url: selectedStyle.image_url || "/api/placeholder/200/200",
                  style: selectedStyle.name,
                  prompt: selectedStyle.description || "Creative artwork"
                },
                {
                  url: "/api/placeholder/200/200",
                  style: selectedStyle.name,
                  prompt: selectedStyle.description || "Creative artwork"
                },
                {
                  url: "/api/placeholder/200/200",
                  style: selectedStyle.name,
                  prompt: selectedStyle.description || "Creative artwork"
                },
                {
                  url: "/api/placeholder/200/200",
                  style: selectedStyle.name,
                  prompt: selectedStyle.description || "Creative artwork"
                }
              ])
            }
          }
        } else {
          console.log('🎨 [RenderProgress] Selected style not found in styles list')
        }
      } catch (error) {
        console.error('🎨 [RenderProgress] Error fetching style data:', error)
        // 出错时使用默认示例
        setStylePreviewImages([
          {
            url: "/api/placeholder/200/200",
            style: "Creative Art",
            prompt: "Amazing artwork"
          },
          {
            url: "/api/placeholder/200/200",
            style: "Creative Art", 
            prompt: "Beautiful creation"
          },
          {
            url: "/api/placeholder/200/200",
            style: "Creative Art",
            prompt: "Stunning design"
          },
          {
            url: "/api/placeholder/200/200",
            style: "Creative Art",
            prompt: "Artistic masterpiece"
          }
        ])
      } finally {
        setIsLoadingStyleData(false)
        console.log('🎨 [RenderProgress] Finished loading style data')
      }
    }

    fetchStyleData()
  }, [selectedStyleId])

  // 重置游戏提醒状态 - 当progress重置为0时（新的生图开始）
  useEffect(() => {
    if (progress === 0) {
      console.log('🎮 Resetting game reminder states - new generation started')
      setShowGameReminder(false)
      setGameReminderDismissed(false)
      setGameTimerStarted(false)
    }
  }, [progress])

  // 游戏提醒逻辑 - 进入等待界面1秒后显示提醒
  useEffect(() => {
    // 当progress第一次>0时启动1秒计时器，只启动一次
    if (progress > 0 && progress < 95 && !gameReminderDismissed && !gameTimerStarted) {
      console.log('🎮 Starting game reminder timer - 1 second from now')
      setGameTimerStarted(true)
      
      const timer = setTimeout(() => {
        console.log('🎮 Showing game reminder after 1 second')
        setShowGameReminder(true)
      }, 1000) // 1秒后显示提醒
      
      return () => clearTimeout(timer)
    }
  }, [progress, gameReminderDismissed, gameTimerStarted])

  // 添加调试日志
  console.log('🐛 RenderProgress props:', {
    progress,
    isGenerationFailed,
    generationError,
    hasGeneratedImages: generatedImages?.length || 0,
    showGameReminder,
    gameReminderDismissed,
    gameTimerStarted
  })

  // 如果生成失败，显示错误界面
  if (isGenerationFailed && generationError) {
    console.log('🐛 Showing error interface for:', generationError)
    return (
      <div className="w-full max-w-3xl mx-auto p-8 space-y-8">
        {/* 错误标题 */}
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">❌</div>
          <h2 className="text-3xl font-bold text-red-600" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            Oops! Generation Failed
          </h2>
          <p className="text-lg text-gray-600">Something went wrong during the creation process</p>
        </div>

        {/* 错误详情 */}
        <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200 transform rotate-0.5 hover:-rotate-0.5 transition-all duration-300 relative">
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-400 rounded-full border-2 border-white shadow-sm"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-sm"></div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-red-100 text-red-600 text-2xl shadow-lg flex-shrink-0">
              🚨
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-700 mb-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Error Details
              </h3>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <p className="text-red-800 font-medium break-words">
                  {generationError.includes('polling timeout') || generationError.includes('polling failed') ? 
                    '⏱️ The AI service is taking longer than expected to respond. This usually means the servers are busy. Please try again in a few moments.' :
                    generationError.includes('KIE.AI image generation started') ?
                    '🔄 Your image generation has started but we lost connection with the server. Your image may still be processing. Please wait a few minutes and try generating again.' :
                    generationError
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 解决建议 */}
        <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 transform -rotate-0.5 hover:rotate-0.5 transition-all duration-300 relative">
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-sm"></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
          
          <h3 className="text-xl font-bold text-blue-700 mb-4 text-center" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            💡 What you can try:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-blue-600 text-lg mb-2">🔧 Technical Issues</div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your internet connection</li>
                <li>• Try refreshing the page</li>
                <li>• Wait a moment and try again</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-blue-600 text-lg mb-2">✏️ Prompt Issues</div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Simplify your description</li>
                <li>• Try different keywords</li>
                <li>• Choose a different style</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 大大的X关闭按钮 */}
        <div className="text-center">
          <button
            onClick={onClearError}
            className="group relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-white"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            {/* 装饰圆环 */}
            <div className="absolute inset-2 rounded-full border-2 border-white/30 animate-pulse"></div>
            
            {/* X图标 */}
            <div className="text-white text-6xl font-black group-hover:rotate-90 transition-transform duration-300">
              ✕
            </div>
            
            {/* 悬停文本 */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap">
                Click to try again! 🔄
              </div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800 mx-auto"></div>
            </div>
          </button>
        </div>
        
        {/* 底部提示 */}
        <div className="text-center p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl border border-gray-300">
          <p className="text-gray-700 font-medium" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            Don't worry! Even the best AI artists have creative blocks sometimes. 
            <br />
            <span className="text-blue-600 font-bold">Click the X above to return and try again! 🎨</span>
          </p>
        </div>
      </div>
    )
  }

  // 如果生成完成并有图片，显示结果
  if (progress >= 100 && generatedImages && generatedImages.length > 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-[#2d3e2d]">
            <CheckCircle className="w-8 h-8 text-green-500" />
            Generation Complete!
          </div>
          <p className="text-gray-600 text-lg">Your AI artwork has been created</p>
        </div>
        

      </div>
    )
  }

  // 进度显示界面
  const currentStage = stages.find(stage => 
    progress >= stage.range[0] && progress <= stage.range[1]
  ) || stages[0]
  
  const stageProgress = Math.max(0, Math.min(100, 
    ((progress - currentStage.range[0]) / (currentStage.range[1] - currentStage.range[0])) * 100
  ))

  const estimatedTimeLeft = Math.max(0, Math.round((100 - progress) * 0.8)) // 估算剩余秒数

  return (
    <div className="w-full max-w-3xl mx-auto p-8 space-y-8">
      {/* 主标题 */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
          🎨 AI is Creating Your Artwork
        </h2>
        <p className="text-lg text-gray-600">Please wait, magic is happening...</p>
      </div>

      {/* 整体进度条 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold text-[#2d3e2d]">
            Progress: {Math.round(progress)}%
          </span>
          <span className="text-sm text-[#8b7355] font-bold flex items-center gap-1" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            <Clock className="w-4 h-4" />
            Est. {estimatedTimeLeft}s remaining
          </span>
        </div>
        
        <div className="relative transform -rotate-0.5 hover:rotate-0.5 transition-all duration-300">
          <Progress 
            value={progress} 
            className="h-4"
          />
        </div>
      </div>

      {/* 当前阶段详情 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#8b7355]/20 transform rotate-0.5 hover:-rotate-0.5 transition-all duration-300 relative">
        {/* 装饰性圆点 */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#d4a574] rounded-full border-2 border-white shadow-sm"></div>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#8b7355] rounded-full border-2 border-white shadow-sm"></div>
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="p-3 rounded-full text-white text-2xl shadow-lg"
            style={{ backgroundColor: currentStage.color }}
          >
            {currentStage.emoji}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#2d3e2d] mb-1">
              {currentStage.name}
            </h3>
            <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              {currentStage.tip}
            </p>
          </div>
          <div className="text-2xl font-bold text-[#2d3e2d]">
            {Math.round(stageProgress)}%
          </div>
        </div>
        
        {/* 阶段进度条 */}
        <div className="space-y-2">
          <div className="text-sm text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>Current Stage Progress</div>
          <div className="transform rotate-0.5 hover:-rotate-0.5 transition-all duration-300">
            <Progress 
              value={stageProgress} 
              className="h-3"
            />
          </div>
        </div>
      </div>

      {/* 阶段指示器 */}
      <div className="flex justify-between items-center py-4">
        {stages.map((stage, index) => {
          const isCompleted = progress > stage.range[1]
          const isCurrent = progress >= stage.range[0] && progress <= stage.range[1]
          const StageIcon = stage.icon
          
          return (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div 
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-[#4a5a4a] text-white shadow-lg' : 
                    isCurrent ? 'bg-[#d4a574] text-white shadow-lg animate-pulse' : 
                    'bg-[#f5f1e8] border-2 border-[#8b7355]/30 text-[#8b7355]'}
                `}
              >
                {isCompleted ? 
                  <CheckCircle className="w-6 h-6" /> : 
                  <StageIcon className="w-6 h-6" />
                }
              </div>
              <div className="text-center">
                <div className={`text-sm font-bold ${
                  isCurrent ? 'text-[#2d3e2d]' : 'text-[#8b7355]'
                }`} style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  {stage.name}
                </div>
                {isCurrent && (
                  <div className="text-xs text-[#8b7355] mt-1">
                    In Progress...
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 动态提示 */}
      <div className="text-center p-4 bg-gradient-to-r from-[#8b7355]/10 to-[#d4a574]/10 rounded-xl transform rotate-0.5 hover:-rotate-0.5 transition-all duration-300 relative border border-[#8b7355]/20">
        {/* 装饰性圆点 */}
        <div className="absolute -top-1 left-2 w-2 h-2 bg-[#d4a574] rounded-full"></div>
        <div className="absolute -bottom-1 right-2 w-2 h-2 bg-[#8b7355] rounded-full"></div>
        <div className="text-[#2d3e2d] font-medium">
          {progress < 20 ? "🔮 Analyzing your creative vision..." :
           progress < 50 ? "🎨 AI artist is painting with creativity..." :
           progress < 80 ? "✨ Adding beautiful details..." :
           progress < 95 ? "🎯 Applying final touches..." :
           "🎉 Your masterpiece is almost ready!"}
        </div>
      </div>



      {/* 游戏弹窗 */}
      {showGameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowGameModal(false)}
              className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold transition-all duration-200 shadow-lg transform hover:scale-110"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              ✕
            </button>
            
            {/* 游戏组件 */}
            <WaitingGame 
              onGameComplete={(score) => {
                console.log('🎉 Game completed with score:', score)
                // 可以在这里添加完成奖励或提示
              }}
              isVisible={true}
            />
          </div>
        </div>
      )}

      {/* 风格预览区域 - 只在生图过程中显示画廊相同风格图片 */}
      {progress < 100 && (selectedStyleData && stylePreviewImages.length > 0 && stylePreviewImages.some(img => img.url && !img.url.includes('placeholder'))) && (
        <div className="bg-gradient-to-r from-[#f5f1e8] to-[#d4a574]/20 rounded-2xl p-6 border-2 border-[#8b7355]/30 transform -rotate-0.5 hover:rotate-0.5 transition-all duration-300 relative">
          {/* 装饰性圆点 */}
          <div className="absolute -top-3 left-4 w-5 h-5 bg-[#d4a574] rounded-full border-2 border-white shadow-sm"></div>
          <div className="absolute -bottom-3 right-4 w-5 h-5 bg-[#8b7355] rounded-full border-2 border-white shadow-sm"></div>
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-[#2d3e2d] mb-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              ✨ You're getting 【{selectedStyleData.name}】 style!
            </h3>
            <div className="text-[#8b7355] font-medium" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              {progress < 30 ? "🎯 AI is understanding your vision, preparing to paint..." :
               progress < 60 ? "🎨 Artist is mixing perfect colors on the palette..." :
               progress < 90 ? "✨ Adding details to bring your artwork to life..." :
               "🎉 Almost done! Your masterpiece is ready!"}
            </div>
          </div>
          
          {/* 图片网格 - 只显示有真实图片的项目 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stylePreviewImages
              .filter(image => image.url && !image.url.includes('placeholder'))
              .map((image, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-3 shadow-lg border-2 border-[#8b7355]/20 transform hover:scale-105 transition-all cursor-pointer hover:shadow-xl"
                onClick={() => {
                  // 如果有具体的图片ID，跳转到图片详情；否则跳转到风格画廊
                  if (image.id) {
                    window.open(`/gallery/${image.id}`, '_blank')
                  } else {
                    window.open(`/gallery?style=${encodeURIComponent(image.style.toLowerCase().replace(/\s+/g, '-'))}`, '_blank')
                  }
                }}
              >
                <div className="aspect-square bg-gradient-to-br from-[#d4a574]/30 to-[#8b7355]/30 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                  <MagicImage 
                    src={image.url} 
                    alt={image.style} 
                    className="w-full h-full rounded-lg"
                    objectFit="cover"
                    loadingMessage="Loading style..."
                    onError={() => {
                      // 图片加载失败时隐藏这个项目
                      const cardElement = document.querySelector(`[data-image-card]`)
                      if (cardElement) {
                        (cardElement as HTMLElement).style.display = 'none'
                      }
                    }}
                  />
                  
                  {/* 悬停提示 */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
                      <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-[#2d3e2d] mb-1" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    {image.style}
                  </p>
                  <p className="text-xs text-[#8b7355]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    Click to explore
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4 p-3 bg-white/80 rounded-xl border border-[#8b7355]/20">
            <p className="text-sm text-[#2d3e2d] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              💡 <strong>Tip</strong>: Your artwork will feature 【{selectedStyleData.name}】 style, {selectedStyleData.description || 'showcasing unique charm'}!
            </p>
          </div>
        </div>
      )}

      {/* 生成完成后显示的图片网格 - 响应式布局，只在100%完成时显示 */}
      {progress >= 100 && generatedImages && generatedImages.length > 0 && (
        <div className={`
          grid gap-4 
          ${generatedImages.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : ''}
          ${generatedImages.length === 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
          ${generatedImages.length >= 4 ? 'grid-cols-2' : ''}
        `}>
          {generatedImages.map((image, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#8b7355]/20 cursor-pointer transform hover:scale-105 transition-all duration-300"
              onClick={() => {
                // 点击放大功能
                window.open(image.url, '_blank')
              }}
            >
              <div className={`
                relative w-full 
                ${generatedImages.length === 1 ? 'h-80 md:h-96' : 'h-48 md:h-64'}
              `}>
                <MagicImage
                  src={image.url}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-full bg-gray-50"
                  objectFit="cover"
                  loadingMessage="Loading masterpiece..."
                  priority
                />
                
                {/* 悬停时显示放大提示 */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-[#2d3e2d] mb-1" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    Image {index + 1}
                  </p>
                  <p className="text-xs text-[#8b7355]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    Click to view
                  </p>
                </div>
                {image.revised_prompt && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600 overflow-hidden" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      <strong>Prompt:</strong> {image.revised_prompt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )          )}
        </div>
      )}

      {/* 浮动游戏提醒 - 屏幕中间显示 */}
      {showGameReminder && !gameReminderDismissed && progress < 95 && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border-4 border-[#2d3e2d] transform scale-100 animate-in zoom-in-50 duration-300 relative overflow-hidden max-w-sm w-full">
            {/* 装饰元素 */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#d4a574] rounded-full border-2 border-white"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#8b7355] rounded-full border-2 border-white"></div>
            
            {/* 关闭按钮 */}
            <button
              onClick={() => {
                console.log('🎮 User dismissed game reminder')
                setShowGameReminder(false)
                setGameReminderDismissed(true)
              }}
              className="absolute top-2 right-2 w-6 h-6 bg-[#8b7355] hover:bg-[#2d3e2d] text-white rounded-full flex items-center justify-center text-xs font-black transition-all duration-200 transform hover:scale-110"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              ✕
            </button>
            
            <div className="text-center pr-6">
              <div className="text-3xl animate-bounce mb-3">🧠</div>
              <h4 className="text-lg font-black text-[#2d3e2d] mb-2 transform -rotate-1" style={{ 
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "1px 1px 0px #d4a574"
              }}>
                Feeling Bored While Waiting?
              </h4>
              <p className="text-sm text-[#8b7355] font-bold mb-4" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Try our fun brain training game to pass the time! 🎮✨
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowGameModal(true)
                    setShowGameReminder(false)
                  }}
                  className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-4 py-3 rounded-xl text-sm transition-all transform hover:scale-105 shadow-lg border-2 border-[#2d3e2d] flex-1"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  🎯 Play Now!
                </button>
                <button
                  onClick={() => {
                    setShowGameReminder(false)
                    setGameReminderDismissed(true)
                  }}
                  className="bg-white hover:bg-[#f5f1e8] text-[#8b7355] font-black px-4 py-3 rounded-xl text-sm transition-all transform hover:scale-105 border-2 border-[#8b7355] flex-1"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  No Thanks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
