"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
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

// 分页配置
const ITEMS_PER_PAGE = 12
const INITIAL_LOAD = 12

// 本地评论类型
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

// 扩展静态图片数据类型，添加本地状态
interface EnhancedGalleryImage extends StaticGalleryImage {
  // 本地UI状态（localStorage存储）
  localLikes: number
  localViews: number
  localComments: number
  localIsLiked: boolean
}

export default function StaticGalleryClient() {
  const { data: session } = useSession()
  const logoUrl = useStaticUrl('/images/aimagica-logo.png')

  // 数据状态 - 纯静态，立即可用
  const [allImages, setAllImages] = useState<EnhancedGalleryImage[]>(() => {
    // 立即从静态数据初始化，无需等待任何API
    const staticImages = getStaticGalleryData()
    console.log('🎯 纯静态Gallery初始化:', staticImages.length, '张精选作品')
    return staticImages.map(img => ({
      ...img,
      localLikes: img.likes,
      localViews: img.views,
      localComments: img.comments,
      localIsLiked: false // 初始未点赞
    }))
  })
  
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
  
  // 功能状态
  const [isSharing, setIsSharing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied' | 'shared'>('idle')
  
  // 评论功能状态
  const [newComment, setNewComment] = useState("")
  const [isAddingComment, setIsAddingComment] = useState(false)

  // 优化：批量从localStorage加载用户交互数据
  useEffect(() => {
    const loadLocalInteractions = async () => {
      // 使用 requestIdleCallback 在浏览器空闲时加载
      const loadInBackground = () => {
        const localData = new Map()
        
        try {
          // 批量读取localStorage，减少DOM操作
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith('gallery_')) {
              localData.set(key, localStorage.getItem(key))
            }
          }
          
          setAllImages(prevImages => 
            prevImages.map(image => {
              const imageId = image.id.toString()
              const localLikes = parseInt(localData.get(`gallery_likes_${imageId}`) || image.likes.toString())
              const localViews = parseInt(localData.get(`gallery_views_${imageId}`) || image.views.toString()) 
              const localComments = parseInt(localData.get(`gallery_comments_${imageId}`) || image.comments.toString())
              const localIsLiked = localData.get(`gallery_liked_${imageId}`) === 'true'
              
              return {
                ...image,
                localLikes: Math.max(localLikes, image.likes),
                localViews: Math.max(localViews, image.views),
                localComments: Math.max(localComments, image.comments),
                localIsLiked: localIsLiked,
              }
            })
          )
        } catch (e) {
          console.warn('⚠️ localStorage批量读取失败:', e)
        }
      }

      // 使用 requestIdleCallback 或 setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadInBackground)
      } else {
        setTimeout(loadInBackground, 0)
      }
    }
    
    loadLocalInteractions()
  }, [])

  // 优化：批量保存到localStorage，使用防抖
  const saveQueue = useRef(new Map<string, any>())
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  
  const saveInteractionToLocal = useCallback((imageId: string | number, type: 'like' | 'view' | 'comment', value: any) => {
    const key = `gallery_${type === 'like' ? 'liked' : type + 's'}_${imageId}`
    saveQueue.current.set(key, value.toString())
    
    // 清除之前的定时器
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // 300ms后批量保存
    saveTimeoutRef.current = setTimeout(() => {
      try {
        for (const [key, value] of saveQueue.current.entries()) {
          localStorage.setItem(key, value)
        }
        console.log(`💾 批量保存了 ${saveQueue.current.size} 个用户交互`)
        saveQueue.current.clear()
      } catch (error) {
        console.warn('⚠️ localStorage批量保存失败:', error)
      }
    }, 300)
  }, [])

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 优化：过滤和搜索逻辑，缓存搜索结果
  const filteredImages = useMemo(() => {
    if (!allImages.length) return []
    
    let result = allImages

    // 样式过滤
    if (filter !== "all") {
      const lowerFilter = filter.toLowerCase()
      result = result.filter(image => 
        image.style.toLowerCase() === lowerFilter
      )
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      // 缓存toLowerCase结果，避免重复计算
      result = result.filter(image => {
        const titleLower = image.title.toLowerCase()
        const authorLower = image.author.toLowerCase()
        
        return titleLower.includes(query) ||
               authorLower.includes(query) ||
               image.tags.some(tag => tag.toLowerCase().includes(query))
      })
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

  // 转换为瀑布流数据格式
  const waterfallItems: WaterfallItem[] = useMemo(() => {
    return displayedImages.map((image, index) => {
      const getItemHeight = () => {
        if (isMobile) {
          // 移动端：缩短长图片高度，让整体更协调
          if (image.size === 'vertical') return 280 // 从350减少到280
          if (image.size === 'horizontal') return 180 // 从200减少到180
          if (image.size === 'large') return 300 // 从380减少到300
          if (image.size === 'small') return 220 // 从250减少到220
          return 260 // 从300减少到260
        } else {
          // 桌面端：也适当缩短，但保持比例差异
          const baseHeights = {
            'vertical': 480, // 从550减少到480
            'horizontal': 280, // 从300减少到280
            'large': 520, // 从600减少到520
            'small': 320, // 从350减少到320
            'medium': 400 // 从450减少到400
          }
          
          const baseHeight = baseHeights[image.size] || 400
          const variation = (index % 5) * 20 - 40 // 减少变化幅度
          return Math.max(260, baseHeight + variation) // 最小高度从280减少到260
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

  // 点赞处理 - 纯本地存储
  const handleLike = useCallback((id: string | number) => {
    const imageId = id.toString()
    console.log(`❤️ 点赞图片: ${imageId}`)
    
    // 立即更新UI并保存到本地
    const updateImageLike = (img: EnhancedGalleryImage) => {
      if (img.id.toString() === imageId) {
        const newLikedState = !img.localIsLiked
        const newLikesCount = newLikedState ? img.localLikes + 1 : Math.max(img.likes, img.localLikes - 1) // 不能低于原始值
        
        // 保存到localStorage
        saveInteractionToLocal(imageId, 'like', newLikedState)
        saveInteractionToLocal(imageId, 'like', newLikesCount)
        
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
    
    console.log('✨ 点赞操作完成，已保存到本地')
  }, [selectedImage, saveInteractionToLocal])

  // 图片点击处理 - 本地浏览量统计
  const handleImageClick = useCallback((image: EnhancedGalleryImage) => {
    setSelectedImage(image)
    console.log(`🖼️ 打开图片详情: ${image.title}`)
    
    // 立即更新浏览量UI并保存到本地
    const imageId = image.id.toString()
    const updateImageViews = (img: EnhancedGalleryImage) => {
      if (img.id.toString() === imageId) {
        const newViews = img.localViews + 1
        saveInteractionToLocal(imageId, 'view', newViews)
        return { ...img, localViews: newViews }
      }
      return img
    }

    setDisplayedImages(prev => prev.map(updateImageViews))
    setAllImages(prev => prev.map(updateImageViews))
    
    // 加载本地评论
    loadLocalComments(imageId)
    
    console.log('✨ 浏览量更新完成，已保存到本地')
  }, [saveInteractionToLocal])

  // 加载本地评论 - 从localStorage读取
  const loadLocalComments = useCallback((imageId: string) => {
    setIsLoadingComments(true)
    try {
      console.log(`💬 加载本地评论: ${imageId}`)
      const localCommentsStr = localStorage.getItem(`gallery_comments_data_${imageId}`)
      const localCommentsList = localCommentsStr ? JSON.parse(localCommentsStr) : []
      setComments(localCommentsList)
      console.log(`✅ 本地评论加载成功: ${localCommentsList.length}条`)
    } catch (error) {
      console.warn('⚠️ 本地评论加载失败:', error)
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }, [])

  // 添加新评论 - 保存到localStorage
  const handleAddComment = useCallback(() => {
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
      console.log(`💬 添加本地评论: ${imageId}, 内容: "${content.substring(0, 50)}..."`)
      
      // 创建新评论对象
      const newCommentObj = {
        id: `local-${Date.now()}`,
        imageId: imageId,
        content: content,
        author: session?.user?.name || 'Anonymous',
        authorAvatar: session?.user?.image || '/images/aimagica-logo.png',
        likes: 0,
        isLiked: false,
        createdAt: new Date().toISOString()
      }
      
      // 保存到localStorage
      const existingComments = comments
      const updatedComments = [newCommentObj, ...existingComments]
      localStorage.setItem(`gallery_comments_data_${imageId}`, JSON.stringify(updatedComments))
      
      // 更新UI
      setComments(updatedComments)
      setNewComment("")
      
      // 更新评论数量
      const updateCommentCount = (img: EnhancedGalleryImage) => {
        if (img.id.toString() === imageId) {
          const newCount = img.localComments + 1
          saveInteractionToLocal(imageId, 'comment', newCount)
          return { ...img, localComments: newCount }
        }
        return img
      }

      setDisplayedImages(prev => prev.map(updateCommentCount))
      setAllImages(prev => prev.map(updateCommentCount))
      
      console.log('✨ 评论添加成功，已保存到本地')
    } catch (error: any) {
      console.error('❌ 本地评论保存异常:', error)
      alert('评论保存失败，请稍后重试')
    } finally {
      setIsAddingComment(false)
    }
  }, [selectedImage, newComment, isAddingComment, comments, session, saveInteractionToLocal])

  // 评论点赞处理 - 纯本地存储
  const handleCommentLike = useCallback((commentId: string) => {
    if (!selectedImage) return
    
    try {
      // 立即更新UI并保存到本地
      const updateCommentLike = (comment: any) => {
        if (comment.id === commentId) {
          const newLikedState = !comment.isLiked
          const newLikesCount = newLikedState ? comment.likes + 1 : Math.max(0, comment.likes - 1)
          return { ...comment, isLiked: newLikedState, likes: newLikesCount }
        }
        return comment
      }
      
      const updatedComments = comments.map(updateCommentLike)
      setComments(updatedComments)
      
      // 保存到localStorage
      const imageId = selectedImage.id.toString()
      localStorage.setItem(`gallery_comments_data_${imageId}`, JSON.stringify(updatedComments))
      
      console.log('✨ 评论点赞完成，已保存到本地')
    } catch (error) {
      console.warn('⚠️ 评论点赞本地保存异常:', error)
    }
  }, [comments, selectedImage])

  // 分享功能
  const handleShare = useCallback(async () => {
    if (!selectedImage) return
    
    console.log('🔄 开始分享:', selectedImage.title)
    setIsSharing(true)
    setShareStatus('copying')
    
    const shareUrl = `${window.location.origin}/gallery#image-${selectedImage.id}`
    const shareData = {
      title: `${selectedImage.title} - AIMAGICA Gallery`,
      text: `🎨 Amazing AI artwork: "${selectedImage.title}" by ${selectedImage.author}\n✨ Created with AI magic - check it out in our gallery!`,
      url: shareUrl
    }

    console.log('📱 移动端状态:', isMobile)
    console.log('🌐 Navigator.share支持:', !!navigator.share)

    try {
      // 优先尝试原生分享（移动端）
      if (navigator.share && (isMobile || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
        console.log('📤 使用原生分享')
        await navigator.share(shareData)
        setShareStatus('shared')
        console.log('✅ 原生分享成功')
      } else {
        // 降级到复制链接
        console.log('📋 复制链接到剪贴板')
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl)
          setShareStatus('copied')
          console.log('✅ 复制成功')
        } else {
          // 降级到传统复制方法
          const textArea = document.createElement('textarea')
          textArea.value = shareUrl
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          setShareStatus('copied')
          console.log('✅ 传统复制成功')
        }
      }
      setTimeout(() => setShareStatus('idle'), 3000)
    } catch (error) {
      console.error('❌ 分享失败:', error)
      // 分享失败时尝试复制链接
      try {
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setShareStatus('copied')
        console.log('✅ 降级复制成功')
      } catch (copyError) {
        console.error('❌ 复制也失败了:', copyError)
        alert(`分享链接: ${shareUrl}`)
      }
      setTimeout(() => setShareStatus('idle'), 3000)
    }
    
    setIsSharing(false)
  }, [selectedImage, isMobile])

  // 下载功能
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

  // 渲染单个图片项
  const renderItem = useCallback((item: WaterfallItem, index: number) => {
    const image = item as EnhancedGalleryImage & { height?: number }
    return (
      <LazyGalleryImage
        key={image.id}
        id={image.id}
        url={image.url}
        title={image.title}
        author={image.author}
        likes={image.localLikes} // 使用本地状态
        views={image.localViews}
        isPremium={image.isPremium}
        isFeatured={image.isFeatured}
        isLiked={image.localIsLiked}
        createdAt={image.createdAt}
        size={image.size}
        rotation={image.rotation}
        onClick={() => handleImageClick(image)}
        priority={index < 8} // 优先加载首屏图片
        waterfallHeight={image.height}
      />
    )
  }, [handleImageClick])

  return (
    <div className="min-h-screen bg-black">
      {/* 导航栏 */}
      <header className="p-4 md:p-6 bg-[#0a0a0a] border-b border-[#333] sticky top-0 z-50">
        <div className="container mx-auto">
          {/* 移动端：上下布局，避免搜索框挡住logo */}
          <div className="md:hidden">
            {/* Logo行 */}
            <div className="flex items-center justify-center mb-3">
              <div className="flex items-center space-x-3 cursor-pointer transform hover:scale-105 transition-all">
                <div className="relative">
                  <img
                    src={logoUrl}
                    alt="AIMAGICA"
                    className="w-8 h-8 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-all"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a574] rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg font-black text-white transform -rotate-1" style={{ textShadow: "2px 2px 0px #333" }}>
                    AIMAGICA
                  </h1>
                  <p className="text-xs text-gray-400 transform rotate-1">Gallery ✨</p>
                </div>
              </div>
            </div>
            
            {/* 搜索行 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search magical art..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-[#1a1a1a] border-2 border-[#444] text-white placeholder:text-gray-400 rounded-xl font-bold"
              />
            </div>
          </div>

          {/* 桌面端：左右布局 */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center space-x-3 cursor-pointer transform hover:scale-105 transition-all">
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="AIMAGICA"
                  className="w-10 h-10 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-all"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a574] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-black text-white transform -rotate-1" style={{ textShadow: "2px 2px 0px #333" }}>
                  AIMAGICA
                </h1>
                <p className="text-xs text-gray-400 transform rotate-1">Gallery ✨</p>
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
        {/* 过滤器标签 */}
        <div className="mb-8 flex flex-wrap gap-4 items-start">
          <Tabs value={filter} onValueChange={setFilter} className="flex-1 min-w-[200px]">
            <TabsList className="bg-[#1a1a1a] border-2 border-[#444] rounded-xl p-1 flex flex-wrap gap-1">
              <TabsTrigger value="all" className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-1 hover:scale-105 transition-all">
                All Magic
              </TabsTrigger>
              <TabsTrigger value="fantasy" className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-0.5 hover:scale-105 transition-all">
                Fantasy 🧙‍♂️
              </TabsTrigger>
              {/* 移动端隐藏部分过滤器，保持界面简洁 */}
              <TabsTrigger value="cyberpunk" className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-0.5 hover:scale-105 transition-all">
                Cyberpunk 🤖
              </TabsTrigger>
              <TabsTrigger value="sci-fi" className="hidden md:flex rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-1 hover:scale-105 transition-all">
                Sci-Fi 🚀
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 状态信息 - 仅在搜索时显示 */}
        {searchQuery && (
          <motion.div 
            className="mb-6 bg-[#1a1a1a] rounded-xl p-3 border-2 border-[#444]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="bg-[#2a2a2a] text-gray-300 text-sm">
                🔍 "{searchQuery}"
              </Badge>
            </div>
          </motion.div>
        )}

        {/* 瀑布流画廊 */}
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
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">Nothing found</h3>
            <p className="text-gray-400">Try different search or filter</p>
            <button 
              onClick={() => {
                setFilter('all')
                setSearchQuery('')
              }}
              className="mt-4 px-4 py-2 bg-[#d4a574] text-black font-bold rounded-lg hover:bg-[#c19660] transition-colors"
            >
              Show All
            </button>
          </motion.div>
        )}
      </div>

      {/* 图片详情对话框 - 同原版本 */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => {
        if (!open) setSelectedImage(null)
      }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] bg-black p-0 rounded-2xl border-4 border-[#333] shadow-2xl overflow-hidden flex flex-col">
          <DialogTitle style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
            {selectedImage?.title || "Image Details"}
          </DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-1 min-h-0">
            {/* 图片侧 */}
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

            {/* 详情侧 */}
            <div className="p-4 md:p-6 overflow-y-auto bg-[#0a0a0a] flex-1 min-h-0">
              {selectedImage && (
                <>
                  <DialogHeader className="border-b border-[#333] pb-4 mb-4">
                    <DialogTitle className="text-xl font-black text-white">
                      {selectedImage.title}
                    </DialogTitle>
                  </DialogHeader>

                  {/* 统计信息 - 使用本地数据 */}
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

                  {/* 提示词 */}
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

                  {/* 标签 */}
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

                  {/* 操作按钮 */}
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

                  {/* 评论区域 - 仅桌面端显示 */}
                  <div className="hidden md:block">
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