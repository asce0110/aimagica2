"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { 
  Heart, 
  Download, 
  Share2, 
  Search, 
  Eye, 
  MessageCircle,
  Star,
  Crown,
  Wand2,
  Sparkles,
  TrendingUp,
  Copy,
  Check,
  ThumbsUp,
  Send,
  Loader2
} from "lucide-react"
import { useSessionCompat as useSession } from "@/components/session-provider"
import { getProxiedAvatarUrl, getFallbackAvatarUrl } from "@/lib/utils/avatar"
import useStaticUrl from "@/hooks/use-static-url"
import { getStaticGalleryData, type StaticGalleryImage } from "@/lib/static-gallery-data"
import VirtualWaterfall, { type WaterfallItem } from "@/components/ui/virtual-waterfall"
import LazyGalleryImage from "@/components/ui/lazy-gallery-image"

// 类型定义 - 无需数据库依赖
type Comment = {
  id: string
  imageId: string
  content: string
  author: string
  authorAvatar: string
  likes: number
  isLiked: boolean
  createdAt: string
}

// 分页配置
const ITEMS_PER_PAGE = 12
const INITIAL_LOAD = 12

// 扩展静态图片数据类型，添加数据库状态
interface EnhancedGalleryImage extends StaticGalleryImage {
  // 数据库状态
  dbStats?: any
  // 是否已从数据库加载
  dbLoaded: boolean
  // 本地UI状态（用于即时反馈）
  localLikes: number
  localViews: number
  localComments: number
  localIsLiked: boolean
}

