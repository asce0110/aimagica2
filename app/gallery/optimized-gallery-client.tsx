"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ThumbsUp
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

interface Comment {
  id: string | number
  author: string
  authorAvatar: string
  content: string
  likes: number
  createdAt: string
  isLiked?: boolean
}

const sampleComments: Comment[] = [
  {
    id: 1,
    author: "ArtLover",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=AL",
    content: "This is absolutely stunning! The colors are magical! ✨",
    createdAt: "2 hours ago",
    likes: 24,
    isLiked: false,
  },
  {
    id: 2,
    author: "CreativeSoul",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=CS",
    content: "How did you create this masterpiece? The details are incredible!",
    createdAt: "1 day ago",
    likes: 18,
    isLiked: true,
  },
  {
    id: 3,
    author: "DigitalDreamer",
    authorAvatar: "/placeholder.svg?height=40&width=40&text=DD",
    content: "I'm inspired to create something similar. Thanks for sharing your art!",
    createdAt: "3 days ago",
    likes: 12,
    isLiked: false,
  },
]

/**
 * 高性能Gallery客户端组件
 * 
 * 特性：
 * 1. 虚拟瀑布流布局
 * 2. 分页加载机制
 * 3. SEO友好的首屏渲染
 * 4. 懒加载图片
 * 5. 响应式设计
 */
