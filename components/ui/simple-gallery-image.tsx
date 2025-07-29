"use client"

import { useState, useMemo, useEffect } from "react"
import { optimizeImageUrl, getOptimalImageSize, generateImageSrcSet } from "@/lib/image-optimizer"
import { Sparkles, Image } from "lucide-react"

interface SimpleGalleryImageProps {
  src: string
  alt: string
  className?: string
  loading?: "eager" | "lazy"
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

/**
 * 简单的Gallery图片组件 - 直接显示图片，不做任何URL转换
 * 用于显示R2存储桶直链和本地静态图片，确保在任何网络环境下都能加载
 */
export default function SimpleGalleryImage({
  src,
  alt,
  className,
  loading = "lazy",
  onError,
  onLoad
}: SimpleGalleryImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [timeoutTriggered, setTimeoutTriggered] = useState(false)
  
  // 优化图片URL和生成srcSet
  const optimizedImage = useMemo(() => {
    // 估算容器宽度（Hero区域图片大约300px宽）
    const estimatedWidth = 300
    const optimizeOptions = getOptimalImageSize(estimatedWidth)
    
    return {
      src: optimizeImageUrl(src, optimizeOptions),
      srcSet: generateImageSrcSet(src),
      fallbackSrc: src // 保留原始URL作为fallback
    }
  }, [src])

  // 添加超时处理
  useEffect(() => {
    if (isLoading && !hasError) {
      const timeout = setTimeout(() => {
        console.warn(`⏰ SimpleGalleryImage 加载超时: ${src}`)
        setTimeoutTriggered(true)
        setHasError(true)
        setIsLoading(false)
      }, 8000) // 8秒超时，给Hero图片更短的等待时间

      return () => clearTimeout(timeout)
    }
  }, [isLoading, hasError, src])
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    
    // 如果优化URL失败，尝试使用原始URL
    if (target.src === optimizedImage.src && optimizedImage.fallbackSrc !== optimizedImage.src) {
      console.warn(`⚠️ 优化图片加载失败，尝试原始URL: ${optimizedImage.fallbackSrc}`)
      target.src = optimizedImage.fallbackSrc
      return
    }
    
    console.error(`❌ SimpleGalleryImage 加载失败: ${src}`)
    console.error('错误详情:', e)
    setHasError(true)
    setIsLoading(false)
    onError?.(e)
  }
  
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`✅ SimpleGalleryImage 加载成功: ${src}`)
    setIsLoading(false)
    onLoad?.(e)
  }
  
  if (hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-[#f5f1e8] to-[#e1d4c0] flex items-center justify-center p-2 rounded-lg border border-[#8b7355]/20`}>
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-1 bg-gradient-to-br from-[#d4a574]/30 to-[#8b7355]/30 rounded-lg border border-dashed border-[#8b7355]/40 flex items-center justify-center transform rotate-12">
            <Image className="w-4 h-4 text-[#8b7355]/60" />
          </div>
          <div 
            className="text-xs text-[#8b7355]/80 font-bold"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            🔮 Magic Failed
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gradient-to-br from-[#f5f1e8] to-[#ebe5d6] flex items-center justify-center p-2 rounded-lg`}>
          <div className="text-center">
            {/* 迷你魔法光环 */}
            <div className="relative w-8 h-8 mx-auto mb-1">
              <div className="absolute inset-0 rounded-full border border-[#d4a574]/40 animate-spin"></div>
              <div className="absolute inset-1 rounded-full border border-[#8b7355]/60 animate-[spin_1.5s_linear_infinite_reverse]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-[#8b7355] animate-pulse" />
              </div>
              {/* 迷你魔法粒子 */}
              <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-[#d4a574] rounded-full animate-ping"></div>
              <div className="absolute -bottom-0.5 -left-0.5 w-1 h-1 bg-[#8b7355] rounded-full animate-ping delay-300"></div>
            </div>
            <div 
              className="text-xs text-[#8b7355] font-bold"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              ✨ Casting...
            </div>
          </div>
        </div>
      )}
      <img
        src={optimizedImage.src}
        srcSet={optimizedImage.srcSet}
        sizes="(max-width: 768px) 50vw, 25vw"
        alt={alt}
        className={className}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
        // 添加图片优化属性
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
        decoding="async"
      />
    </>
  )
}