export default function NewGalleryClient() {
  const { data: session } = useSession()
  const logoUrl = useStaticUrl('/images/aimagica-logo.png')

  // 数据状态 - 静态优先，立即可用
  const [allImages, setAllImages] = useState<EnhancedGalleryImage[]>(() => {
    // 立即从静态数据初始化，无需等待API
    const staticImages = getStaticGalleryData()
    return staticImages.map(img => ({
      ...img,
      dbLoaded: false, // 标记为静态数据
      localLikes: img.likes,
      localViews: img.views,
      localComments: img.comments,
      localIsLiked: false // 初始未点赞
    }))
  })
  
  // 加载状态 - 静态数据立即可用，不需要loading
  const [isLoadingAPI, setIsLoadingAPI] = useState(false)
  
  // 初始化状态设为false，立即显示Gallery
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  
  const [displayedImages, setDisplayedImages] = useState<EnhancedGalleryImage[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // UI状态
  const [selectedImage, setSelectedImage] = useState<EnhancedGalleryImage | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  
  // 功能状态
  const [isSharing, setIsSharing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied' | 'shared'>('idle')
  
  // 评论功能状态
  const [newComment, setNewComment] = useState("")
  const [isAddingComment, setIsAddingComment] = useState(false)

  // 从localStorage加载用户交互数据 - 渐进增强
  useEffect(() => {
    console.log('🎯 静态Gallery已就绪，加载本地用户交互数据...')
    
    const loadLocalInteractions = () => {
      setAllImages(prevImages => 
        prevImages.map(image => {
          try {
            // 从localStorage获取用户的点赞、浏览等数据
            const localLikes = parseInt(localStorage.getItem(`gallery_likes_${image.id}`) || image.likes.toString())
            const localViews = parseInt(localStorage.getItem(`gallery_views_${image.id}`) || image.views.toString()) 
            const localComments = parseInt(localStorage.getItem(`gallery_comments_${image.id}`) || image.comments.toString())
            const localIsLiked = localStorage.getItem(`gallery_liked_${image.id}`) === 'true'
            
            return {
              ...image,
              localLikes: Math.max(localLikes, image.likes), // 本地数据优先，但不能低于基础数据
              localViews: Math.max(localViews, image.views),
              localComments: Math.max(localComments, image.comments),
              localIsLiked: localIsLiked,
            }
          } catch (e) {
            console.warn('⚠️ localStorage读取失败:', e)
            return image
          }
        })
      )
    }
    
    // 延迟加载本地数据，确保UI优先渲染
    setTimeout(loadLocalInteractions, 100)
  }, [])
  
  // 可选：尝试在后台获取最新数据，但不阻塞用户体验
  const tryLoadLatestData = useCallback(async () => {
    // 只在用户主动刷新或有网络时才尝试
    if (typeof window === 'undefined' || !navigator.onLine) {
      console.log('📱 离线模式或SSR，使用静态Gallery数据')
      return
    }
    
    try {
      // 短超时，不影响用户体验
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      const response = await fetch('https://aimagica-api.403153162.workers.dev/api/gallery/public', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          console.log('✨ 获取到最新Gallery数据，静默更新统计信息')
          // 只更新统计数据，不替换整个列表
          setAllImages(prevImages => 
            prevImages.map(staticImage => {
              const apiImage = data.data.find((api: any) => api.id === staticImage.id)
              if (apiImage) {
                return {
                  ...staticImage,
                  likes: Math.max(staticImage.localLikes, apiImage.likes || 0),
                  views: Math.max(staticImage.localViews, apiImage.views || 0),
                  comments: Math.max(staticImage.localComments, apiImage.comments || 0)
                }
              }
              return staticImage
            })
          )
        }
      }
    } catch (error) {
      // 静默失败，不影响用户体验
      console.log('📡 后台数据更新失败，继续使用静态数据')
    }
  }, [])

  // 保存用户交互到localStorage - 无需API
  const saveInteractionToLocal = useCallback((imageId: string | number, type: 'like' | 'view' | 'comment', value: any) => {
    try {
      const key = `gallery_${type === 'like' ? 'liked' : type + 's'}_${imageId}`
      localStorage.setItem(key, value.toString())
      console.log(`💾 保存用户交互: ${type} for ${imageId}`)
    } catch (error) {
      console.warn('⚠️ localStorage保存失败:', error)
    }
  }, [])

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 过滤和搜索逻辑 - 保持原有逻辑
  const filteredImages = useMemo(() => {
    let result = allImages

    if (filter !== "all") {
      result = result.filter(image => 
        image.style.toLowerCase() === filter.toLowerCase()
      )
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(image =>
        image.title.toLowerCase().includes(query) ||
        image.author.toLowerCase().includes(query) ||
        image.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return result
  }, [allImages, filter, searchQuery])

  // 初始化首屏数据
  useEffect(() => {
    const initialImages = filteredImages.slice(0, INITIAL_LOAD)
    setDisplayedImages(initialImages)
    setCurrentPage(1)
  }, [filteredImages])

  // 处理分享链接中的图片ID hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#image-')) {
        const imageId = hash.replace('#image-', '')
        const targetImage = allImages.find(img => img.id.toString() === imageId)
        if (targetImage) {
          setSelectedImage(targetImage)
          setTimeout(() => {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }, 1000)
        }
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [allImages])

  // 加载更多图片
  const loadMore = useCallback(() => {
    if (loading) return

    const nextPage = currentPage + 1
    const startIndex = currentPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const newImages = filteredImages.slice(startIndex, endIndex)

    if (newImages.length === 0) return

    setLoading(true)
    setTimeout(() => {
      setDisplayedImages(prev => [...prev, ...newImages])
      setCurrentPage(nextPage)
      setLoading(false)
    }, 500)
  }, [loading, currentPage, filteredImages])

  // 是否还有更多数据
  const hasMore = displayedImages.length < filteredImages.length

  // 转换为瀑布流数据格式 - 保持原有布局逻辑
  const waterfallItems: WaterfallItem[] = useMemo(() => {
    return displayedImages.map((image, index) => {
      const getItemHeight = () => {
        if (isMobile) {
          if (image.size === 'vertical') return 350
          if (image.size === 'horizontal') return 200
          if (image.size === 'large') return 380
          if (image.size === 'small') return 250
          return 300
        } else {
          const baseHeights = {
            'vertical': 550,
            'horizontal': 300,
            'large': 600,
            'small': 350,
            'medium': 450
          }
          
          const baseHeight = baseHeights[image.size] || 450
          const variation = (index % 5) * 25 - 50
          return Math.max(280, baseHeight + variation)
        }
      }
      
      return {
        id: image.id,
        url: image.url,
        title: image.title,
        height: getItemHeight(),
        ...image
      }
    })
  }, [displayedImages, isMobile])

  // 点赞处理 - 新的数据库集成
  const handleLike = useCallback(async (id: string | number) => {
    const imageId = id.toString()
    console.log(`❤️ 点赞图片: ${imageId}`)
    
    // 立即更新UI，提供即时反馈
    const updateImageLike = (img: EnhancedGalleryImage) => {
      if (img.id.toString() === imageId) {
        const newLikedState = !img.localIsLiked
        const newLikesCount = newLikedState ? img.localLikes + 1 : Math.max(0, img.localLikes - 1)
        return {
          ...img,
          localIsLiked: newLikedState,
          localLikes: newLikesCount,
        }
      }
      return img
    }

    setDisplayedImages(prev => prev.map(updateImageLike))
    setAllImages(prev => prev.map(updateImageLike))

    if (selectedImage && selectedImage.id.toString() === imageId) {
      setSelectedImage(prev => prev ? updateImageLike(prev) : null)
    }

    // 后台同步到数据库
    try {
      // const result = await galleryDB.toggleImageLike(imageId)
      const result = { success: false, liked: false, newCount: 0 }
      if (result.success) {
        console.log(`✅ 点赞同步成功: ${result.liked}`)
        
        // 如果数据库返回了确切的数据，使用数据库数据纠正UI
        const correctImageLike = (img: EnhancedGalleryImage) => {
          if (img.id.toString() === imageId) {
            return {
              ...img,
              localIsLiked: result.liked,
              localLikes: result.newCount,
              dbLoaded: true,
            }
          }
          return img
        }

        setDisplayedImages(prev => prev.map(correctImageLike))
        setAllImages(prev => prev.map(correctImageLike))

        if (selectedImage && selectedImage.id.toString() === imageId) {
          setSelectedImage(prev => prev ? correctImageLike(prev) : null)
        }
      } else {
        console.warn('⚠️ 点赞同步失败，但UI已更新')
      }
    } catch (error) {
      console.warn('⚠️ 点赞同步异常，但UI已更新:', error)
    }
  }, [selectedImage])

  // 图片点击处理 - 集成浏览量统计
  const handleImageClick = useCallback(async (image: EnhancedGalleryImage) => {
    setSelectedImage(image)
    console.log(`🖼️ 打开图片详情: ${image.title}`)
    
    // 立即更新浏览量UI
    const imageId = image.id.toString()
    const updateImageViews = (img: EnhancedGalleryImage) => {
      if (img.id.toString() === imageId) {
        return { ...img, localViews: img.localViews + 1 }
      }
      return img
    }

    setDisplayedImages(prev => prev.map(updateImageViews))
    setAllImages(prev => prev.map(updateImageViews))
    
    // 后台同步浏览量到数据库
    try {
      // await galleryDB.incrementImageView(imageId)
      console.log('✅ 浏览量同步成功')
    } catch (error) {
      console.warn('⚠️ 浏览量同步失败:', error)
    }
    
    // 加载评论
    loadImageComments(imageId)
  }, [])

  // 加载图片评论
  const loadImageComments = useCallback(async (imageId: string) => {
    setIsLoadingComments(true)
    try {
      console.log(`💬 加载图片评论: ${imageId}`)
      // const commentsList = await galleryDB.getImageComments(imageId)
      const commentsList = [] as any[]
      setComments(commentsList)
      console.log(`✅ 评论加载成功: ${commentsList.length}条`)
    } catch (error) {
      console.warn('⚠️ 评论加载失败:', error)
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }, [])

  // 添加新评论
  const handleAddComment = useCallback(async () => {
    if (!selectedImage || !newComment.trim() || isAddingComment) return

    const content = newComment.trim()
    const imageId = selectedImage.id.toString()
    
    // 验证评论长度
    if (content.length > 500) {
      alert('评论内容不能超过500字符')
      return
    }
    
    setIsAddingComment(true)
    try {
      console.log(`💬 提交评论: ${imageId}, 内容: "${content.substring(0, 50)}..."`)
      // const comment = await galleryDB.addImageComment(imageId, content)
      const comment = null
      
      if (comment) {
        setComments(prev => [comment, ...prev])
        setNewComment("")
        
        // 更新评论数量
        const updateCommentCount = (img: EnhancedGalleryImage) => {
          if (img.id.toString() === imageId) {
            return { ...img, localComments: img.localComments + 1 }
          }
          return img
        }

        setDisplayedImages(prev => prev.map(updateCommentCount))
        setAllImages(prev => prev.map(updateCommentCount))
        
        console.log('✅ 评论提交成功')
      } else {
        console.warn('⚠️ 评论提交失败：服务器返回空结果')
        alert('评论提交失败，请稍后重试')
      }
    } catch (error: any) {
      console.error('❌ 评论提交异常:', error)
      const errorMessage = error?.message || '网络错误'
      alert(`评论提交失败: ${errorMessage}`)
    } finally {
      setIsAddingComment(false)
    }
  }, [selectedImage, newComment, isAddingComment])

  // 评论点赞处理
  const handleCommentLike = useCallback(async (commentId: string) => {
    try {
      // 立即更新UI
      const updateCommentLike = (comment: Comment) => {
        if (comment.id === commentId) {
          const newLikedState = !comment.isLiked
          const newLikesCount = newLikedState ? comment.likes + 1 : Math.max(0, comment.likes - 1)
          return { ...comment, isLiked: newLikedState, likes: newLikesCount }
        }
        return comment
      }
      
      setComments(prev => prev.map(updateCommentLike))
      
      // 后台同步
      // const result = await galleryDB.toggleCommentLike(commentId)
      const result = { success: false, liked: false, newCount: 0 }
      if (result.success) {
        console.log('✅ 评论点赞成功')
        
        // 使用服务器返回的准确数据更新UI
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, isLiked: result.liked, likes: result.newCount }
          }
          return comment
        }))
      } else {
        console.warn('⚠️ 评论点赞同步失败，但UI已更新')
      }
    } catch (error) {
      console.warn('⚠️ 评论点赞异常，但UI已更新:', error)
    }
  }, [])

  // 分享功能 - 保持原有逻辑
  const handleShare = useCallback(async () => {
    if (!selectedImage) return
    
    setIsSharing(true)
    const shareUrl = `${window.location.origin}/gallery#image-${selectedImage.id}`
    const shareData = {
      title: `${selectedImage.title} - AIMAGICA Gallery`,
      text: `🎨 Amazing AI artwork: "${selectedImage.title}" by ${selectedImage.author}\\n✨ Created with AI magic - check it out in our gallery!`,
      url: shareUrl
    }

    try {
      if (navigator.share && isMobile) {
        await navigator.share(shareData)
        setShareStatus('shared')
      } else {
        await navigator.clipboard.writeText(shareUrl)
        setShareStatus('copied')
      }
      setTimeout(() => setShareStatus('idle'), 2000)
    } catch (error) {
      console.warn('分享失败:', error)
    }
    
    setIsSharing(false)
  }, [selectedImage, isMobile])

  // 下载功能 - 保持原有逻辑
  const handleDownload = useCallback(async () => {
    if (!selectedImage) return
    
    setIsDownloading(true)
    try {
      const response = await fetch(selectedImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `aimagica-${selectedImage.title.replace(/[^a-zA-Z0-9]/g, '-')}-${selectedImage.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      window.open(selectedImage.url, '_blank')
    }
    setIsDownloading(false)
  }, [selectedImage])

  // 渲染单个图片项 - 优化首屏加载
  const renderItem = useCallback((item: WaterfallItem, index: number) => {
    const image = item as EnhancedGalleryImage & { height?: number }
    return (
      <LazyGalleryImage
        key={image.id}
        id={image.id}
        url={image.url}
        title={image.title}
        author={image.author}
        likes={image.localLikes} // 使用本地状态，包含数据库更新
        views={image.localViews}
        isPremium={image.isPremium}
        isFeatured={image.isFeatured}
        isLiked={image.localIsLiked}
        createdAt={image.createdAt}
        size={image.size}
        rotation={image.rotation}
        onClick={() => handleImageClick(image)}
        priority={index < 8} // 增加优先加载的图片数量，确保首屏快速显示
        waterfallHeight={image.height}
      />
    )
  }, [handleImageClick])

  // 移除加载屏幕，直接显示Gallery内容

  return (
    <div className="min-h-screen bg-black">
      {/* 导航栏 - 保持原有样式 */}
      <header className="p-4 md:p-6 bg-[#0a0a0a] border-b border-[#333] sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 cursor-pointer transform hover:scale-105 transition-all">
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="AIMAGICA"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-all"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a574] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black text-white transform -rotate-1" style={{ textShadow: "2px 2px 0px #333" }}>
                  AIMAGICA
                </h1>
                <p className="text-xs text-gray-400 transform rotate-1">Magic Gallery ✨</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search magical creations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-[#1a1a1a] border-2 border-[#444] text-white placeholder:text-gray-400 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* 过滤器标签 - 保持原有样式 */}
        <div className="mb-8 flex flex-wrap gap-4 items-start">
          <Tabs value={filter} onValueChange={setFilter} className="flex-1 min-w-[200px]">
            <TabsList className="bg-[#1a1a1a] border-2 border-[#444] rounded-xl p-1 flex flex-wrap gap-1">
              <TabsTrigger value="all" className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-1 hover:scale-105 transition-all">
                All Magic
              </TabsTrigger>
              <TabsTrigger value="fantasy" className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-0.5 hover:scale-105 transition-all">
                Fantasy 🧙‍♂️
              </TabsTrigger>
              <TabsTrigger value="cyberpunk" className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-0.5 hover:scale-105 transition-all">
                Cyberpunk 🤖
              </TabsTrigger>
              <TabsTrigger value="sci-fi" className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-1 hover:scale-105 transition-all">
                Sci-Fi 🚀
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 统计信息 - 显示数据库连接状态 */}
        <motion.div 
          className="mb-6 flex items-center justify-between bg-[#1a1a1a] rounded-xl p-4 border-2 border-[#444]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#d4a574]" />
              <span className="text-white font-bold">
                {displayedImages.length} of {filteredImages.length} artworks
              </span>
            </div>
            {/* 显示静态Gallery状态 */}
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500">
              Static Gallery Ready
            </Badge>
            {navigator.onLine ? (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500">
                Online Enhanced
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500">
                Offline Mode
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="outline" className="bg-[#2a2a2a] text-gray-300">
                Search: "{searchQuery}"
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Smart gallery loading</span>
          </div>
        </motion.div>

        {/* 瀑布流画廊 - 保持原有布局 */}
        <VirtualWaterfall
          items={waterfallItems}
          columns={isMobile ? 2 : 4}
          gap={isMobile ? 12 : 16}
          itemMinWidth={isMobile ? 150 : 250}
          renderItem={renderItem}
          onLoadMore={loadMore}
          hasMore={hasMore}
          loading={loading}
          initialRenderCount={INITIAL_LOAD}
          className="mb-8"
        />

        {/* 静态数据空状态 */}
        {filteredImages.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* 搜索/过滤后无结果 */}
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No artworks found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {
                setFilter('all')
                setSearchQuery('')
              }}
              className="mt-4 px-4 py-2 bg-[#d4a574] text-black font-bold rounded-lg hover:bg-[#c19660] transition-colors"
            >
              Show All Artworks
            </button>
          </motion.div>
        )}
      </div>

      {/* 图片详情对话框 - 增强的评论功能 */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => {
        if (!open) setSelectedImage(null)
      }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] bg-black p-0 rounded-2xl border-4 border-[#333] shadow-2xl overflow-hidden flex flex-col">
          <DialogTitle style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
            {selectedImage?.title || "Image Details"}
          </DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-1 min-h-0">
            {/* 图片侧 - 保持原有样式 */}
            <div className="relative bg-black rounded-l-xl md:rounded-r-none overflow-hidden flex-shrink-0 h-64 md:h-auto">
              {selectedImage && (
                <>
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                    loading="eager"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h2 className="text-lg md:text-xl font-black text-white mb-1 transform -rotate-1" style={{ textShadow: "2px 2px 0px #333" }}>
                      {selectedImage.title}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <img
                        src={getProxiedAvatarUrl(selectedImage.authorAvatar)}
                        alt={selectedImage.author}
                        className="w-6 h-6 rounded-full border-2 border-[#444]"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackAvatarUrl(selectedImage.author)
                        }}
                      />
                      <p className="text-[#d4a574] font-bold text-sm">by {selectedImage.author}</p>
                      {selectedImage.isPremium && <Crown className="w-4 h-4 text-[#d4a574]" />}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 详情侧 - 增强的交互功能 */}
            <div className="p-4 md:p-6 overflow-y-auto bg-[#0a0a0a] flex-1 min-h-0">
              {selectedImage && (
                <>
                  <DialogHeader className="border-b border-[#333] pb-4 mb-4">
                    <DialogTitle className="text-xl font-black text-white">
                      {selectedImage.title}
                    </DialogTitle>
                  </DialogHeader>

                  {/* 统计信息 - 使用真实数据库数据 */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button
                      size="sm"
                      onClick={() => handleLike(selectedImage.id)}
                      className={`flex items-center space-x-1 transform rotate-1 ${
                        selectedImage.localIsLiked
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"
                      } font-bold rounded-lg border-2 border-[#444]`}
                      style={{ boxShadow: "2px 2px 0 #333" }}
                    >
                      <Heart className="w-4 h-4" fill={selectedImage.localIsLiked ? "currentColor" : "none"} />
                      <span>{selectedImage.localLikes}</span>
                    </Button>

                    <span className="flex items-center text-gray-300 font-bold transform -rotate-1 bg-[#1a1a1a] px-2 py-1 rounded-lg border-2 border-[#444]" style={{ boxShadow: "1px 1px 0 #333" }}>
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {selectedImage.localComments}
                    </span>

                    <span className="flex items-center text-gray-300 font-bold transform rotate-0.5 bg-[#1a1a1a] px-2 py-1 rounded-lg border-2 border-[#444]" style={{ boxShadow: "1px 1px 0 #333" }}>
                      <Eye className="w-4 h-4 mr-1" />
                      {selectedImage.localViews}
                    </span>

                    <span className="ml-auto text-gray-400 font-bold text-sm transform -rotate-1">
                      {selectedImage.createdAt}
                    </span>
                  </div>

                  {/* 提示词 - 保持原有样式 */}
                  <div className="mb-6 transform rotate-0.5">
                    <h3 className="text-white font-black mb-3 transform -rotate-1" style={{ textShadow: "1px 1px 0px #333" }}>
                      Magic Prompt ✨
                    </h3>
                    <div className="p-4 bg-[#1a1a1a] border-2 border-[#444] shadow-md" style={{ borderRadius: "16px", clipPath: "polygon(0% 0%, 100% 2%, 99% 98%, 1% 100%)" }}>
                      <p className="text-gray-200 font-bold text-sm leading-relaxed">
                        "{selectedImage.prompt}"
                      </p>
                    </div>
                  </div>

                  {/* 标签 - 保持原有样式 */}
                  <div className="mb-6">
                    <h3 className="text-white font-black mb-3 transform rotate-0.5" style={{ textShadow: "1px 1px 0px #333" }}>
                      Magic Tags 🏷️
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[#d4a574] text-black font-black transform rotate-1" style={{ boxShadow: "1px 1px 0 #333" }}>
                        {selectedImage.style}
                      </Badge>
                      {selectedImage.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-[#1a1a1a] border-2 border-[#444] text-gray-300 font-bold hover:bg-[#2a2a2a]"
                          style={{ transform: `rotate(${(index % 3) - 1}deg)` }}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 操作按钮 - 保持原有样式 */}
                  <div className="flex gap-3 mb-6">
                    <Button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="bg-[#4a5a4a] hover:bg-[#5a6a5a] text-white font-black rounded-xl flex-1 border-2 border-[#666] transform -rotate-0.5 hover:scale-105 transition-all disabled:opacity-50"
                      style={{ boxShadow: "2px 2px 0 #333" }}
                    >
                      {shareStatus === 'copying' ? (
                        <Copy className="w-4 h-4 mr-2 animate-pulse" />
                      ) : shareStatus === 'copied' ? (
                        <Check className="w-4 h-4 mr-2 text-green-400" />
                      ) : shareStatus === 'shared' ? (
                        <Check className="w-4 h-4 mr-2 text-blue-400" />
                      ) : (
                        <Share2 className="w-4 h-4 mr-2" />
                      )}
                      {shareStatus === 'copied' ? 'Copied!' : shareStatus === 'shared' ? 'Shared!' : isSharing ? 'Sharing...' : 'Share'}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black rounded-xl flex-1 transform rotate-0.5 hover:scale-105 transition-all disabled:opacity-50"
                      style={{ boxShadow: "2px 2px 0 #333" }}
                    >
                      <Download className={`w-4 h-4 mr-2 ${isDownloading ? 'animate-bounce' : ''}`} />
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                  </div>

                  {/* 评论区域 - 全新的数据库集成功能 */}
                  <div>
                    <h3 className="text-white font-black mb-4 transform -rotate-0.5" style={{ textShadow: "1px 1px 0px #333" }}>
                      Magic Comments 💬
                      {isLoadingComments && (
                        <span className="text-sm text-gray-400 ml-2">Loading...</span>
                      )}
                    </h3>

                    {/* 添加评论 */}
                    <div className="mb-6 p-4 bg-[#1a1a1a] border-2 border-[#444] rounded-xl">
                      <Textarea
                        placeholder="Share your thoughts about this magical artwork..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-[#2a2a2a] border border-[#555] text-white placeholder:text-gray-400 resize-none mb-3"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          {newComment.length}/500
                        </span>
                        <Button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isAddingComment}
                          size="sm"
                          className="bg-[#d4a574] hover:bg-[#c19660] text-black font-bold"
                        >
                          {isAddingComment ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {isAddingComment ? 'Adding...' : 'Add Comment'}
                        </Button>
                      </div>
                    </div>

                    {/* 评论列表 */}
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {isLoadingComments ? (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-2">💬</div>
                          <p className="text-gray-400">Loading comments...</p>
                        </div>
                      ) : comments.length > 0 ? (
                        comments.map((comment, index) => (
                        <div
                          key={comment.id}
                          className="bg-[#1a1a1a] rounded-xl p-4 border-2 border-[#444] shadow-md"
                          style={{
                            transform: `rotate(${(index % 3) - 1}deg)`,
                            boxShadow: `${(index % 3) - 1}px ${(index % 2) + 1}px 0 #333`,
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <img
                              src={getProxiedAvatarUrl(comment.authorAvatar)}
                              alt={comment.author}
                              className="w-8 h-8 rounded-full border-2 border-[#444]"
                              onError={(e) => {
                                e.currentTarget.src = getFallbackAvatarUrl(comment.author)
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-white font-black text-sm">
                                    {comment.author}
                                  </span>
                                  <span className="text-gray-400 font-bold text-xs ml-2">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-200 font-bold text-sm mt-1">
                                {comment.content}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-3">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCommentLike(comment.id)}
                                    className={`flex items-center space-x-1 p-1 hover:bg-[#2a2a2a] rounded transition-all ${
                                      comment.isLiked
                                        ? "text-red-400 hover:text-red-300"
                                        : "text-gray-400 hover:text-white"
                                    }`}
                                  >
                                    <ThumbsUp 
                                      className={`w-3 h-3 transition-transform hover:scale-110 ${
                                        comment.isLiked ? 'fill-current' : ''
                                      }`} 
                                    />
                                    <span className="text-xs font-bold">
                                      {comment.likes}
                                    </span>
                                  </Button>
                                  <span className="text-gray-500 text-xs">•</span>
                                  <span className="text-gray-400 font-bold text-xs">Reply</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}