"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Crown, Sparkles, Lock, Grid3x3, X } from "lucide-react"

// 风格数据类型
interface StyleModel {
  id: string
  name: string
  description: string
  emoji: string
  image_url: string
  prompt_template: string
  default_prompt?: string | null
  type: 'image' | 'video' | 'both'
  category: 'photographic-realism' | 'illustration-digital-painting' | 'anime-comics' | 'concept-art' | '3d-render' | 'abstract' | 'fine-art-movements' | 'technical-scientific' | 'architecture-interior' | 'design-commercial' | 'genre-driven' | 'vintage-retro'
  is_premium: boolean
  is_active: boolean
  sort_order: number
  // 新增的限制条件字段
  requires_image_upload?: boolean
  requires_prompt_description?: boolean
  prohibits_image_upload?: boolean // 新增：禁止图片上传
  min_prompt_length?: number
  max_prompt_length?: number
  allowed_image_formats?: string[]
  requirements_description?: string | null
  created_at: string
  updated_at: string
}

interface StyleSelectorProps {
  onStyleSelect?: (styleId: string | null, styleName?: string, styleData?: StyleModel | null) => void
  selectedStyleId?: string | null
}

export default function StyleSelector({ onStyleSelect, selectedStyleId }: StyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(selectedStyleId || null)
  const [styles, setStyles] = useState<StyleModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"standard" | "premium">("standard")
  const [hasStarted, setHasStarted] = useState(false) // 标记是否已开始加载
  const [showMoreDialog, setShowMoreDialog] = useState(false) // 弹窗状态
  const [maxDisplayStyles] = useState(10) // 默认显示10个风格（除了"No Style"）

  // 获取风格要求文本的辅助函数 - 保持风格选择器干净
  const getStyleRequirementsText = (style: StyleModel): string => {
    // 完全移除所有要求文本显示，保持风格卡片干净简洁
    return ''
  }

  // 加载风格数据
  const loadStyles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🎨 Loading styles...')
      
      // 尝试从API加载，失败时fallback到静态JSON
      let response = await fetch('/api/styles?type=image')
      console.log('📡 API Response status:', response.status)
      
      if (response.ok) {
        try {
          const data = await response.json()
          console.log('📊 API Response data:', data)
          setStyles(data.styles || [])
          console.log('✅ Styles loaded from API:', data.styles?.length || 0)
          return
        } catch (parseError) {
          console.warn('API response not JSON, trying static fallback')
          throw new Error('Invalid JSON response')
        }
      } else {
        throw new Error(`API responded with status ${response.status}`)
      }
      
    } catch (err) {
      console.warn('Primary API failed, trying static fallback:', err)
      
      // Fallback to static JSON
      try {
        const fallbackResponse = await fetch('/api/styles.json')
        const fallbackData = await fallbackResponse.json()
        setStyles(fallbackData.styles || [])
        console.log('✅ Styles loaded from static fallback:', fallbackData.styles?.length || 0)
        setError(null) // 清除错误状态
      } catch (fallbackError) {
        console.error('Both API and fallback failed:', fallbackError)
        setError('Failed to load styles')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 组件挂载时立即开始加载
  useEffect(() => {
    setHasStarted(true)
    loadStyles()
  }, [])

  // 更新选中的风格
  useEffect(() => {
    console.log('🎨 StyleSelector: selectedStyleId prop changed:', selectedStyleId)
    setSelectedStyle(selectedStyleId || null)
  }, [selectedStyleId])

  // 处理风格选择
  const handleStyleSelect = (styleId: string | null, styleName?: string, styleData?: StyleModel | null) => {
    setSelectedStyle(styleId)
    onStyleSelect?.(styleId, styleName, styleData)
    setShowMoreDialog(false) // 选择后关闭弹窗
  }

  // 渲染风格卡片的通用函数
  const renderStyleCard = (style: StyleModel, isPremium = false) => {
    const requirementsText = getStyleRequirementsText(style)
    
    return (
      <Card
        key={style.id}
        className={`cursor-pointer transition-all duration-200 border-2 md:border-3 ${
          selectedStyle === style.id
            ? "border-[#2d3e2d] bg-[#d4a574] transform scale-105 rotate-1"
            : "border-[#8b7355] bg-white hover:border-[#2d3e2d] hover:bg-[#f5f1e8] transform hover:scale-105"
        } rounded-lg md:rounded-xl shadow-md overflow-hidden ${isPremium ? 'opacity-80' : ''} relative`}
        onClick={() => handleStyleSelect(style.id, style.name, style)}
      >
        {/* 要求标识 */}
        {requirementsText && (
          <div className="absolute top-1 right-1 z-10">
            <div className="bg-[#d4a574] text-[#2d3e2d] text-xs font-bold px-1 py-0.5 rounded-md border border-[#8b7355]" 
                 style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              ⚙️
            </div>
          </div>
        )}
        
        <CardContent className="p-2 md:p-3 text-center">
          <div className="w-full aspect-square mb-1 md:mb-2 rounded-lg overflow-hidden border-2 border-[#8b7355]/30">
            {style.image_url ? (
              <img
                src={style.image_url}
                alt={`${style.name} style example`}
                className={`w-full h-full object-cover object-center scale-110 transition-transform duration-300 hover:scale-125 ${isPremium ? 'grayscale' : ''}`}
                style={{
                  imageRendering: 'crisp-edges',
                  filter: 'contrast(1.1) brightness(1.05) saturate(1.1)'
                }}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br from-[#8b7355] to-[#2d3e2d] flex items-center justify-center text-white text-lg ${isPremium ? 'grayscale' : ''}`}>
                {style.emoji}
              </div>
            )}
          </div>
          <h4
            className="text-[#2d3e2d] font-black text-xs leading-tight mb-1"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            {style.name.toUpperCase()}
          </h4>
          
          {/* 要求信息 */}
          {requirementsText && (
            <div className="text-xs text-[#8b7355] font-bold leading-tight" 
                 style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              {requirementsText}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // 分离免费和付费风格
  const freeStyles = styles.filter(style => !style.is_premium && style.is_active)
  const premiumStyles = styles.filter(style => style.is_premium && style.is_active)
  
  // 分离显示的和隐藏的免费风格
  const displayedFreeStyles = freeStyles.slice(0, maxDisplayStyles)
  const hiddenFreeStyles = freeStyles.slice(maxDisplayStyles)
  const hasMoreStyles = freeStyles.length > maxDisplayStyles

  console.log('🔍 Render state:', { hasStarted, isLoading, error, stylesCount: styles.length })

  // 如果还没开始加载或正在加载，显示loading状态
  if (!hasStarted || isLoading) {
    return (
      <div className="space-y-3 md:space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b7355] mx-auto mb-4"></div>
          <p 
            className="text-[#8b7355] font-bold"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            Loading styles... 🎨
          </p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="space-y-3 md:space-y-4">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <p 
            className="text-red-600 font-bold mb-4"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            {error}
          </p>
          <Button
            onClick={loadStyles}
            className="bg-[#8b7355] hover:bg-[#4a5a4a] text-white font-black px-4 py-2 rounded-xl transform hover:scale-105 transition-all"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            🔄 Try Again
          </Button>
        </div>
      </div>
    )
  }

  // 无数据状态
  if (styles.length === 0) {
    return (
      <div className="space-y-3 md:space-y-4">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-[#d4a574] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[#2d3e2d] text-2xl">🎨</span>
          </div>
          <p 
            className="text-[#8b7355] font-bold mb-4"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            No styles configured yet
          </p>
          <p 
            className="text-[#8b7355] text-sm mb-4"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            Initialize the styles table with sample data or add your first style manually.
          </p>
          <Button
            onClick={loadStyles}
            className="bg-[#8b7355] hover:bg-[#4a5a4a] text-white font-black px-4 py-2 rounded-xl transform hover:scale-105 transition-all"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            🔄 Refresh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <Tabs value={mode} onValueChange={(value) => setMode(value as "standard" | "premium")}>
        <TabsList className="grid w-full grid-cols-2 bg-[#4a5a4a] rounded-xl md:rounded-2xl p-1 md:p-2 shadow-lg">
          <TabsTrigger
            value="standard"
            className="rounded-lg md:rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm py-2"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            STANDARD STYLES
          </TabsTrigger>
          <TabsTrigger
            value="premium"
            className="rounded-lg md:rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm py-2"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            PREMIUM STYLES
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4 md:space-y-6">
          <div>
            <h3
              className="text-[#2d3e2d] font-black text-base md:text-lg mb-2 md:mb-3 flex items-center transform rotate-1"
              style={{
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "1px 1px 0px #d4a574",
              }}
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              PICK YOUR STYLE! 🎭
            </h3>
            <div className="grid grid-cols-8 gap-2 md:gap-3">
              {/* No Style Option */}
              <Card
                className={`cursor-pointer transition-all duration-200 border-2 md:border-3 ${
                  selectedStyle === null
                    ? "border-[#2d3e2d] bg-[#d4a574] transform scale-105 rotate-1"
                    : "border-[#8b7355] bg-white hover:border-[#2d3e2d] hover:bg-[#f5f1e8] transform hover:scale-105"
                } rounded-lg md:rounded-xl shadow-md overflow-hidden`}
                onClick={() => handleStyleSelect(null, 'No Style', null)}
              >
                <CardContent className="p-2 md:p-3 text-center">
                  <div className="w-full aspect-square mb-1 md:mb-2 rounded-lg overflow-hidden border-2 border-[#8b7355]/30 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl md:text-3xl scale-125">🚫</span>
                  </div>
                  <h4
                    className="text-[#2d3e2d] font-black text-xs leading-tight"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    NO STYLE
                  </h4>

                </CardContent>
              </Card>

              {/* Free Styles - 显示前11个 */}
              {displayedFreeStyles.map((style) => renderStyleCard(style))}
              
              {/* 查看更多按钮 */}
              {hasMoreStyles && (
                <Dialog open={showMoreDialog} onOpenChange={setShowMoreDialog}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer transition-all duration-200 border-2 md:border-3 border-dashed border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-400/70 transform hover:scale-105 rounded-lg md:rounded-xl shadow-md overflow-hidden">
                      <CardContent className="p-2 md:p-3 text-center h-full flex flex-col justify-center">
                        <div className="w-full aspect-square mb-1 md:mb-2 rounded-lg overflow-hidden border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                          <Grid3x3 className="w-8 h-8 md:w-10 md:h-10 text-white scale-125" />
                        </div>
                        <h4
                          className="text-foreground font-black text-xs leading-tight"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          VIEW MORE
                        </h4>
                        <p
                          className="text-muted-foreground font-bold text-xs mt-1"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          +{hiddenFreeStyles.length} styles
                        </p>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden bg-[#f5f1e8] border-4 border-[#8b7355] rounded-2xl">
                    <DialogHeader className="border-b-2 border-[#8b7355]/30 pb-4">
                      <DialogTitle 
                        className="text-[#2d3e2d] font-black text-xl flex items-center"
                        style={{ 
                          fontFamily: "Fredoka One, Arial Black, sans-serif",
                          textShadow: "1px 1px 0px #d4a574"
                        }}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        ALL STYLE OPTIONS! 🎨
                      </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto max-h-[60vh] pr-2">
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 pt-4">
                        {freeStyles.map((style) => renderStyleCard(style))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="premium" className="space-y-4 md:space-y-6">
          <div className="bg-[#f5f1e8] rounded-lg md:rounded-xl border-2 md:border-3 border-[#8b7355] p-3 md:p-4 mb-3 md:mb-4">
            <div className="flex items-center">
              <Crown className="w-4 h-4 md:w-5 md:h-5 text-[#d4a574] mr-1 md:mr-2" />
              <h3
                className="text-[#2d3e2d] font-black text-base md:text-lg transform rotate-1"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "1px 1px 0px #d4a574",
                }}
              >
                PREMIUM STYLES
              </h3>
            </div>
            <p
              className="text-[#8b7355] font-bold text-xs md:text-sm mt-1"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              Unlock these exclusive styles with AIMAGICA PRO! 🌟
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 md:gap-3">
            {premiumStyles.map((style) => (
              <div key={style.id} className="relative">
                <Card
                  className={`cursor-pointer transition-all duration-200 border-2 md:border-3 border-[#8b7355] bg-white hover:border-[#2d3e2d] hover:bg-[#f5f1e8] transform hover:scale-105 rounded-lg md:rounded-xl shadow-md opacity-80 overflow-hidden`}
                >
                  <CardContent className="p-2 md:p-3 text-center">
                    <div className="w-full aspect-square mb-1 md:mb-2 rounded-lg overflow-hidden border-2 border-[#8b7355]/30">
                      {style.image_url ? (
                        <img
                          src={style.image_url}
                          alt={`${style.name} style example`}
                          className="w-full h-full object-cover grayscale"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#8b7355] to-[#2d3e2d] flex items-center justify-center text-white text-lg grayscale">
                          {style.emoji}
                        </div>
                      )}
                    </div>
                    <h4
                      className="text-[#2d3e2d] font-black text-xs leading-tight"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      {style.name.toUpperCase()}
                    </h4>
                  </CardContent>
                </Card>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-[#4a5a4a]/70 rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                    <Lock className="w-3 h-3 md:w-4 md:h-4 text-[#d4a574]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-3 md:mt-4">
            <Button
              className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-lg transform hover:scale-105 transition-all text-xs md:text-sm"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              UPGRADE TO PRO
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      <div className="p-2 md:p-3 bg-[#f5f1e8] rounded-lg md:rounded-xl border-2 md:border-3 border-[#8b7355] shadow-md">
        <h4
          className="text-[#2d3e2d] font-black mb-1 md:mb-2 transform rotate-1 text-sm md:text-base"
          style={{
            fontFamily: "Fredoka One, Arial Black, sans-serif",
            textShadow: "1px 1px 0px #d4a574",
          }}
        >
          YOUR SELECTION PREVIEW! 👀
        </h4>
        <div className="flex items-start space-x-2 md:space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border-2 md:border-3 border-[#8b7355] transform rotate-3 flex-shrink-0">
            <img
              src={styles.find((s) => s.id === selectedStyle)?.image_url || "/placeholder.svg"}
              alt="Style preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[#2d3e2d] font-black text-xs md:text-sm"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              {selectedStyle === null 
                ? "🎨 No Style" 
                : `${styles.find((s) => s.id === selectedStyle)?.emoji} ${styles.find((s) => s.id === selectedStyle)?.name}`
              }
            </p>
            <p className="text-[#8b7355] font-bold text-xs mb-1" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              {selectedStyle === null 
                ? "Original prompt will be used" 
                : styles.find((s) => s.id === selectedStyle)?.description || "AI-enhanced artistic style"
              }
            </p>
            
            {/* 显示风格要求 */}
            {selectedStyle !== null && (() => {
              const selectedStyleData = styles.find((s) => s.id === selectedStyle)
              const requirementsText = selectedStyleData ? getStyleRequirementsText(selectedStyleData) : ''
              
              if (requirementsText) {
                return (
                  <div className="mt-2 p-2 bg-[#d4a574]/20 rounded-lg border border-[#8b7355]/30">
                    <p className="text-xs font-bold text-[#2d3e2d] mb-1" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      ⚙️ 使用要求：
                    </p>
                    <p className="text-xs text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      {requirementsText}
                    </p>
                    {selectedStyleData?.requirements_description && (
                      <p className="text-xs text-[#8b7355] mt-1" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        💡 {selectedStyleData.requirements_description}
                      </p>
                    )}
                  </div>
                )
              }
              return null
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
