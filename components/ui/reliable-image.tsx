"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Wand2, Image } from "lucide-react"

interface ReliableImageProps {
  src: string
  alt: string
  className?: string
  loading?: "eager" | "lazy"
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

/**
 * 可靠的图片组件 - 专门解决白屏问题
 * 
 * 核心原则：
 * 1. 始终显示内容，绝不白屏
 * 2. 简单可靠，不过度复杂化
 * 3. 用户体验优先
 */
export default function ReliableImage({
  src,
  alt,
  className,
  loading = "lazy",
  onError,
  onLoad
}: ReliableImageProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [actualSrc, setActualSrc] = useState(src)
  const imgRef = useRef<HTMLImageElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // 重置状态当src改变时
  useEffect(() => {
    if (src !== actualSrc) {
      setActualSrc(src)
      setImageStatus('loading')
    }
  }, [src])

  // 超时处理
  useEffect(() => {
    if (imageStatus === 'loading') {
      timeoutRef.current = setTimeout(() => {
        console.warn(`图片加载超时: ${src}`)
        setImageStatus('error')
      }, 8000) // 缩短为8秒超时，更快显示错误状态
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [imageStatus, src])

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setImageStatus('loaded')
    onLoad?.(e)
    console.log(`✅ 图片加载成功: ${src}`)
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setImageStatus('error')
    onError?.(e)
    console.error(`❌ 图片加载失败: ${src}`)
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 始终显示的背景层 - 魔法风格 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5f1e8] via-[#ebe5d6] to-[#e1d4c0] rounded-lg overflow-hidden">
        {/* 加载状态 - 魔法风格 */}
        {imageStatus === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center">
              {/* 魔法光环 */}
              <div className="relative w-16 h-16 mx-auto mb-4">
                {/* 外圈光环 */}
                <div className="absolute inset-0 rounded-full border-2 border-[#d4a574]/40 animate-spin"></div>
                
                {/* 内圈光环 - 反向旋转 */}
                <div className="absolute inset-2 rounded-full border-2 border-[#8b7355]/60 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                
                {/* 中心魔法棒图标 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-[#8b7355] animate-pulse" />
                </div>
                
                {/* 魔法粒子 */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#d4a574] rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#8b7355] rounded-full animate-ping delay-300"></div>
                <div className="absolute top-1/2 -left-2 w-1 h-1 bg-[#f5f1e8] rounded-full animate-ping delay-700"></div>
                <div className="absolute top-1/4 -right-2 w-1 h-1 bg-[#d4a574] rounded-full animate-ping delay-1000"></div>
              </div>
              
              {/* 魔法加载文字 */}
              <div 
                className="text-sm text-[#8b7355] font-bold mb-2"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                ✨ Casting Magic...
              </div>
              
              {/* 魔法进度条 */}
              <div className="w-12 h-1.5 mx-auto bg-[#8b7355]/20 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[#8b7355] to-[#d4a574] rounded-full animate-pulse shadow-lg" 
                  style={{ width: '70%' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* 错误状态 - 魔法风格 */}
        {imageStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center">
              {/* 破碎的魔法水晶 */}
              <div className="relative w-14 h-14 mx-auto mb-3">
                <div className="w-full h-full bg-gradient-to-br from-[#d4a574]/30 to-[#8b7355]/30 rounded-lg border-2 border-dashed border-[#8b7355]/40 flex items-center justify-center transform rotate-12">
                  <Image className="w-6 h-6 text-[#8b7355]/60" />
                </div>
                {/* 破碎效果 */}
                <div className="absolute top-0 right-0 w-3 h-3 text-[#8b7355]/40">⚡</div>
                <div className="absolute bottom-1 left-1 w-2 h-2 text-[#d4a574]/60">💫</div>
              </div>
              
              <div 
                className="text-sm text-[#8b7355]/80 font-bold mb-1"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                🔮 Magic Failed
              </div>
              
              <div 
                className="text-xs text-[#8b7355]/60 max-w-[120px] truncate"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {alt}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 实际图片 */}
      <img
        ref={imgRef}
        src={actualSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: imageStatus === 'loaded' ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
        }}
        // 优化属性
        decoding="async"
        fetchPriority={loading === 'eager' ? 'high' : 'auto'}
      />
    </div>
  )
}