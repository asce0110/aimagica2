"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Heart, 
  Download, 
  Share2, 
  Search, 
  Filter, 
  Eye, 
  MessageCircle,
  User,
  Star,
  Crown,
  Send,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wand2,
  Palette,
  Camera,
  Users,
  TrendingUp,
  Clock,
  ThumbsUp,
  ExternalLink,
  Copy,
  Check,
  Menu
} from "lucide-react"
import { useSessionCompat as useSession } from "@/components/session-provider"
import { getProxiedAvatarUrl, getFallbackAvatarUrl } from "@/lib/utils/avatar"
import MagicImage from "@/components/ui/magic-image"
import SimpleGalleryImage from "@/components/ui/simple-gallery-image"
import RobustGalleryImage from "@/components/ui/robust-gallery-image"
import SimpleImage from "@/components/ui/simple-image"
import { getStaticGalleryData, type StaticGalleryImage } from "@/lib/static-gallery-data"
import useStaticUrl from "@/hooks/use-static-url"
import { getSmartImageUrl, preloadNewImages, getImageLoadingProps, preloadLocalMappedImages } from "@/lib/smart-image-url"
import { useRouter } from "next/navigation"
// import { browserCacheManager } from "@/lib/browser-cache-manager" // 临时禁用

// 使用静态Gallery数据类型
type GalleryImage = StaticGalleryImage

interface Comment {
  id: string | number
  author: string
  authorAvatar: string
  content: string
  likes: number
  isLiked: boolean
  createdAt: string
  replies?: Comment[]
}

