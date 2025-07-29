"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, Star, Crown, Sparkles, Image } from "lucide-react"
import useStaticUrl from "@/hooks/use-static-url"

export interface LazyGalleryImageProps {
  id: string | number
  url: string
  title: string
  author: string
  likes: number
  views: number
  isPremium?: boolean
  isFeatured?: boolean
  isLiked?: boolean
  createdAt: string
  size?: 'small' | 'medium' | 'large' | 'vertical' | 'horizontal'
  rotation?: number
  onClick?: () => void
  priority?: boolean  // 是否优先加载（首屏图片）
  waterfallHeight?: number  // 瀑布流指定高度（覆盖size计算）
}

/**
 * 高性能懒加载Gallery图片组件
 * 
 * 特性：
 * 1. Intersection Observer懒加载
 * 2. 渐进式图片加载（模糊->清晰）
 * 3. 错误处理和重试机制
 * 4. 性能优化的动画
 * 5. SEO友好的结构
 */
export default function LazyGalleryImage({
  id,
  url,
  title,
  author,
  likes,
  views,
  isPremium = false,
  isFeatured = false,
  isLiked = false,
  createdAt,
  size = 'medium',
  rotation = 0,
  onClick,
  priority = false,
  waterfallHeight
}: LazyGalleryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority) // 优先图片立即视为可见
  const [hasError, setHasError] = useState(false)
  const [imageHeight, setImageHeight] = useState<number | undefined>()
  
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  
  // 智能URL处理：如果是完整URL则直接使用，否则使用useStaticUrl处理
  const staticUrl = url.startsWith('http') ? url : useStaticUrl(url)

  // 获取图片宽高比 - 移动端和桌面端都按原始比例
  const getAspectRatio = () => {
    if (size === "vertical") return "3/4"
    if (size === "horizontal") return "4/3"
    if (size === "small") return "1/1"
    if (size === "medium") return "4/5"
    if (size === "large") return "3/4"
    return "4/5" // 默认
  }

  // 优化的Intersection Observer懒加载
  useEffect(() => {
    if (priority) return // 优先图片跳过懒加载

    // 立即检查是否在首屏视口内
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
      
      if (isInViewport) {
        setIsInView(true)
        return
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '300px', // 提前300px开始加载，更强的预加载
        threshold: 0.05
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  // 图片加载处理
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageHeight(img.naturalHeight * (img.offsetWidth / img.naturalWidth))
    setIsLoaded(true)
    setHasError(false)
    
    console.log(`✅ Gallery图片加载成功:`, {
      id,
      title,
      url: staticUrl,
      dimensions: `${img.naturalWidth}x${img.naturalHeight}`
    })
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.currentTarget
    console.error(`❌ Gallery图片加载失败:`, {
      id,
      title,
      url: staticUrl,
      naturalWidth: imgElement.naturalWidth,
      naturalHeight: imgElement.naturalHeight,
      complete: imgElement.complete,
      errorType: e.type,
      currentSrc: imgElement.currentSrc,
      error: e
    })
    setHasError(true)
    setIsLoaded(true) // 确保加载状态结束
  }

  // 生成占位符尺寸 - 优先使用瀑布流指定高度
  const getPlaceholderHeight = () => {
    // 如果有瀑布流指定高度，直接使用
    if (waterfallHeight) {
      return waterfallHeight
    }
    
    // 否则按原有逻辑计算
    const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768
    
    if (isMobileView) {
      // 移动端按比例缩小
      const mobileAspectRatios = {
        "vertical": 350,
        "horizontal": 200,
        "small": 250,
        "medium": 300,
        "large": 380
      }
      return mobileAspectRatios[size] || 300
    }
    
    // 桌面端保持原有高度
    const desktopAspectRatios = {
      "vertical": 400,
      "horizontal": 225,
      "small": 300,
      "medium": 375,
      "large": 450
    }
    
    return desktopAspectRatios[size] || 375
  }

  return (
    <motion.div
      ref={containerRef}
      className="break-inside-avoid mb-4 relative cursor-pointer"
      onClick={onClick}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
      whileHover={{
        scale: 1.03,
        zIndex: 10,
        rotate: 0,
        transition: { duration: 0.2 },
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="group overflow-hidden bg-white/60 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-0">
          {/* 图片容器 - 白边框效果 */}
          <div className="w-full relative bg-white rounded-md p-1">
            <div 
              className="w-full bg-white rounded-sm overflow-hidden relative"
              style={{
                // 瀑布流模式：使用指定高度，非瀑布流模式：使用aspectRatio
                ...(waterfallHeight 
                  ? { height: getPlaceholderHeight() }
                  : { aspectRatio: getAspectRatio(), minHeight: getPlaceholderHeight() }
                )
              }}
            >
              {/* 魔法加载占位符 - 与Hero区域相同的效果 */}
              {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#f5f1e8] to-[#ebe5d6] flex items-center justify-center">
                  <div className="text-center">
                    {/* 迷你魔法光环 */}
                    <div className="relative w-12 h-12 mx-auto mb-2">
                      <div className="absolute inset-0 rounded-full border-2 border-[#d4a574]/40 animate-spin"></div>
                      <div className="absolute inset-1 rounded-full border-2 border-[#8b7355]/60 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#8b7355] animate-pulse" />
                      </div>
                      {/* 迷你魔法粒子 */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#d4a574] rounded-full animate-ping"></div>
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#8b7355] rounded-full animate-ping delay-300"></div>
                      <div className="absolute top-1 -left-1 w-1.5 h-1.5 bg-[#d4a574]/80 rounded-full animate-ping delay-500"></div>
                      <div className="absolute -bottom-1 right-1 w-1.5 h-1.5 bg-[#8b7355]/80 rounded-full animate-ping delay-700"></div>
                    </div>
                    <div 
                      className="text-sm text-[#8b7355] font-bold"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {isInView ? '✨ Casting...' : '🔮 Waiting...'}
                    </div>
                  </div>
                </div>
              )}

              {/* 魔法错误状态 - 保持一致的设计风格 */}
              {hasError && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#f5f1e8] to-[#e1d4c0] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-[#d4a574]/30 to-[#8b7355]/30 rounded-lg border-2 border-dashed border-[#8b7355]/40 flex items-center justify-center transform rotate-12">
                      <Image className="w-6 h-6 text-[#8b7355]/60" />
                    </div>
                    <div 
                      className="text-sm text-[#8b7355]/80 font-bold mb-1"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      🔮 Magic Failed
                    </div>
                    <button 
                      className="text-xs text-[#8b7355] font-medium hover:text-[#6b5d3f] transition-colors px-2 py-1 rounded bg-[#d4a574]/20 hover:bg-[#d4a574]/30"
                      onClick={(e) => {
                        e.stopPropagation()
                        setHasError(false)
                        setIsLoaded(false)
                        setIsInView(true)
                      }}
                    >
                      Try Again ✨
                    </button>
                  </div>
                </div>
              )}

              {/* 实际图片 */}
              {isInView && !hasError && (
                <img
                  ref={imgRef}
                  src={staticUrl}
                  alt={title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading={priority ? "eager" : "lazy"}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  fetchPriority={priority ? 'high' : 'auto'}
                  decoding="async"
                />
              )}
              
              {/* 悬停覆盖层 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 md:p-3 z-10">
                <h3 className="text-white font-bold text-xs md:text-sm mb-1 line-clamp-2">
                  {title}
                </h3>
                <p className="text-gray-300 text-xs line-clamp-1">
                  by {author}
                </p>
              </div>

              {/* 标签 */}
              <div className="absolute top-2 left-2 flex gap-1 z-20">
                {isFeatured && (
                  <Badge variant="secondary" className="text-xs bg-yellow-500/80 text-white">
                    <Star className="h-3 w-3" />
                  </Badge>
                )}
                {isPremium && (
                  <Badge variant="secondary" className="text-xs bg-purple-500/80 text-white">
                    <Crown className="h-3 w-3" />
                  </Badge>
                )}
              </div>

              {/* 统计信息 */}
              <div className="absolute bottom-1 md:bottom-2 right-1 md:right-2 flex items-center gap-1 md:gap-2 text-white text-xs z-20">
                <div className="flex items-center gap-1 bg-black/50 rounded px-1.5 md:px-2 py-0.5 md:py-1 backdrop-blur-sm">
                  <Heart className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  <span className="text-xs md:text-xs">
                    {likes > 1000 ? `${(likes / 1000).toFixed(1)}k` : likes}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-black/50 rounded px-1.5 md:px-2 py-0.5 md:py-1 backdrop-blur-sm">
                  <Eye className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  <span className="text-xs md:text-xs">
                    {views > 1000 ? `${(views / 1000).toFixed(1)}k` : views}
                  </span>
                </div>
              </div>

              {/* 喜欢标记 */}
              {isLiked && (
                <div className="absolute bottom-2 left-2 z-20">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 图片下方的时间信息 */}
      <div className="mt-2 flex justify-center">
        <span className="text-xs text-gray-500 font-medium">
          {createdAt}
        </span>
      </div>
    </motion.div>
  )
}