export default function OptimizedGalleryClient() {
  const { data: session } = useSession()
  const logoUrl = useStaticUrl('/images/aimagica-logo.png')

  // 数据状态
  const [allImages, setAllImages] = useState<StaticGalleryImage[]>([])
  const [isLoadingGallery, setIsLoadingGallery] = useState(true)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  
  const [displayedImages, setDisplayedImages] = useState<StaticGalleryImage[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // UI状态
  const [selectedImage, setSelectedImage] = useState<StaticGalleryImage | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  
  // 功能状态
  const [isSharing, setIsSharing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied' | 'shared'>('idle')

  // 加载Gallery数据
  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setIsLoadingGallery(true)
        setGalleryError(null)
        
        console.log('🎯 开始加载Gallery数据库数据...')
        
        // 设置超时和重试机制
        const apiUrls = [
          'https://aimagica-api.403153162.workers.dev/api/gallery/public',
          'https://aimagica-api.403153162.workers.dev/api/gallery/public?limit=20'
        ]
        
        let data = null
        let lastError = null
        
        for (const apiUrl of apiUrls) {
          try {
            console.log(`🔄 尝试API: ${apiUrl}`)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
            
            const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            
            if (!response.ok) {
              throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
            }
            
            data = await response.json()
            console.log('✅ Gallery数据库数据加载成功:', data)
            break // 成功获取数据，跳出循环
            
          } catch (error) {
            console.warn(`⚠️ API ${apiUrl} 失败:`, error)
            lastError = error
            continue // 尝试下一个URL
          }
        }
        
        // 如果所有API都失败，直接使用静态数据
        if (!data) {
          throw lastError || new Error('所有API都失败')
        }
        
        // 转换API数据格式为组件需要的格式
        if (data.success && Array.isArray(data.data)) {
          const transformedImages: StaticGalleryImage[] = data.data.map((img: any) => ({
            id: img.id,
            url: img.url,
            title: img.title || 'Untitled',
            author: img.author || 'Anonymous',
            authorAvatar: img.authorAvatar || '/images/aimagica-logo.png',
            likes: img.likes || 0,
            comments: img.comments || 0,
            views: img.views || 0,
            downloads: img.downloads || 0,
            isPremium: img.isPremium || false,
            isFeatured: img.isFeatured || false,
            isLiked: img.isLiked || false,
            createdAt: img.createdAt || new Date().toLocaleDateString(),
            prompt: img.prompt || 'No prompt available',
            style: img.style || 'AI Art',
            tags: Array.isArray(img.tags) ? img.tags : [],
            size: img.size || 'medium',
            rotation: img.rotation || 0
          }))
          
          setAllImages(transformedImages)
          console.log(`🎯 Gallery数据库数据处理完成: ${transformedImages.length}张图片`)
        } else {
          console.warn('⚠️ API返回数据格式异常，降级到静态数据')
          throw new Error('API数据格式异常')
        }
      } catch (error) {
        console.error('❌ Gallery数据库加载失败，降级到静态数据:', error)
        setGalleryError(error instanceof Error ? error.message : '加载失败')
        
        // 立即降级到静态数据，确保用户看到内容
        console.log('📦 立即加载静态数据...')
        try {
          const staticData = getStaticGalleryData()
          if (staticData && staticData.length > 0) {
            setAllImages(staticData)
            console.log('📦 降级使用静态数据:', staticData.length, '张图片')
          } else {
            // 如果静态数据也为空，创建基本的展示数据
            console.log('📦 创建基本展示数据...')
            const fallbackData = [
              {
                id: 'demo-1',
                url: '/images/examples/magic-forest.svg',
                title: '魔法森林',
                author: 'AIMAGICA',
                authorAvatar: '/images/aimagica-logo.png',
                likes: 1243,
                comments: 89,
                views: 5678,
                downloads: 432,
                isPremium: false,
                isFeatured: true,
                isLiked: false,
                createdAt: '2 days ago',
                prompt: 'A magical forest with glowing mushrooms and fairy lights',
                style: 'Fantasy',
                tags: ['forest', 'magic', 'fantasy'],
                size: 'vertical',
                rotation: 2,
              },
              {
                id: 'demo-2',
                url: '/images/examples/cyber-city.svg', 
                title: '赛博朋克城市',
                author: 'AIMAGICA',
                authorAvatar: '/images/aimagica-logo.png',
                likes: 982,
                comments: 56,
                views: 4321,
                downloads: 321,
                isPremium: false,
                isFeatured: false,
                isLiked: false,
                createdAt: '1 week ago',
                prompt: 'Futuristic cyberpunk cityscape with neon lights',
                style: 'Cyberpunk',
                tags: ['cyberpunk', 'city', 'neon'],
                size: 'horizontal',
                rotation: -1,
              }
            ]
            setAllImages(fallbackData as StaticGalleryImage[])
            console.log('📦 使用基本展示数据:', fallbackData.length, '张图片')
          }
        } catch (staticError) {
          console.error('❌ 连静态数据都失败了:', staticError)
          setAllImages([]) // 设置为空数组，让UI显示"无内容"提示
        }
      } finally {
        setIsLoadingGallery(false)
      }
    }
    
    // 立即开始加载，不等待
    loadGalleryData()
  }, [])

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 过滤和搜索逻辑
  const filteredImages = useMemo(() => {
    let result = allImages

    // 样式过滤
    if (filter !== "all") {
      result = result.filter(image => 
        image.style.toLowerCase() === filter.toLowerCase()
      )
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(image =>
        image.title.toLowerCase().includes(query) ||
        image.author.toLowerCase().includes(query) ||
        image.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    console.log(`🔍 过滤结果: ${result.length}张图片 (filter: ${filter}, search: "${searchQuery}")`)
    return result
  }, [allImages, filter, searchQuery])

  // 初始化首屏数据
  useEffect(() => {
    const initialImages = filteredImages.slice(0, INITIAL_LOAD)
    setDisplayedImages(initialImages)
    setCurrentPage(1)
    console.log(`📦 初始化显示: ${initialImages.length}张图片`)
  }, [filteredImages])

  // 处理分享链接中的图片ID hash，自动打开对应图片详情
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash.startsWith('#image-')) {
        const imageId = hash.replace('#image-', '')
        console.log(`🔗 检测到分享链接，尝试打开图片: ${imageId}`)
        
        // 在所有图片中查找对应ID的图片
        const targetImage = allImages.find(img => img.id === imageId)
        if (targetImage) {
          setSelectedImage(targetImage)
          console.log(`✅ 成功打开分享的图片: ${targetImage.title}`)
          // 清除hash以保持URL整洁
          setTimeout(() => {
            window.history.replaceState(null, '', window.location.pathname + window.location.search)
          }, 1000)
        } else {
          console.log(`❌ 未找到ID为 ${imageId} 的图片`)
        }
      }
    }

    // 页面加载时检查hash
    handleHashChange()
    
    // 监听hash变化
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

    if (newImages.length === 0) {
      console.log('📄 没有更多图片可加载')
      return
    }

    setLoading(true)
    console.log(`📄 加载第${nextPage}页: ${newImages.length}张新图片`)

    // 模拟加载延迟，提升用户体验
    setTimeout(() => {
      setDisplayedImages(prev => [...prev, ...newImages])
      setCurrentPage(nextPage)
      setLoading(false)
      console.log(`✅ 加载完成，总计显示: ${displayedImages.length + newImages.length}张图片`)
    }, 800)
  }, [loading, currentPage, filteredImages, displayedImages.length])

  // 是否还有更多数据
  const hasMore = displayedImages.length < filteredImages.length

  // 转换为瀑布流数据格式 - 桌面端真正的瀑布流效果
  const waterfallItems: WaterfallItem[] = useMemo(() => {
    return displayedImages.map((image, index) => {
      // 桌面端：创造更大的高度差异以形成真正的瀑布流效果
      // 移动端：保持适中的差异便于浏览
      const getItemHeight = () => {
        if (isMobile) {
          // 移动端保持较小的差异
          if (image.size === 'vertical') return 350
          if (image.size === 'horizontal') return 200
          if (image.size === 'large') return 380
          if (image.size === 'small') return 250
          return 300 // medium默认
        } else {
          // 桌面端：创造明显的高度差异形成瀑布流
          const baseHeights = {
            'vertical': 550,    // 高图片
            'horizontal': 300,  // 宽图片(矮)
            'large': 600,      // 大图片
            'small': 350,      // 小图片
            'medium': 450      // medium默认
          }
          
          const baseHeight = baseHeights[image.size] || 450
          
          // 添加一些随机变化，让每张图片高度都略有不同
          const variation = (index % 5) * 25 - 50 // -50 到 +50 的变化
          const finalHeight = Math.max(280, baseHeight + variation) // 最小高度280
          
          return finalHeight
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

  // 增加预览量
  const incrementViews = useCallback(async (imageId: string | number) => {
    console.log(`👁️ 增加预览量: ${imageId}`)
    
    // 立即更新本地状态
    const updateViews = (img: any) => 
      img.id === imageId ? { ...img, views: img.views + 1 } : img
    
    setDisplayedImages(prev => prev.map(updateViews))
    setAllImages(prev => prev.map(updateViews))
    
    // 后台异步尝试调用API（失败不影响UI）
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超时
      
      const imageDetailUrl = `https://aimagica-api.403153162.workers.dev/api/gallery/${imageId}`
      const response = await fetch(imageDetailUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ 预览量API调用成功:', result)
      }
    } catch (error) {
      console.warn('⚠️ 预览量API调用失败，但本地状态已更新:', error.message)
    }
  }, [])

  // 图片点击处理
  const handleImageClick = useCallback((image: StaticGalleryImage) => {
    setSelectedImage(image)
    console.log(`🖼️ 打开图片详情: ${image.title}`)
    // 加载该图片的评论
    loadComments(image.id)
    // 增加预览量
    incrementViews(image.id)
  }, [incrementViews])

  // 点赞处理 - 优先本地状态，异步同步数据库
  const handleLike = useCallback(async (id: string | number) => {
    console.log(`❤️ 点赞图片: ${id}`)
    
    // 立即更新UI状态，提供即时反馈
    const currentImage = displayedImages.find(img => img.id === id) || selectedImage
    if (!currentImage) return
    
    const newLikedState = !currentImage.isLiked
    const newLikesCount = newLikedState ? currentImage.likes + 1 : Math.max(0, currentImage.likes - 1)
    
    console.log(`❤️ 立即更新UI: ${newLikedState ? '点赞' : '取消点赞'}, 新点赞数: ${newLikesCount}`)
    
    // 更新所有相关状态
    const updateImageState = (img: any) => 
      img.id === id ? { ...img, isLiked: newLikedState, likes: newLikesCount } : img
    
    setDisplayedImages(prev => prev.map(updateImageState))
    setAllImages(prev => prev.map(updateImageState))
    
    if (selectedImage && selectedImage.id === id) {
      setSelectedImage(prev => prev ? updateImageState(prev) : null)
    }
    
    // 后台异步尝试同步到数据库（失败不影响UI）
    try {
      console.log('📶 后台尝试同步到数据库...')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时
      
      const galleryItemUrl = `https://aimagica-api.403153162.workers.dev/api/gallery/${id}`
      const response = await fetch(galleryItemUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'toggle_like'
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ 数据库同步成功:', result)
      } else {
        console.warn('⚠️ 数据库同步失败，但UI已更新')
      }
    } catch (error) {
      console.warn('⚠️ 数据库同步异常，但UI已更新:', error.message)
      // 不影响用户体验，UI状态已经更新
    }
  }, [displayedImages, selectedImage])

  // 加载评论数据
  const loadComments = useCallback(async (imageId: string | number) => {
    try {
      setIsLoadingComments(true)
      console.log(`💬 加载评论: ${imageId}`)
      
      // 直接从Workers API获取详细数据（包括评论）
      const imageDetailUrl = `https://aimagica-api.403153162.workers.dev/api/gallery/${imageId}`
      const response = await fetch(imageDetailUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('💬 API返回的评论数据:', data)
        
        if (data.commentsData && Array.isArray(data.commentsData) && data.commentsData.length > 0) {
          const transformedComments: Comment[] = data.commentsData.map((comment: any) => ({
            id: comment.id,
            author: comment.author || 'Anonymous',
            authorAvatar: comment.authorAvatar || '/images/aimagica-logo.png',
            content: comment.content,
            likes: comment.likes || 0,
            createdAt: comment.createdAt || new Date().toLocaleDateString(),
            isLiked: comment.isLiked || false
          }))
          setComments(transformedComments)
          console.log(`✅ 评论加载成功: ${transformedComments.length}条`)
        } else {
          console.log('💬 API返回空评论，使用示例数据')
          setComments(sampleComments) // 降级到示例数据
        }
      } else {
        console.warn('⚠️ 评论加载失败，使用示例数据')
        setComments(sampleComments)
      }
    } catch (error) {
      console.error('❌ 评论加载失败:', error)
      console.log('💬 评论加载失败，使用示例数据')
      setComments(sampleComments) // 降级到示例数据
    } finally {
      setIsLoadingComments(false)
    }
  }, [])

  // 评论点赞功能 - 暂时使用本地状态
  const handleCommentLike = useCallback(async (commentId: string | number) => {
    console.log(`👍 评论点赞: ${commentId}`)
    
    try {
      // 暂时使用本地状态更新，因为评论点赞API还未实现
      console.log('⚠️ 评论点赞API未实现，使用本地状态更新')
      
      // 直接更新本地状态
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
              }
            : comment
        )
      )
    } catch (error) {
      console.error('❌ 评论点赞请求失败:', error)
      // 降级到本地状态更新
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
              }
            : comment
        )
      )
    }
  }, [])

  // 分享功能
  const handleShare = useCallback(async () => {
    if (!selectedImage) return
    
    setIsSharing(true)
    console.log(`🔗 分享图片: ${selectedImage.title}`)
    
    // 生成有效的分享链接 - 包含图片ID参数，支持直接打开特定图片
    const shareUrl = `${window.location.origin}/gallery#image-${selectedImage.id}`
    const shareData = {
      title: `${selectedImage.title} - AIMAGICA Gallery`,
      text: `🎨 Amazing AI artwork: "${selectedImage.title}" by ${selectedImage.author}\n✨ Created with AI magic - check it out in our gallery!`,
      url: shareUrl
    }

    // 复制链接的通用函数
    const copyToClipboard = async (url: string) => {
      try {
        await navigator.clipboard.writeText(url)
        setShareStatus('copying')
        setTimeout(() => setShareStatus('copied'), 100)
        setTimeout(() => setShareStatus('idle'), 2000)
        console.log('✅ 链接已复制到剪贴板:', url)
        return true
      } catch (clipboardError) {
        console.error('❌ 复制链接失败:', clipboardError)
        // 最后的降级方案：创建临时input元素
        try {
          const textArea = document.createElement('textarea')
          textArea.value = url
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          
          setShareStatus('copying')
          setTimeout(() => setShareStatus('copied'), 100)
          setTimeout(() => setShareStatus('idle'), 2000)
          console.log('✅ 使用降级方法复制链接成功:', url)
          return true
        } catch (fallbackError) {
          console.error('❌ 所有复制方法都失败了:', fallbackError)
          return false
        }
      }
    }

    try {
      // 优先使用原生分享 API (移动端且支持的情况)
      if (navigator.share && isMobile) {
        try {
          await navigator.share(shareData)
          console.log('✅ 原生分享成功')
          setShareStatus('shared')
          setTimeout(() => setShareStatus('idle'), 2000)
          setIsSharing(false)
          return
        } catch (shareError) {
          console.log('📱 原生分享失败，降级到复制链接:', shareError)
          // 原生分享失败，降级到复制链接
        }
      }
      
      // 桌面端或原生分享失败时，复制链接
      const copySuccess = await copyToClipboard(shareUrl)
      if (!copySuccess) {
        // 如果复制也失败了，至少显示链接给用户
        alert(`Please copy this link to share: ${shareUrl}`)
      }
    } catch (error) {
      console.error('❌ 分享功能完全失败:', error)
      // 最后的降级：显示链接
      alert(`Please copy this link to share: ${shareUrl}`)
    }
    
    setIsSharing(false)
  }, [selectedImage, isMobile])

  // 下载功能
  const handleDownload = useCallback(async () => {
    if (!selectedImage) return
    
    setIsDownloading(true)
    console.log(`💾 下载图片: ${selectedImage.title}`)
    
    try {
      const response = await fetch(selectedImage.url)
      const blob = await response.blob()
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 生成文件名
      const fileName = `aimagica-${selectedImage.title.replace(/[^a-zA-Z0-9]/g, '-')}-${selectedImage.id}.png`
      link.download = fileName
      
      // 触发下载
      document.body.appendChild(link)
      link.click()
      
      // 清理
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('✅ 图片下载成功:', fileName)
    } catch (error) {
      console.error('❌ 图片下载失败:', error)
      
      // 降级处理：在新窗口打开图片
      window.open(selectedImage.url, '_blank')
    }
    
    setIsDownloading(false)
  }, [selectedImage])

  // 渲染单个图片项
  const renderItem = useCallback((item: WaterfallItem, index: number) => {
    const image = item as StaticGalleryImage & { height?: number }
    return (
      <LazyGalleryImage
        key={image.id}
        id={image.id}
        url={image.url}
        title={image.title}
        author={image.author}
        likes={image.likes}
        views={image.views}
        isPremium={image.isPremium}
        isFeatured={image.isFeatured}
        isLiked={image.isLiked}
        createdAt={image.createdAt}
        size={image.size}
        rotation={image.rotation}
        onClick={() => handleImageClick(image)}
        priority={index < 4} // 前4张图片优先加载
        waterfallHeight={image.height} // 传递瀑布流高度
      />
    )
  }, [handleImageClick])

  return (
    <div className="min-h-screen bg-black">
      {/* 导航栏 */}
      <header className="p-4 md:p-6 bg-[#0a0a0a] border-b border-[#333] sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            {/* Logo和品牌 */}
            <div className="flex items-center space-x-3 cursor-pointer transform hover:scale-105 transition-all">
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="AIMAGICA"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-all"
                  onError={(e) => {
                    console.error('🖼️ Gallery logo加载失败:', logoUrl)
                    const target = e.currentTarget as HTMLImageElement
                    if (!target.src.includes('placeholder-logo')) {
                      target.src = '/placeholder-logo.png'
                    }
                  }}
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a574] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1
                  className="text-lg md:text-xl font-black text-white transform -rotate-1"
                  style={{ textShadow: "2px 2px 0px #333" }}
                >
                  AIMAGICA
                </h1>
                <p className="text-xs text-gray-400 transform rotate-1">
                  Magic Gallery ✨
                </p>
              </div>
            </div>

            {/* 搜索框 */}
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
              <TabsTrigger
                value="all"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-1 hover:scale-105 transition-all"
              >
                All Magic
              </TabsTrigger>
              <TabsTrigger
                value="fantasy"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-0.5 hover:scale-105 transition-all"
              >
                Fantasy 🧙‍♂️
              </TabsTrigger>
              <TabsTrigger
                value="cyberpunk"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-0.5 hover:scale-105 transition-all"
              >
                Cyberpunk 🤖
              </TabsTrigger>
              <TabsTrigger
                value="sci-fi"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-1 hover:scale-105 transition-all"
              >
                Sci-Fi 🚀
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 统计信息 */}
        <motion.div 
          className="mb-6 flex items-center justify-between bg-[#1a1a1a] rounded-xl p-4 border-2 border-[#444]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#d4a574]" />
              <span className="text-white font-bold">
                {isLoadingGallery ? 'Loading...' : `${displayedImages.length} of ${filteredImages.length} artworks`}
              </span>
            </div>
            {galleryError && (
              <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500">
                Database fallback
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
            <span>{galleryError ? 'Static gallery' : 'Database gallery'}</span>
          </div>
        </motion.div>

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

        {/* 无内容提示 */}
        {filteredImages.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-white mb-2">No artworks found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>

      {/* 图片详情对话框 */}
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
                    <h2
                      className="text-lg md:text-xl font-black text-white mb-1 transform -rotate-1"
                      style={{ textShadow: "2px 2px 0px #333" }}
                    >
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
                      <p className="text-[#d4a574] font-bold text-sm">
                        by {selectedImage.author}
                      </p>
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

                  {/* 统计信息 */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button
                      size="sm"
                      onClick={() => handleLike(selectedImage.id)}
                      className={`flex items-center space-x-1 transform rotate-1 ${
                        selectedImage.isLiked
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"
                      } font-bold rounded-lg border-2 border-[#444]`}
                      style={{ boxShadow: "2px 2px 0 #333" }}
                    >
                      <Heart className="w-4 h-4" fill={selectedImage.isLiked ? "currentColor" : "none"} />
                      <span>{selectedImage.likes}</span>
                    </Button>

                    <span
                      className="flex items-center text-gray-300 font-bold transform -rotate-1 bg-[#1a1a1a] px-2 py-1 rounded-lg border-2 border-[#444]"
                      style={{ boxShadow: "1px 1px 0 #333" }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {selectedImage.comments}
                    </span>

                    <span
                      className="flex items-center text-gray-300 font-bold transform rotate-0.5 bg-[#1a1a1a] px-2 py-1 rounded-lg border-2 border-[#444]"
                      style={{ boxShadow: "1px 1px 0 #333" }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {selectedImage.views}
                    </span>

                    <span className="ml-auto text-gray-400 font-bold text-sm transform -rotate-1">
                      {selectedImage.createdAt}
                    </span>
                  </div>

                  {/* 提示词 */}
                  <div className="mb-6 transform rotate-0.5">
                    <h3
                      className="text-white font-black mb-3 transform -rotate-1"
                      style={{ textShadow: "1px 1px 0px #333" }}
                    >
                      Magic Prompt ✨
                    </h3>
                    <div
                      className="p-4 bg-[#1a1a1a] border-2 border-[#444] shadow-md"
                      style={{
                        borderRadius: "16px",
                        clipPath: "polygon(0% 0%, 100% 2%, 99% 98%, 1% 100%)",
                      }}
                    >
                      <p className="text-gray-200 font-bold text-sm leading-relaxed">
                        "{selectedImage.prompt}"
                      </p>
                    </div>
                  </div>

                  {/* 标签 */}
                  <div className="mb-6">
                    <h3
                      className="text-white font-black mb-3 transform rotate-0.5"
                      style={{ textShadow: "1px 1px 0px #333" }}
                    >
                      Magic Tags 🏷️
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className="bg-[#d4a574] text-black font-black transform rotate-1"
                        style={{ boxShadow: "1px 1px 0 #333" }}
                      >
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

                  {/* 评论区域 */}
                  <div>
                    <h3
                      className="text-white font-black mb-4 transform -rotate-0.5"
                      style={{ textShadow: "1px 1px 0px #333" }}
                    >
                      Magic Comments 💬
                      {isLoadingComments && (
                        <span className="text-sm text-gray-400 ml-2">Loading...</span>
                      )}
                    </h3>

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
                                    {comment.createdAt}
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
                                  <span className="text-gray-400 font-bold text-xs">
                                    Reply
                                  </span>
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