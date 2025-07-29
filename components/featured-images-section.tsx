"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'
import FeaturedImages from './featured-images'

export default function FeaturedImagesSection() {
  const [hasFeaturedImages, setHasFeaturedImages] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkFeaturedImages()
  }, [])

  const checkFeaturedImages = async () => {
    try {
      // 首先尝试API调用
      const response = await fetch('/api/featured-images')
      if (response.ok) {
        const result = await response.json()
        setHasFeaturedImages(result.success && result.data?.length > 0)
      }
    } catch (error) {
      console.warn('⚠️ API not available, checking static fallback...')
    }
    
    // 如果API失败，尝试使用静态数据
    if (!hasFeaturedImages) {
      try {
        const staticResponse = await fetch('/api/featured-images.json')
        if (staticResponse.ok) {
          const staticResult = await staticResponse.json()
          setHasFeaturedImages(staticResult.success && staticResult.data?.length > 0)
          console.log('✅ Using static featured images fallback')
        }
      } catch (error) {
        console.warn('⚠️ Static featured images fallback also failed')
      }
    }
    setIsLoading(false)
  }

  // 加载中时显示占位符
  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-[#f5f1e8] relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-black text-[#2d3e2d] mb-4 transform -rotate-1"
              style={{
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "3px 3px 0px #d4a574",
              }}
            >
              🌟 Featured Masterpieces 🌟
            </h2>
            <p
              className="text-lg md:text-xl font-bold text-[#8b7355] max-w-3xl mx-auto"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              Handpicked by our team - the most amazing AI artworks created by our community!
            </p>
          </div>

          {/* 加载占位符 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <div key={colIndex} className="grid gap-4 md:gap-6">
                {Array.from({ length: 3 }).map((_, rowIndex) => (
                  <div
                    key={`loading-${colIndex}-${rowIndex}`}
                    className="aspect-[4/3] w-full rounded-lg overflow-hidden shadow-xl relative bg-white border-4 border-[#2d3e2d] animate-pulse"
                  >
                    <div className="absolute inset-1 bg-[#f5f1e8] rounded-md"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // 没有精选图片时完全隐藏
  if (!hasFeaturedImages) {
    return null
  }

  // 有精选图片时显示完整部分
  return (
    <section className="py-12 md:py-16 bg-[#f5f1e8] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black text-[#2d3e2d] mb-4 transform -rotate-1"
            style={{
              fontFamily: "Fredoka One, Arial Black, sans-serif",
              textShadow: "3px 3px 0px #d4a574",
            }}
          >
            🌟 Featured Masterpieces 🌟
          </h2>
          <p
            className="text-lg md:text-xl font-bold text-[#8b7355] max-w-3xl mx-auto"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            Handpicked by our team - the most amazing AI artworks created by our community!
          </p>
        </div>

        {/* 4列3行不规则马赛克布局 - 动态精选图片 */}
        <FeaturedImages />

        {/* 查看更多按钮 */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push("/gallery")}
            className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-8 py-4 rounded-xl shadow-lg transform hover:scale-110 transition-all border-2 border-[#2d3e2d]"
            style={{ 
              fontFamily: "Fredoka One, Arial Black, sans-serif",
            }}
          >
            <Eye className="w-5 h-5 mr-3 inline" />
            VIEW MORE MASTERPIECES 🖼️
          </button>
        </div>
      </div>

      {/* 装饰元素 */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#8b7355]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 right-20 w-60 h-60 bg-[#d4a574]/10 rounded-full blur-3xl"></div>
    </section>
  )
} 