// 静态示例数据作为备用
const galleryImages: GalleryImage[] = [
  {
    id: 1,
    url: "/images/examples/magic-forest.svg",
    title: "Enchanted Forest",
    author: "DreamWeaver",
    authorAvatar: "/placeholder-user.jpg",
    likes: 1243,
    comments: 89,
    views: 5678,
    downloads: 432,
    isPremium: false,
    isFeatured: true,
    isLiked: false,
    createdAt: "2 days ago",
    prompt: "A magical forest with glowing mushrooms, fairy lights, and mystical creatures hiding among ancient trees",
    style: "Fantasy",
    tags: ["forest", "magic", "fantasy", "glow", "mystical"],
    size: "vertical",
    rotation: 2,
  },
  {
    id: 2,
    url: "/images/examples/cyber-city.svg",
    title: "Neo Tokyo 2099",
    author: "CyberArtist",
    authorAvatar: "/placeholder-user.jpg",
    likes: 982,
    comments: 56,
    views: 4321,
    downloads: 321,
    isPremium: true,
    isFeatured: false,
    isLiked: true,
    createdAt: "1 week ago",
    prompt: "Futuristic cyberpunk cityscape with neon lights, flying cars, and holographic advertisements",
    style: "Cyberpunk",
    tags: ["cyberpunk", "city", "future", "neon", "scifi"],
    size: "horizontal",
    rotation: -1,
  },
  {
    id: 3,
    url: "/images/examples/space-art.svg",
    title: "Space Explorer",
    author: "StarGazer",
    authorAvatar: "/placeholder-user.jpg",
    likes: 756,
    comments: 42,
    views: 3210,
    downloads: 198,
    isPremium: false,
    isFeatured: false,
    isLiked: false,
    createdAt: "3 days ago",
    prompt: "Astronaut exploring an alien planet with strange flora and multiple moons in the sky",
    style: "Sci-Fi",
    tags: ["space", "astronaut", "alien", "planet", "exploration"],
    size: "small",
    rotation: 1.5,
  },
  {
    id: 4,
    url: "/images/examples/cat-wizard.svg",
    title: "Atlantis Dreams",
    author: "OceanWhisperer",
    authorAvatar: "/placeholder-user.jpg",
    likes: 1567,
    comments: 103,
    views: 6789,
    downloads: 543,
    isPremium: true,
    isFeatured: true,
    isLiked: false,
    createdAt: "5 days ago",
    prompt: "Underwater kingdom with mermaids, coral palaces, and bioluminescent sea creatures",
    style: "Fantasy",
    tags: ["underwater", "mermaid", "ocean", "kingdom", "fantasy"],
    size: "medium",
    rotation: -2,
  },
  {
    id: 5,
    url: "/placeholder.svg?height=300&width=300&text=Dragon+Rider",
    title: "Dragon Rider",
    author: "MythMaker",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=MM",
    likes: 2134,
    comments: 167,
    views: 8765,
    downloads: 876,
    isPremium: true,
    isFeatured: true,
    isLiked: false,
    createdAt: "1 day ago",
    prompt: "Warrior riding a majestic dragon over mountain peaks during sunset",
    style: "Fantasy",
    tags: ["dragon", "warrior", "fantasy", "mountains", "epic"],
    size: "small",
    rotation: 3,
  },
  {
    id: 6,
    url: "/placeholder.svg?height=300&width=400&text=Cherry+Blossom",
    title: "Sakura Path",
    author: "ZenArtist",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=ZA",
    likes: 1876,
    comments: 92,
    views: 7654,
    downloads: 654,
    isPremium: false,
    isFeatured: false,
    isLiked: true,
    createdAt: "2 weeks ago",
    prompt: "Japanese garden path with cherry blossoms in full bloom and traditional temple in background",
    style: "Watercolor",
    tags: ["japan", "cherry blossom", "garden", "peaceful", "spring"],
    size: "horizontal",
    rotation: -1.5,
  },
  {
    id: 7,
    url: "/placeholder.svg?height=400&width=300&text=Ancient+Temple",
    title: "Lost Temple",
    author: "AdventureSeeker",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=AS",
    likes: 1432,
    comments: 78,
    views: 5432,
    downloads: 432,
    isPremium: false,
    isFeatured: false,
    isLiked: false,
    createdAt: "4 days ago",
    prompt: "Ancient temple ruins covered in jungle vegetation with mysterious glowing symbols",
    style: "Realistic",
    tags: ["temple", "ruins", "jungle", "ancient", "mystery"],
    size: "vertical",
    rotation: 1,
  },
  {
    id: 8,
    url: "/placeholder.svg?height=400&width=400&text=Northern+Lights",
    title: "Aurora Magic",
    author: "NorthernSoul",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=NS",
    likes: 2345,
    comments: 145,
    views: 9876,
    downloads: 765,
    isPremium: true,
    isFeatured: true,
    isLiked: false,
    createdAt: "1 week ago",
    prompt: "Spectacular northern lights dancing over a snowy landscape with pine trees and mountains",
    style: "Realistic",
    tags: ["aurora", "northern lights", "winter", "night", "nature"],
    size: "medium",
    rotation: -2.5,
  },
  {
    id: 9,
    url: "/placeholder.svg?height=300&width=300&text=Steampunk+Inventor",
    title: "Clockwork Genius",
    author: "GearMaster",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=GM",
    likes: 876,
    comments: 56,
    views: 3456,
    downloads: 234,
    isPremium: false,
    isFeatured: false,
    isLiked: false,
    createdAt: "3 weeks ago",
    prompt: "Steampunk inventor in workshop surrounded by brass gears, steam engines, and mechanical wonders",
    style: "Steampunk",
    tags: ["steampunk", "inventor", "gears", "workshop", "mechanical"],
    size: "small",
    rotation: 2.5,
  },
  {
    id: 10,
    url: "/placeholder.svg?height=300&width=400&text=Floating+Islands",
    title: "Sky Islands",
    author: "CloudWalker",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=CW",
    likes: 1654,
    comments: 87,
    views: 6543,
    downloads: 543,
    isPremium: true,
    isFeatured: false,
    isLiked: true,
    createdAt: "6 days ago",
    prompt: "Floating islands in the sky with waterfalls cascading down and airships sailing between them",
    style: "Fantasy",
    tags: ["floating islands", "sky", "fantasy", "waterfalls", "airships"],
    size: "horizontal",
    rotation: -1,
  },
  {
    id: 11,
    url: "/placeholder.svg?height=300&width=300&text=Cat+Wizard",
    title: "Whisker Wizard",
    author: "FeliFancy",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=FF",
    likes: 2876,
    comments: 198,
    views: 9432,
    downloads: 876,
    isPremium: false,
    isFeatured: true,
    isLiked: false,
    createdAt: "2 days ago",
    prompt: "Cute cat wearing wizard hat and casting colorful magic spells with a wand",
    style: "Cartoon",
    tags: ["cat", "wizard", "cute", "magic", "spells"],
    size: "small",
    rotation: 3,
  },
  {
    id: 12,
    url: "/placeholder.svg?height=300&width=400&text=Crystal+Cave",
    title: "Crystal Cavern",
    author: "GemHunter",
    authorAvatar: "/placeholder.svg?height=50&width=50&text=GH",
    likes: 1543,
    comments: 76,
    views: 6123,
    downloads: 432,
    isPremium: true,
    isFeatured: false,
    isLiked: false,
    createdAt: "1 week ago",
    prompt: "Magical crystal cave with glowing gems of various colors illuminating the darkness",
    style: "Fantasy",
    tags: ["crystal", "cave", "gems", "glow", "magic"],
    size: "horizontal",
    rotation: -2,
  },
]

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
    isLiked: false,
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

