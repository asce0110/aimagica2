"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Eye, Sparkles, RefreshCw } from "lucide-react"
import { useSessionCompat as useSession } from "@/components/session-provider"
import { imageCache } from "@/lib/image-cache"

interface RecommendationImage {
  id: string
  url: string
  title: string
  style: string
  prompt: string
  likes: number
  views: number
  author: string
  isLiked: boolean
}

interface RecommendationGalleryProps {
  onUsePrompt?: (prompt: string, style?: string) => void
  className?: string
}

export default function RecommendationGallery({ onUsePrompt, className }: RecommendationGalleryProps) {
  const { data: session } = useSession()
  const [recommendations, setRecommendations] = useState<RecommendationImage[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 获取推荐图片
  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/recommendations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('推荐API响应:', data)
        if (data.success && data.recommendations && data.recommendations.length > 0) {
          console.log('推荐数据详情:', data.recommendations.map(item => ({ 
            id: item.id, 
            style: item.style, 
            prompt: item.prompt?.substring(0, 50) + '...' 
          })))
          setRecommendations(data.recommendations)
          
          // 预加载推荐图片到缓存
          const imageUrls = data.recommendations.map((img: any) => img.url).filter(Boolean)
          if (imageUrls.length > 0) {
            console.log('🚀 开始预加载推荐图片到缓存')
            imageCache.preloadImages(imageUrls).catch(error => {
              console.warn('⚠️ 推荐图片预加载失败:', error)
            })
          }
        } else {
          // 如果没有推荐数据，使用默认推荐
          console.log('没有推荐数据，使用默认推荐')
          setRecommendations(getDefaultRecommendations())
        }
      } else {
        // API失败时使用默认推荐
        console.log('API失败，使用默认推荐')
        setRecommendations(getDefaultRecommendations())
      }
    } catch (error) {
      console.error('获取推荐失败:', error)
      // 错误时使用默认推荐
      setRecommendations(getDefaultRecommendations())
    } finally {
      setLoading(false)
    }
  }

  // 默认推荐数据（当用户没有点赞历史或API失败时使用）
  const getDefaultRecommendations = (): RecommendationImage[] => {
    const defaultImages = [
      {
        id: 'default-1',
        url: 'https://picsum.photos/400/400?random=1',
        title: 'Magical Anime Girl',
        style: 'Anime',
        prompt: 'Beautiful anime girl with flowing silver hair, starlight in her eyes, magical aura, detailed illustration',
        likes: 1245,
        views: 3456,
        author: 'AnimeMaster',
        isLiked: false
      },
      {
        id: 'default-2',
        url: 'https://picsum.photos/400/400?random=2',
        title: 'Epic Dragon',
        style: 'Fantasy',
        prompt: 'Majestic dragon soaring through stormy clouds, lightning, epic fantasy scene, cinematic lighting',
        likes: 987,
        views: 2134,
        author: 'DragonLord',
        isLiked: false
      },
      {
        id: 'default-3',
        url: 'https://picsum.photos/400/400?random=3',
        title: 'Neon City',
        style: 'Cyberpunk',
        prompt: 'Cyberpunk city at night, neon lights, flying cars, rain, reflective streets, futuristic atmosphere',
        likes: 756,
        views: 1890,
        author: 'NeonDreamer',
        isLiked: false
      },
      {
        id: 'default-4',
        url: 'https://picsum.photos/400/400?random=4',
        title: 'Magical Cat',
        style: 'Cute',
        prompt: 'Cute cat wizard wearing a starry magic hat, casting rainbow spells, adorable expression',
        likes: 834,
        views: 2156,
        author: 'CatLover',
        isLiked: false
      }
    ]
    
    // 随机选择4张图片
    return defaultImages.sort(() => Math.random() - 0.5).slice(0, 4)
  }

  // 刷新推荐
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRecommendations()
    setRefreshing(false)
  }

  // 处理点赞
  const handleLike = async (imageId: string) => {
    if (!session) return

    try {
      const response = await fetch('/api/gallery/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      })

      if (response.ok) {
        // 更新本地状态
        setRecommendations(prev => 
          prev.map(img => 
            img.id === imageId 
              ? { ...img, isLiked: !img.isLiked, likes: img.isLiked ? img.likes - 1 : img.likes + 1 }
              : img
          )
        )
      }
    } catch (error) {
      console.error('点赞失败:', error)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [session])

  // 如果没有推荐数据，使用默认推荐
  useEffect(() => {
    if (!loading && recommendations.length === 0) {
      setRecommendations(getDefaultRecommendations())
    }
  }, [loading, recommendations.length])

  if (loading) {
    return (
      <Card className={`bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b7355]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white border-4 border-[#8b7355] rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all ${className}`}>
      <div className="bg-gradient-to-r from-[#d4a574] to-[#8b7355] p-3 md:p-4 relative">
        <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-4 h-4 md:w-6 md:h-6 bg-[#f5f1e8] rounded-full"></div>
        <div className="flex items-center justify-between">
          <h3
            className="text-lg md:text-xl font-black text-[#2d3e2d] transform rotate-1"
            style={{
              fontFamily: "Fredoka One, Arial Black, sans-serif",
              textShadow: "2px 2px 0px #f5f1e8, 1px 1px 0px rgba(255,255,255,0.8)",
            }}
          >
            <Sparkles className="w-5 h-5 inline mr-2 text-[#2d3e2d]" />
            Guess You Like 💖
          </h3>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="bg-white hover:bg-[#f5f1e8] text-[#2d3e2d] border-2 border-[#2d3e2d] rounded-xl font-black transform hover:scale-105 transition-all shadow-lg"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <p
          className="text-sm text-[#2d3e2d] mt-1 font-bold"
          style={{ 
            fontFamily: "Fredoka One, Arial Black, sans-serif",
            textShadow: "1px 1px 0px #f5f1e8"
          }}
        >
          {session ? "Based on your likes" : "Popular recommendations"}
        </p>
      </div>
      
      <CardContent className="p-3 md:p-4">
        <div className="grid grid-cols-2 gap-3">
          {recommendations.map((image, index) => (
            <div
              key={image.id}
              className="group relative bg-white rounded-xl border-2 border-[#8b7355] overflow-hidden shadow-md hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer"
              style={{ 
                transform: `rotate(${[-1, 1, -0.5, 0.5][index]}deg)`,
              }}
            >
              {/* 图片 */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = `https://picsum.photos/400/400?random=${image.id}`
                  }}
                />
                
                {/* 悬浮信息 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p 
                      className="text-white text-xs font-bold line-clamp-2 mb-1"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      {image.prompt.substring(0, 50)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-white text-xs">
                        <span className="flex items-center">
                          <Heart className="w-3 h-3 mr-1" />
                          {image.likes}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {image.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 风格标签 */}
                <div className="absolute top-2 left-2">
                  <span
                    className="bg-[#d4a574] text-[#2d3e2d] text-xs font-black px-2 py-1 rounded-lg border border-[#2d3e2d]"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    {image.style}
                  </span>
                </div>

                {/* 点赞按钮 */}
                {session && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(image.id)
                    }}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center transition-all transform hover:scale-110 ${
                      image.isLiked 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-red-500 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${image.isLiked ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>

              {/* 底部信息 */}
              <div className="p-2">
                <h4 
                  className="text-[#2d3e2d] font-black text-sm line-clamp-1 mb-1"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  {image.title}
                </h4>
                <div className="flex items-center justify-between">
                  <p 
                    className="text-[#8b7355] text-xs font-bold"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    by {image.author}
                  </p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('🎯 Use按钮被点击:', { prompt: image.prompt, style: image.style, image })
                      onUsePrompt && onUsePrompt(image.prompt, image.style)
                    }}
                    size="sm"
                    className="h-6 px-3 text-xs bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] border border-[#2d3e2d] rounded-lg font-black transform hover:scale-105 transition-all shadow-md"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    title={`Use this prompt and ${image.style} style`}
                  >
                    ✨ Use
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 查看更多按钮 */}
        <Button
          onClick={() => window.location.href = '/gallery'}
                      className="w-full mt-4 bg-[#4a5a4a] hover:bg-[#5a6a5a] text-[#f5f1e8] font-black py-2 rounded-xl shadow-lg transform hover:scale-105 transition-all"
          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
        >
          <Eye className="w-4 h-4 mr-2" />
          Explore More! 🎨
        </Button>
      </CardContent>
    </Card>
  )
} 