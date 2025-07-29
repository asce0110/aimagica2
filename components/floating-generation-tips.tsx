"use client"
import { useEffect, useState } from "react"
import { Coffee, Monitor, Volume2, VolumeX, Clock, Sparkles, Eye, Music, ChevronLeft, ChevronRight } from "lucide-react"
import { getGenerationState, onGenerationStateChange, type GenerationState } from "@/lib/generation-state"
import { useRouter } from "next/navigation"

export default function FloatingGenerationTips() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [generationState, setGenerationState] = useState<GenerationState>({
    isRendering: false,
    renderProgress: 0,
    generatedImages: [],
    textPrompt: '',
    selectedAspectRatio: '1:1',
    selectedStyleId: null,
    selectedStyleName: null,
    currentStep: 'create',
    startTime: null
  })
  
  const [isClient, setIsClient] = useState(false)

  // 客户端挂载时同步状态
  useEffect(() => {
    setIsClient(true)
    // 同步客户端状态
    setGenerationState(getGenerationState())
  }, [])

  // 监听全局状态变化
  useEffect(() => {
    if (!isClient) return
    
    const cleanup = onGenerationStateChange((state) => {
      setGenerationState(state)
    })
    return cleanup
  }, [isClient])

  const tips = [
    {
      icon: Coffee,
      title: "☕ 放松一下",
      content: "现在是喝杯咖啡的好时候！AI正在为您精心创作中...",
      color: "#8b7355"
    },
    {
      icon: Monitor,
      title: "💻 做点别的",
      content: "您可以切换到其他标签页，AI完成后会有音效提示哦！",
      color: "#d4a574"
    },
    {
      icon: Eye,
      title: "👀 预览风格",
      content: "不妨点击下面的风格预览图片，探索更多精美作品！",
      color: "#2d3e2d"
    },
    {
      icon: Music,
      title: "🎵 即将完成",
      content: "马上就好了！完成时会播放愉快的音效通知您～",
      color: "#8b7355"
    }
  ]

  // 根据进度切换提示
  useEffect(() => {
    if (!generationState.isRendering) return

    let tipIndex = 0
    if (generationState.renderProgress < 25) tipIndex = 0
    else if (generationState.renderProgress < 50) tipIndex = 1  
    else if (generationState.renderProgress < 80) tipIndex = 2
    else tipIndex = 3

    setCurrentTipIndex(tipIndex)
  }, [generationState.renderProgress, generationState.isRendering])

  // 只在客户端且正在渲染时显示
  if (!isClient || !generationState.isRendering) return null

  const currentTip = tips[currentTipIndex]
  const TipIcon = currentTip.icon

  // 点击回到生图界面
  const handleBackToGeneration = () => {
    router.push('/')
  }

  return (
    <div 
      className={`
        fixed top-1/2 right-0 transform -translate-y-1/2 z-40
        transition-all duration-300 ease-in-out
        ${isHovered ? 'translate-x-0' : 'translate-x-64'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
             {/* 展开的内容面板 - 简化版 */}
       <div 
         className="bg-white rounded-l-2xl shadow-2xl border-2 border-[#2d3e2d] border-r-0 w-72 cursor-pointer hover:bg-[#f5f1e8] transition-all"
         onClick={handleBackToGeneration}
       >
         {/* 标题栏 */}
         <div 
           className="p-3 relative rounded-tl-2xl"
           style={{ backgroundColor: currentTip.color }}
         >
           <div className="absolute -top-1 -left-1 w-4 h-4 bg-[#d4a574] rounded-full animate-pulse"></div>
           <div className="flex items-center justify-between">
             <h3
               className="text-base font-black text-[#f5f1e8] transform rotate-1"
               style={{
                 fontFamily: "Fredoka One, Arial Black, sans-serif",
                 textShadow: "1px 1px 0px rgba(0,0,0,0.3)",
               }}
             >
               ✨ AI生图进行中
             </h3>
             
             <div className="text-white/80 text-sm font-bold">
               点击回到生图
             </div>
           </div>
         </div>

         {/* 简化的进度显示 */}
         <div className="p-4">
           <div className="bg-gradient-to-r from-[#f5f1e8] to-[#d4a574]/20 rounded-xl p-3 border border-[#8b7355]/20">
             <div className="flex items-center gap-2 mb-2">
               <Clock className="w-4 h-4 text-[#8b7355]" />
               <span 
                 className="text-sm font-bold text-[#2d3e2d]"
                 style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
               >
                 生成进度：{Math.round(generationState.renderProgress)}%
               </span>
             </div>
             
             <div className="w-full bg-white rounded-full h-3 shadow-inner">
               <div 
                 className="h-3 rounded-full transition-all duration-300 shadow-sm"
                 style={{
                   width: `${generationState.renderProgress}%`,
                   background: `linear-gradient(90deg, ${currentTip.color}, #d4a574)`
                 }}
               />
             </div>
             
             <div className="mt-2 text-center">
               <p 
                 className="text-xs text-[#8b7355] font-medium"
                 style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
               >
                 {generationState.renderProgress < 30 ? "🎯 AI正在理解您的创意..." :
                  generationState.renderProgress < 60 ? "🎨 正在绘制精美作品..." :
                  generationState.renderProgress < 90 ? "✨ 添加最后的魔法细节..." :
                  "🎉 马上就完成了！"}
               </p>
             </div>
           </div>
         </div>
       </div>

      {/* 侧边触发按钮 */}
      <div 
        className={`
          absolute top-1/2 -left-12 transform -translate-y-1/2
          bg-white rounded-l-xl shadow-lg border-2 border-[#2d3e2d] border-r-0
          p-3 cursor-pointer transition-all duration-300
          ${isHovered ? 'bg-[#d4a574]' : 'bg-white hover:bg-[#f5f1e8]'}
        `}
        style={{ backgroundColor: isHovered ? currentTip.color : '' }}
      >
        <div className="flex flex-col items-center gap-2">
          {/* 动态图标 */}
          <div 
            className={`p-2 rounded-full transition-all duration-300 ${
              isHovered ? 'text-white' : 'text-[#2d3e2d]'
            }`}
          >
            <TipIcon className="w-5 h-5" />
          </div>
          
          {/* 箭头指示 */}
          <div className={`transition-all duration-300 ${
            isHovered ? 'text-white' : 'text-[#8b7355]'
          }`}>
            {isHovered ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4 animate-pulse" />
            )}
          </div>
          
          {/* 进度环 */}
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="12"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className={isHovered ? 'text-white/30' : 'text-gray-300'}
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                                 strokeDasharray={`${generationState.renderProgress * 0.75} 100`}
                className={isHovered ? 'text-white' : 'text-[#d4a574]'}
                style={{ transition: 'stroke-dasharray 0.3s ease' }}
              />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
              isHovered ? 'text-white' : 'text-[#2d3e2d]'
            }`}>
              {Math.round(generationState.renderProgress)}%
            </div>
          </div>
        </div>
      </div>

      {/* 装饰性动画元素 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-1 h-1 bg-[#d4a574]/30 rounded-full
              transition-all duration-2000 animate-ping
            `}
            style={{
              left: `${20 + i * 30}%`,
              top: `${20 + (i % 2) * 60}%`,
              animationDelay: `${i * 700}ms`
            }}
          />
        ))}
      </div>
    </div>
  )
} 