export default function GalleryClient() {
  const { data: session } = useSession()
  const router = useRouter()
  
  // 添加调试信息
  console.log('🎯 GalleryClient组件初始化')
  
  // 使用 useStaticUrl 处理图片路径
  const logoUrl = useStaticUrl('/images/aimagica-logo.png')
  const placeholderUserUrl = useStaticUrl('/placeholder-user.jpg')
  const magicForestUrl = useStaticUrl('/images/examples/magic-forest.svg')
  const cyberCityUrl = useStaticUrl('/images/examples/cyber-city.svg')
  const spaceArtUrl = useStaticUrl('/images/examples/space-art.svg')
  const catWizardUrl = useStaticUrl('/images/examples/cat-wizard.svg')
  
  // 更新静态数据以使用正确的URL
  const staticGalleryImages = useMemo(() => [
    {
      ...galleryImages[0],
      url: magicForestUrl,
      authorAvatar: placeholderUserUrl,
    },
    {
      ...galleryImages[1],
      url: cyberCityUrl,
      authorAvatar: placeholderUserUrl,
    },
    {
      ...galleryImages[2],
      url: spaceArtUrl,
      authorAvatar: placeholderUserUrl,
    },
    {
      ...galleryImages[3],
      url: catWizardUrl,
      authorAvatar: placeholderUserUrl,
    },
    ...galleryImages.slice(4).map(img => ({
      ...img,
      url: magicForestUrl, // 使用第一个图片作为备用
      authorAvatar: placeholderUserUrl,
    }))
  ], [magicForestUrl, cyberCityUrl, spaceArtUrl, catWizardUrl, placeholderUserUrl])
  
  const [images, setImages] = useState<GalleryImage[]>(() => {
    const staticData = getStaticGalleryData()
    console.log('📦 初始化静态数据:', staticData.length, '张图片')
    return staticData
  })
  const [loading, setLoading] = useState(false) // 开始时不显示加载状态，直接使用静态数据
  const [error, setError] = useState<string | null>(null)
  const [apiAttempted, setApiAttempted] = useState(false)
  const [emergencyMode, setEmergencyMode] = useState(false) // 紧急模式：完全跳过API
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [comments, setComments] = useState<Comment[]>(sampleComments)
  const [newComment, setNewComment] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [imageAspectRatios, setImageAspectRatios] = useState<{[key: string]: string}>({})

  // 预加载关键图片，提升用户体验 - 临时禁用
  // useEffect(() => {
  //   const preloadCriticalImages = async () => {
  //     const currentImages = filteredImages.slice(0, 8) // 预加载前8张
  //     const imageUrls = currentImages.map(img => img.url).filter(Boolean)
  //     
  //     if (imageUrls.length > 0) {
  //       console.log('🚀 预加载Gallery关键图片:', imageUrls.length)
  //       try {
  //         await browserCacheManager.preloadImages(imageUrls, {
  //           maxAge: 30 * 60 * 1000, // 30分钟缓存
  //           preloadPriority: 'high',
  //           retryCount: 3
  //         })
  //         console.log('✅ Gallery关键图片预加载完成')
  //       } catch (error) {
  //         console.warn('⚠️ 预加载部分失败:', error)
  //       }
  //     }
  //   }
  //   
  //   // 延迟预加载，确保不影响初始渲染
  //   setTimeout(preloadCriticalImages, 500)
  // }, [filteredImages])

  // 在后台尝试加载API数据（不阻塞UI显示）
  useEffect(() => {
    if (emergencyMode) {
      console.log('🚨 紧急模式：完全跳过API，只使用静态数据')
      return
    }
    
    if (apiAttempted) {
      console.log('⚠️ API已经尝试过，跳过重复请求')
      return // 避免重复请求
    }
    
    const fetchGalleryImages = async () => {
      try {
        setApiAttempted(true)
        console.log('🚀 开始尝试加载API数据...')
        
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
        console.log('🔗 API URL:', apiUrl)
        
        if (!apiUrl) {
          console.log('❌ Gallery API not available - keeping static data')
          return
        }
        
        console.log('📞 Calling API in background:', `${apiUrl}?limit=50`)
        
        // 添加超时控制
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒超时
        
        const response = await fetch(`${apiUrl}?limit=50`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'X-Request-Time': Date.now().toString()
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          console.warn(`Failed to fetch gallery images: ${response.statusText}`)
          return
        }
        
        const result = await response.json()
        console.log('📦 API Response:', result)
        
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          // 将API数据转换为GalleryImage格式，使用代理URL避免CORS问题
          const transformedImages = result.data.map((item: any, index: number) => ({
            id: item.id || index,
            url: item.url || item.image_url || "/placeholder.svg",
            title: item.title || item.prompt?.substring(0, 50) + "..." || "Untitled",
            author: item.author || item.user_name || "Anonymous",
            authorAvatar: item.authorAvatar || item.user_avatar || "/placeholder.svg?height=50&width=50&text=A",
            likes: item.likes || item.like_count || Math.floor(Math.random() * 1000),
            comments: item.comments || item.comment_count || Math.floor(Math.random() * 100),
            views: item.views || item.view_count || Math.floor(Math.random() * 5000),
            downloads: item.downloads || Math.floor(Math.random() * 500),
            isPremium: item.isPremium || false,
            isFeatured: item.isFeatured || item.is_featured || false,
            isLiked: item.isLiked || item.is_liked || false,
            createdAt: item.createdAt || item.created_at || "Unknown",
            prompt: item.prompt || "No prompt available",
            style: item.style || item.style_name || "Art",
            tags: item.tags || (item.prompt ? item.prompt.split(' ').slice(0, 5) : ["art"]),
            size: ["small", "medium", "large", "vertical", "horizontal"][Math.floor(Math.random() * 5)] as any,
            rotation: Math.random() * 4 - 2,
          }))
          
          setImages(transformedImages)
          console.log(`✅ Successfully loaded ${transformedImages.length} real gallery images from API`)
          
          // 预加载新上传的图片
          const newImageUrls = transformedImages.map(img => img.url).filter(Boolean)
          preloadNewImages(newImageUrls)
        }
      } catch (error) {
        console.warn('⚠️ Error fetching gallery images (continuing with static data):', error)
        
        // 如果API失败，确保使用静态数据
        const fallbackData = getStaticGalleryData()
        console.log('🔄 API失败，使用静态数据作为备用:', fallbackData.length, '张图片')
        setImages(fallbackData)
      }
    }

    // 延迟一点再尝试API，确保初始渲染不受影响
    setTimeout(fetchGalleryImages, 100)
  }, [apiAttempted])

  useEffect(() => {
    // 预加载本地映射的图片，提升静态图片加载速度
    preloadLocalMappedImages()
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 获取图片详细信息
  const fetchImageDetails = async (imageId: string | number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
      if (!apiUrl) {
        throw new Error('Gallery API not available')
      }
      
      const response = await fetch(`${apiUrl}/${imageId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch image details')
      }
      const imageDetails = await response.json()
      
      // 更新评论数据
      setComments(imageDetails.commentsData || [])
      
      // 从原始图片列表中获取size信息，避免覆盖
      const originalImage = images.find(img => img.id.toString() === imageId.toString())
      
      // 更新选中的图片信息为真实数据
      const realImageData: GalleryImage = {
        id: imageDetails.id,
        url: imageDetails.url,
        title: imageDetails.title,
        author: imageDetails.author,
        authorAvatar: imageDetails.authorAvatar,
        likes: imageDetails.likes,
        comments: imageDetails.comments,
        views: imageDetails.views,
        downloads: 0,
        isPremium: false,
        isFeatured: false,
        isLiked: imageDetails.isLiked,
        createdAt: imageDetails.createdAt,
        prompt: imageDetails.prompt,
        style: imageDetails.style,
        tags: imageDetails.tags,
        size: originalImage?.size || "medium",
        rotation: originalImage?.rotation || Math.random() * 4 - 2
      }
      
      setSelectedImage(realImageData)
      
      // 实时更新gallery列表中的浏览量和评论数
      setImages((prev) =>
        prev.map((img) =>
          img.id.toString() === imageId.toString()
            ? { 
                ...img, 
                views: imageDetails.views,
                comments: imageDetails.comments,
                likes: imageDetails.likes,
                isLiked: imageDetails.isLiked
              } 
            : img
        )
      )
      
      console.log('✅ Loaded real image details and updated gallery list:', imageDetails)
      
    } catch (error) {
      console.error('❌ Error fetching image details:', error)
      // 如果获取失败，使用原始数据
      const originalImage = images.find(img => img.id === imageId)
      if (originalImage) {
        setSelectedImage(originalImage)
      }
    }
  }

  // 过滤图片
  const filteredImages = images.filter(image => {
    const matchesFilter = filter === "all" || image.style.toLowerCase() === filter.toLowerCase()
    const matchesSearch = searchQuery === "" || 
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image)
    fetchImageDetails(image.id)
  }

  const handleLike = async (id: string | number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
      if (!apiUrl) {
        throw new Error('Gallery API not available')
      }
      
      const response = await fetch(`${apiUrl}/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle_like' })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const result = await response.json()
      
      // 更新本地状态
      setImages((prev) =>
        prev.map((img) =>
          img.id === id 
            ? { 
                ...img, 
                isLiked: result.liked, 
                likes: result.liked ? img.likes + 1 : img.likes - 1 
              } 
            : img
        )
      )

      // 如果当前选中的图片就是被点赞的图片，也更新详情页面
      if (selectedImage && selectedImage.id === id) {
        setSelectedImage(prev => prev ? {
          ...prev,
          isLiked: result.liked,
          likes: result.liked ? prev.likes + 1 : prev.likes - 1
        } : null)
      }

      console.log('✅ Like toggled successfully')
      
    } catch (error) {
      console.error('❌ Error toggling like:', error)
      // 如果请求失败，仍然更新本地状态作为临时反馈
      setImages((prev) =>
        prev.map((img) =>
          img.id === id 
            ? { 
                ...img, 
                isLiked: !img.isLiked, 
                likes: !img.isLiked ? img.likes + 1 : img.likes - 1 
              } 
            : img
        )
      )

      if (selectedImage && selectedImage.id === id) {
        setSelectedImage(prev => prev ? {
          ...prev,
          isLiked: !prev.isLiked,
          likes: !prev.isLiked ? prev.likes + 1 : prev.likes - 1
        } : null)
      }
    }
  }

  const handleShare = async () => {
    if (!selectedImage) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: selectedImage.title,
          text: `Check out this amazing artwork: "${selectedImage.title}" by ${selectedImage.author}`,
          url: window.location.href,
        })
      } else {
        // 回退到复制链接
        await navigator.clipboard.writeText(window.location.href)
        console.log('✅ Link copied to clipboard')
        // 这里可以添加 toast 提示
      }
    } catch (error) {
      console.error('❌ Error sharing:', error)
    }
  }

  const handleDownload = async () => {
    if (!selectedImage) return

    try {
      const response = await fetch(selectedImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedImage.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      console.log('✅ Image downloaded successfully')
    } catch (error) {
      console.error('❌ Error downloading image:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedImage) return

    try {
      const newCommentObj: Comment = {
        id: Date.now(),
        author: session?.user?.name || 'Anonymous',
        authorAvatar: session?.user?.image || '/placeholder-user.jpg',
        content: newComment.trim(),
        likes: 0,
        isLiked: false,
        createdAt: 'just now'
      }

      setComments(prev => [newCommentObj, ...prev])
      setNewComment('')
      console.log('✅ Comment added successfully')
    } catch (error) {
      console.error('❌ Error adding comment:', error)
    }
  }

  const handleCommentLike = async (commentId: string | number) => {
    try {
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
      console.log('✅ Comment like toggled successfully')
    } catch (error) {
      console.error('❌ Error toggling comment like:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading amazing artworks... ✨</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 导航栏 */}
      <header className="p-4 md:p-6 bg-[#0a0a0a] border-b border-[#333]">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            {/* Logo和品牌 */}
            <div
              className="flex items-center space-x-3 cursor-pointer transform hover:scale-105 transition-all"
              onClick={() => router.push("/")}
            >
              <div className="relative">
                <img
                  src="/images/aimagica-logo.png"
                  alt="AIMAGICA"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-all"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#d4a574] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1
                  className="text-lg md:text-xl font-black text-white transform -rotate-1"
                  style={{
                    fontFamily: "Comic Sans MS, cursive",
                    textShadow: "2px 2px 0px #333",
                  }}
                >
                  AIMAGICA
                </h1>
                <p
                  className="text-xs text-gray-400 transform rotate-1"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  Magic Gallery ✨
                </p>
              </div>
            </div>

            {/* 桌面导航菜单 */}
            <nav className="hidden md:flex items-center space-x-1">
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                HOME 🏠
              </Button>

              <Button
                variant="ghost"
                className="text-[#d4a574] hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all border-b-2 border-[#d4a574]"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                GALLERY 🖼️
              </Button>

              <Button
                onClick={() => router.push("/text-to-video")}
                variant="ghost"
                className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                VIDEO STUDIO 🎬
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                LEARN 📚
              </Button>
            </nav>

            {/* PRO按钮和移动菜单 */}
            <div className="flex items-center space-x-3">
              <Button
                className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black px-3 py-2 rounded-xl shadow-lg transform rotate-1 hover:rotate-0 transition-all text-xs md:text-sm"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                PRO
              </Button>

              {/* 移动菜单按钮 */}
              <Button
                onClick={() => setIsMobile(!isMobile)}
                variant="ghost"
                className="md:hidden text-white hover:bg-white/10 p-2 rounded-xl"
              >
                {isMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* 移动导航菜单 */}
          {isMobile && (
            <div className="md:hidden mt-4 p-4 bg-[#1a1a1a] rounded-xl border-2 border-[#333] shadow-lg">
              <nav className="flex flex-col space-y-2">
                <Button
                  onClick={() => {
                    router.push("/")
                    setIsMobile(false)
                  }}
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  HOME 🏠
                </Button>

                <Button
                  variant="ghost"
                  className="text-[#d4a574] hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all border-l-4 border-[#d4a574]"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  <Eye className="w-4 h-4 mr-3" />
                  GALLERY 🖼️
                </Button>

                <Button
                  onClick={() => {
                    router.push("/text-to-video")
                    setIsMobile(false)
                  }}
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  VIDEO STUDIO 🎬
                </Button>

                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Comic Sans MS, cursive" }}
                >
                  <Star className="w-4 h-4 mr-3" />
                  LEARN 📚
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* 搜索和过滤器 - 有意设计得不那么整齐 */}
        <div className="mb-8 flex flex-wrap gap-4 items-start">
          {/* 搜索框 - 稍微倾斜 */}
          <div
            className="relative flex-1 min-w-[200px] max-w-md transform -rotate-1"
            style={{ boxShadow: "3px 3px 0 #333" }}
          >
            <Input
              placeholder="Search magical creations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border-2 border-[#444] text-white placeholder:text-gray-400 rounded-xl font-bold pl-4 pr-10"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#d4a574]">✨</div>
          </div>

          {/* 过滤器标签 - 每个标签都有不同的旋转角度 */}
          <Tabs value={filter} onValueChange={setFilter} className="flex-1 min-w-[200px]">
            <TabsList className="bg-[#1a1a1a] border-2 border-[#444] rounded-xl p-1 flex flex-wrap gap-1">
              <TabsTrigger
                value="all"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-1 hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                All Magic
              </TabsTrigger>
              <TabsTrigger
                value="featured"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-1 hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                Featured ⭐
              </TabsTrigger>
              <TabsTrigger
                value="fantasy"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform rotate-0.5 hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                Fantasy 🧙‍♂️
              </TabsTrigger>
              <TabsTrigger
                value="cyberpunk"
                className="rounded-lg font-bold data-[state=active]:bg-[#d4a574] data-[state=active]:text-black text-gray-300 text-xs md:text-sm transform -rotate-0.5 hover:scale-105 transition-all"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                Cyberpunk 🤖
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#d4a574] border-t-transparent rounded-full animate-spin"></div>
            <p 
              className="text-[#d4a574] font-bold text-lg"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              Loading amazing artworks... ✨
            </p>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <motion.div 
            className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 mb-6 text-red-300"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ fontFamily: "Comic Sans MS, cursive" }}
          >
            <p className="font-medium">⚠️ {error}</p>
            <p className="text-sm mt-1">Showing backup images instead.</p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => {
                  setError(null)
                  setApiAttempted(false)
                  setImages(getStaticGalleryData())
                }}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                🔄 重新加载
              </button>
              <button 
                onClick={() => {
                  setEmergencyMode(true)
                  setError(null)
                  setApiAttempted(true)
                  setImages(getStaticGalleryData())
                  console.log('🚨 切换到紧急模式：仅使用静态数据')
                }}
                className="text-sm bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors"
              >
                🚨 静态模式
              </button>
            </div>
          </motion.div>
        )}

        {/* 无数据状态 */}
        {!loading && !error && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#d4a574]/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <p 
              className="text-[#d4a574] font-bold text-lg mb-2"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              No artworks found
            </p>
            <p 
              className="text-gray-400 text-sm"
              style={{ fontFamily: "Comic Sans MS, cursive" }}
            >
              Be the first to share your amazing creation!
            </p>
          </div>
        )}

        {/* 画廊 - 瀑布流布局 */}
        <motion.div 
          className="columns-2 md:columns-3 lg:columns-5 xl:columns-5 gap-4 md:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredImages.map((image, index) => {
            // 为每个图片生成随机的旋转角度
            const rotation = image.rotation || Math.random() * 4 - 2
            
            // 动态获取图片宽高比
            const getAspectRatio = () => {
              if (image.size === "vertical") return "3/4"
              if (image.size === "horizontal") return "4/3"
              if (image.size === "small") return "1/1"
              if (image.size === "medium") return "4/5"
              if (image.size === "large") return "3/4"
              return "4/5" // 默认
            }

            return (
              <motion.div
                key={image.id}
                className="break-inside-avoid mb-4 relative cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => handleImageClick(image)}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  zIndex: index % 3 === 0 ? 2 : 1,
                }}
                whileHover={{
                  scale: 1.03,
                  zIndex: 10,
                  rotate: 0,
                  transition: { duration: 0.2 },
                }}
              >
                {/* 图片卡片 - 不规则的边框和阴影 */}
                <div
                  className="group relative bg-[#1a1a1a] rounded-lg overflow-hidden border-2 border-[#333] hover:border-[#d4a574] transition-all cursor-pointer shadow-lg hover:shadow-xl"
                  style={{
                    aspectRatio: getAspectRatio(),
                    width: "100%",
                    height: "auto",
                  }}
                >
                  {/* 图片容器 - 白边框效果 */}
                  <div className="w-full h-full relative bg-white rounded-md p-1">
                    <div className="w-full h-full bg-white rounded-sm overflow-hidden relative">
                      <SimpleImage
                        src={image.url || "/placeholder.svg"}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => {
                          console.error(`🖼️ Gallery图片加载失败:`, {
                            url: image.url,
                            title: image.title,
                            index
                          });
                        }}
                        onLoad={() => {
                          console.log(`✅ Gallery图片加载成功:`, {
                            url: image.url,
                            title: image.title,
                            index
                          });
                        }}
                      />
                      
                      {/* 悬停覆盖层 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
                        <h3
                          className="text-white font-bold text-sm mb-1 transform rotate-0.5"
                          style={{ fontFamily: "Comic Sans MS, cursive" }}
                        >
                          {image.title}
                        </h3>
                        <p
                          className="text-gray-300 text-xs transform -rotate-0.5"
                          style={{ fontFamily: "Comic Sans MS, cursive" }}
                        >
                          by {image.author}
                        </p>
                      </div>

                      {/* 装饰元素 - 随机位置的小圆点 */}
                      <div
                        className="absolute w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#d4a574] z-20"
                        style={{
                          top: `${5 + ((index * 7) % 15)}%`,
                          right: `${5 + ((index * 11) % 15)}%`,
                          opacity: 0.7,
                        }}
                      ></div>

                      {/* 精选标记 - 不规则位置 */}
                      {image.isFeatured && (
                        <div
                          className="absolute top-2 right-2 md:top-3 md:right-3 transform rotate-12 bg-[#d4a574] rounded-full p-1 md:p-1.5 shadow-lg z-20"
                          style={{ boxShadow: "2px 2px 0 #333" }}
                        >
                          <Star className="w-2 h-2 md:w-3 md:h-3 text-black fill-black" />
                        </div>
                      )}

                      {/* 喜欢标记 */}
                      {image.isLiked && (
                        <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 transform -rotate-6 z-20">
                          <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-500 fill-red-500" />
                        </div>
                      )}

                      {/* 高级标记 */}
                      {image.isPremium && (
                        <div className="absolute top-2 left-2 md:top-3 md:left-3 transform -rotate-12 z-20">
                          <Crown className="w-3 h-3 md:w-4 md:h-4 text-[#d4a574]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 图片下方的互动信息 - 稍微倾斜 */}
                <div
                  className="mt-2 flex justify-between items-center px-1"
                  style={{ transform: `rotate(${rotation / 3}deg)` }}
                >
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span className="flex items-center">
                      <Heart className="w-3 h-3 mr-0.5" />
                      {image.likes > 1000 ? `${(image.likes / 1000).toFixed(1)}k` : image.likes}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-0.5" />
                      {image.views > 1000 ? `${(image.views / 1000).toFixed(1)}k` : image.views}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500" style={{ fontFamily: "Comic Sans MS, cursive" }}>
                    {image.createdAt}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* 加载更多按钮 - 不规则形状 */}
        {!loading && filteredImages.length > 0 && (
          <div className="text-center mt-12">
            <Button
              className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black px-8 py-3 rounded-xl shadow-lg transform rotate-1 hover:rotate-0 transition-all"
              style={{
                fontFamily: "Comic Sans MS, cursive",
                boxShadow: "4px 4px 0 #333",
                clipPath: "polygon(0% 0%, 100% 5%, 98% 100%, 2% 95%)",
              }}
            >
              Load More Magic ✨
            </Button>
          </div>
        )}
      </div>

      {/* 图片详情对话框 */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => {
        if (!open) {
          setSelectedImage(null)
        }
      }}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] bg-black p-0 rounded-2xl border-4 border-[#333] shadow-2xl">
          <DialogTitle style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
            {selectedImage?.title || "Image Details"}
          </DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
            {/* 图片侧 */}
            <div className="relative bg-black rounded-l-xl overflow-hidden">
              {selectedImage && (
                <>
                  <SimpleImage
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                    loading="eager"
                    onError={() => {
                      console.error(`🖼️ 选中图片加载失败:`, {
                        url: selectedImage.url,
                        title: selectedImage.title
                      });
                    }}
                    onLoad={() => {
                      console.log(`✅ 选中图片加载成功:`, {
                        url: selectedImage.url,
                        title: selectedImage.title
                      });
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h2
                      className="text-lg md:text-xl font-black text-white mb-1 transform -rotate-1"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        textShadow: "2px 2px 0px #333",
                      }}
                    >
                      {selectedImage.title}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <img
                        src={getProxiedAvatarUrl(selectedImage.authorAvatar)}
                        alt={selectedImage.author}
                        className="w-6 h-6 rounded-full border-2 border-[#444]"
                        onError={(e) => {
                          console.error('🖼️ 图片作者头像加载失败:', selectedImage.authorAvatar, selectedImage.author);
                          e.currentTarget.src = getFallbackAvatarUrl(selectedImage.author);
                        }}
                        onLoad={() => {
                          console.log('✅ 图片作者头像加载成功:', selectedImage.authorAvatar, selectedImage.author);
                        }}
                      />
                      <p className="text-[#d4a574] font-bold text-sm" style={{ fontFamily: "Comic Sans MS, cursive" }}>
                        by {selectedImage.author}
                      </p>
                      {selectedImage.isPremium && <Crown className="w-4 h-4 text-[#d4a574]" />}
                    </div>
                  </div>

                  {/* 装饰元素 */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-[#d4a574] opacity-50 transform rotate-12"></div>
                  <div className="absolute bottom-20 left-4 w-4 h-4 rounded-full bg-[#d4a574] opacity-30 transform -rotate-12"></div>
                </>
              )}
            </div>

            {/* 详情侧 */}
            <div className="p-6 overflow-y-auto bg-[#0a0a0a]">
              {selectedImage && (
                <>
                  {/* 统计信息 - 不规则排列 */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button
                      size="sm"
                      onClick={() => selectedImage && handleLike(selectedImage.id)}
                      className={`flex items-center space-x-1 transform rotate-1 ${
                        selectedImage.isLiked
                          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"
                      } font-bold rounded-lg border-2 border-[#444]`}
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        boxShadow: "2px 2px 0 #333",
                      }}
                    >
                      <Heart className="w-4 h-4" fill={selectedImage.isLiked ? "currentColor" : "none"} />
                      <span>{selectedImage.likes}</span>
                    </Button>

                    <span
                      className="flex items-center text-gray-300 font-bold transform -rotate-1 bg-[#1a1a1a] px-2 py-1 rounded-lg border-2 border-[#444]"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        boxShadow: "1px 1px 0 #333",
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {selectedImage.comments}
                    </span>

                    <span
                      className="flex items-center text-gray-300 font-bold transform rotate-0.5 bg-[#1a1a1a] px-2 py-1 rounded-lg border-2 border-[#444]"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        boxShadow: "1px 1px 0 #333",
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {selectedImage.views}
                    </span>

                    <span
                      className="ml-auto text-gray-400 font-bold text-sm transform -rotate-1"
                      style={{ fontFamily: "Comic Sans MS, cursive" }}
                    >
                      {selectedImage.createdAt}
                    </span>
                  </div>

                  {/* 提示词 - 不规则边框 */}
                  <div className="mb-6 transform rotate-0.5">
                    <h3
                      className="text-white font-black mb-3 transform -rotate-1"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        textShadow: "1px 1px 0px #333",
                      }}
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
                      <p
                        className="text-gray-200 font-bold text-sm leading-relaxed"
                        style={{ fontFamily: "Comic Sans MS, cursive" }}
                      >
                        "{selectedImage.prompt}"
                      </p>
                    </div>
                  </div>

                  {/* 标签 - 不规则排列 */}
                  <div className="mb-6">
                    <h3
                      className="text-white font-black mb-3 transform rotate-0.5"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        textShadow: "1px 1px 0px #333",
                      }}
                    >
                      Magic Tags 🏷️
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        className="bg-[#d4a574] text-black font-black transform rotate-1"
                        style={{
                          fontFamily: "Comic Sans MS, cursive",
                          boxShadow: "1px 1px 0 #333",
                        }}
                      >
                        {selectedImage.style}
                      </Badge>
                      {selectedImage.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-[#1a1a1a] border-2 border-[#444] text-gray-300 font-bold hover:bg-[#2a2a2a]"
                          style={{
                            fontFamily: "Comic Sans MS, cursive",
                            transform: `rotate(${(index % 3) - 1}deg)`,
                          }}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 操作按钮 - 不规则形状 */}
                  <div className="flex gap-3 mb-6">
                    <Button
                      onClick={handleShare}
                      className="bg-[#4a5a4a] hover:bg-[#5a6a5a] text-white font-black rounded-xl flex-1 border-2 border-[#666] transform -rotate-0.5 hover:scale-105 transition-all"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        boxShadow: "2px 2px 0 #333",
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      onClick={handleDownload}
                      className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black rounded-xl flex-1 transform rotate-0.5 hover:scale-105 transition-all"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        boxShadow: "2px 2px 0 #333",
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* 评论区域 */}
                  <div>
                    <h3
                      className="text-white font-black mb-4 transform -rotate-0.5"
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        textShadow: "1px 1px 0px #333",
                      }}
                    >
                      Magic Comments 💬
                    </h3>

                    {/* 添加评论 */}
                    <div className="flex space-x-3 mb-4">
                      <img
                        src={session?.user?.image || "/placeholder.svg?height=40&width=40&text=A"}
                        alt="Your Avatar"
                        className="w-8 h-8 rounded-full border-2 border-[#444] transform rotate-3"
                      />
                      <div className="flex-1 flex transform -rotate-0.5">
                        <Input
                          placeholder="Add your magical comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 bg-[#1a1a1a] border-2 border-[#444] text-white placeholder:text-gray-400 rounded-l-xl font-bold"
                          style={{ fontFamily: "Comic Sans MS, cursive" }}
                        />
                        <Button
                          onClick={handleAddComment}
                          className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black rounded-r-xl"
                          style={{
                            fontFamily: "Comic Sans MS, cursive",
                            boxShadow: "2px 2px 0 #333",
                          }}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 评论列表 */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {comments.map((comment, index) => (
                        <motion.div
                          key={comment.id}
                          className="flex space-x-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#333] shadow-sm transform"
                          style={{ transform: `rotate(${(index % 3) - 1}deg)` }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <img
                            src={getProxiedAvatarUrl(comment.authorAvatar)}
                            alt={comment.author}
                            className="w-8 h-8 rounded-full border-2 border-[#444] flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = getFallbackAvatarUrl(comment.author);
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-bold text-[#d4a574] text-sm" style={{ fontFamily: "Comic Sans MS, cursive" }}>
                                {comment.author}
                              </p>
                              <span className="text-xs text-gray-500">
                                {comment.createdAt}
                              </span>
                            </div>
                            <p className="text-gray-200 text-sm leading-relaxed" style={{ fontFamily: "Comic Sans MS, cursive" }}>
                              {comment.content}
                            </p>
                            <div className="flex items-center space-x-3 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCommentLike(comment.id)}
                                className={`text-xs p-1 h-auto ${
                                  comment.isLiked ? "text-red-400" : "text-gray-400 hover:text-red-400"
                                }`}
                              >
                                <Heart className="w-3 h-3 mr-1" fill={comment.isLiked ? "currentColor" : "none"} />
                                {comment.likes}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
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