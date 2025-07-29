"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Heart, 
  Download, 
  Share2, 
  Sparkles, 
  Crown, 
  User, 
  LogOut,
  Shield,
  CreditCard,
  Eye,
  Wand2,
  Star,
  PenTool,
  Layers,
  Zap,
  ImageIcon,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  HelpCircle,
  Mail,
  Send,
  FileText
} from "lucide-react"
import { useSessionCompat as useSession, signOutCompat as signOut, signInCompat as signIn } from "@/components/session-provider"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import GenerationInterface from "@/components/generation-interface"
// import { GenerationInterfaceSimple } from "@/components/generation-interface-simple"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ImageViewer from "@/components/image-viewer"
import { getProxiedAvatarUrl, getFallbackAvatarUrl } from "@/lib/utils/avatar"
import PromptsCommunity from "@/components/prompts-community"
import useMobile from "@/hooks/use-mobile"
import PerformanceMonitor from "@/components/performance-monitor"
import WaitingGame from "@/components/waiting-game"
import Link from "next/link"
import Image from "next/image"
import useStaticUrl from "@/hooks/use-static-url"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import CommunityGallery from "@/components/community-gallery"
import RecommendationGallery from "@/components/recommendation-gallery"
import RenderProgress from "@/components/render-progress"
import GenerationCompletionAlert from "@/components/generation-completion-alert"
import { useFavorites } from "@/hooks/useFavorites"
import { 
  startGeneration, 
  updateProgress, 
  completeGeneration, 
  cancelGeneration,
  getGenerationState,
  onGenerationStateChange 
} from "@/lib/generation-state"
import HeroSection from "@/components/hero-section"
import FeaturedImagesSection from "@/components/featured-images-section"
import TestimonialsCarousel from "@/components/testimonials-carousel"
import Head from "next/head"
import { useHighPriorityImagePreloader, IMAGE_SETS } from "@/hooks/use-image-preloader"

export default function AISketchPlatform() {
  const logoUrl = useStaticUrl('https://images.aimagica.ai/web-app-manifest-192x192.png');
  const { data: session } = useSession()
  const router = useRouter()
  const { isMobile } = useMobile()
  const [currentStep, setCurrentStep] = useState("create")
  const [isUserNavigating, setIsUserNavigating] = useState(false) // 用户手动导航标记
  const [isRendering, setIsRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; revised_prompt?: string }>>([])
  const [textPrompt, setTextPrompt] = useState("")
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1")
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null)
  const [selectedStyleName, setSelectedStyleName] = useState<string | null>(null)
  const [showPromptsCommunity, setShowPromptsCommunity] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [creationMode, setCreationMode] = useState<"text2img" | "img2img" | "text2video" | "img2video">("img2img")
  const [interfaceMode, setInterfaceMode] = useState<"quick" | "professional">("quick")
  const [sidebarBoxes, setSidebarBoxes] = useState(3) // Number of boxes to show in sidebar
  
  // 画廊分享相关状态 - 改为在结果页面中直接管理
  const [shareToGallery, setShareToGallery] = useState(false) // 默认不分享
  const [isSavingToGallery, setIsSavingToGallery] = useState(false) // 保存状态
  const [currentGeneratedImageUrl, setCurrentGeneratedImageUrl] = useState<string | null>(null)
  const [currentGeneratedPrompt, setCurrentGeneratedPrompt] = useState<string>("")
  
  // 生图完成提示状态
  const [showCompletionAlert, setShowCompletionAlert] = useState(false)
  
  // 图片查看器状态
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null)
  
  // 收藏功能
  const { addToFavorites, checkIsFavorited } = useFavorites()
  const [isFavorited, setIsFavorited] = useState(false)
  const [currentImageId, setCurrentImageId] = useState<string | null>(null)
  
  // 错误状态管理
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [isGenerationFailed, setIsGenerationFailed] = useState(false)
  
  const leftContentRef = useRef<HTMLDivElement>(null)
  const rightContentRef = useRef<HTMLDivElement>(null)
  
  // 使用 useRef 而不是 useState 来存储组件引用
  const generationInterfaceRef = useRef<any>(null)
  
  // 预加载关键图片 - 暂时禁用以避免循环更新
  // const { isLoading: imagesLoading, progress: imageProgress } = useHighPriorityImagePreloader([
  //   ...IMAGE_SETS.examples,
  //   ...IMAGE_SETS.placeholders
  // ])

  // 生成固定的随机值数组，避免hydration mismatch
  const [floatingElements] = useState(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 3 + Math.random() * 2,
      type: i % 3
    }))
  })

  useEffect(() => {
    setIsMounted(true)
    
    // 恢复全局生图状态
    const savedState = getGenerationState()
    if (savedState.isRendering) {
      setIsRendering(savedState.isRendering)
      setRenderProgress(savedState.renderProgress)
      setCurrentStep(savedState.currentStep)
      setTextPrompt(savedState.textPrompt)
      setSelectedAspectRatio(savedState.selectedAspectRatio)
      setSelectedStyleId(savedState.selectedStyleId)
      setSelectedStyleName(savedState.selectedStyleName)
      if (savedState.generatedImages.length > 0) {
        setGeneratedImages(savedState.generatedImages)
        setGeneratedImage(savedState.generatedImages[0].url)
      }
    }
  }, [])

  // 监听全局状态变化，同步到本地状态
  useEffect(() => {
    const cleanup = onGenerationStateChange((state) => {
      if (state.isRendering !== isRendering) {
        setIsRendering(state.isRendering)
      }
      if (state.renderProgress !== renderProgress) {
        setRenderProgress(state.renderProgress)
      }
      // 只在特定情况下同步currentStep，避免覆盖用户手动导航
      if (state.currentStep !== currentStep && !isUserNavigating) {
        // 只在以下情况下自动切换页面：
        // 1. 开始生图时（create -> rendering）
        // 2. 生图完成时（rendering -> result）
        if (
          (currentStep === 'create' && state.currentStep === 'rendering') ||
          (currentStep === 'rendering' && state.currentStep === 'result')
        ) {
          setCurrentStep(state.currentStep)
        }
      }
    })
    return cleanup
  }, [isRendering, renderProgress, currentStep])

  // 监听当用户查看结果页面时，延迟隐藏完成提示
  useEffect(() => {
    if (currentStep === 'result' && showCompletionAlert) {
      const timer = setTimeout(() => {
        setShowCompletionAlert(false)
      }, 5000) // 5秒后自动隐藏

      return () => clearTimeout(timer)
    }
  }, [currentStep, showCompletionAlert])

  // Dynamic sidebar height balancing
  useEffect(() => {
    const checkHeights = () => {
      if (leftContentRef.current && rightContentRef.current) {
        const leftHeight = leftContentRef.current.scrollHeight
        const rightHeight = rightContentRef.current.scrollHeight
        const heightDiff = leftHeight - rightHeight
        const boxHeight = 200 // Approximate height of each additional box

        console.log(`Heights - Left: ${leftHeight}, Right: ${rightHeight}, Diff: ${heightDiff}, Boxes: ${sidebarBoxes}`)

        if (heightDiff >= boxHeight && sidebarBoxes < 4) {
          console.log('Adding box')
          setSidebarBoxes(prev => prev + 1)
        } else if (heightDiff < -boxHeight && sidebarBoxes > 2) {
          console.log('Removing box') 
          setSidebarBoxes(prev => prev - 1)
        }
      }
    }

    // Multiple checks for better responsiveness
    const timers = [
      setTimeout(checkHeights, 100),
      setTimeout(checkHeights, 500),
      setTimeout(checkHeights, 1000)
    ]
    
    // Add multiple event listeners
    window.addEventListener('resize', checkHeights)
    window.addEventListener('scroll', checkHeights)
    
    // Use MutationObserver for DOM changes
    const observer = new MutationObserver(checkHeights)
    if (leftContentRef.current) {
      observer.observe(leftContentRef.current, { childList: true, subtree: true })
    }
    
    return () => {
      timers.forEach(timer => clearTimeout(timer))
      window.removeEventListener('resize', checkHeights)
      window.removeEventListener('scroll', checkHeights)
      observer.disconnect()
    }
  }, [creationMode, sidebarBoxes, currentStep])

  // Additional dynamic content boxes for sidebar
  const additionalBoxes = [
    {
      title: "MAGIC PROMPTS! ✨",
      icon: "🪄",
      content: ["✨ Professional prompts!", "🎨 Instant inspiration!", "🚀 Better results!"]
    },
    {
      title: "DAILY CHALLENGES! 🏆",
      icon: "🎯",
      content: ["🎯 New daily prompts!", "🏆 Win premium credits!", "🎨 Show your creativity!"]
    },
    {
      title: "STYLE TRENDS! 🔥", 
      icon: "📈",
      content: ["🔥 Trending art styles!", "📈 Popular techniques!", "✨ Community favorites!"]
    }
  ]

  const renderProgressRef = useRef<HTMLDivElement>(null)

  const handleStartRender = async (aspectRatio?: string, styleId?: string | null, imageCount?: number, uploadedImage?: string | null, modelParams?: any) => {
    if (!session?.user) {
      // 未登录用户提示登录
      signIn()
      return
    }

    // 移除了提示词验证，因为API会处理默认提示词的情况

    setIsRendering(true)
    setCurrentStep("rendering")
    setRenderProgress(0)
    
    // 自动滚动到生图进度组件
    setTimeout(() => {
      if (renderProgressRef.current) {
        renderProgressRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 100)
    
    // 保存到全局状态
    startGeneration(textPrompt, selectedAspectRatio || aspectRatio || '1:1', selectedStyleId || styleId || null, selectedStyleName)

    try {
      console.log('🚀 Starting image generation with streaming progress...')
      console.log('📊 Parameters:', {
        prompt: textPrompt.substring(0, 50) + '...',
        styleId: selectedStyleId || styleId,
        aspectRatio: aspectRatio || selectedAspectRatio,
        imageCount: imageCount || 1,
        uploadedImage: uploadedImage ? 'Image provided (base64)' : 'No image',
        creationMode: creationMode,
        isImg2img: creationMode === 'img2img'
      })
      
      // 使用流式API请求
      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: textPrompt,
          styleId: selectedStyleId || styleId,
          aspectRatio: aspectRatio || selectedAspectRatio,
          imageCount: imageCount || 1,
          userId: session.user.id || session.user.email,
          uploadedImage: uploadedImage,
          creationMode: creationMode,
          modelId: modelParams?.modelId,
          kieModel: modelParams?.kieModel,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('Response body is empty')
      }

      // 处理流式响应
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('🏁 Stream completed')
          break
        }
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            
            switch (data.type) {
              case 'progress':
                console.log(`📊 Real-time progress: ${data.progress}%`)
                setRenderProgress(data.progress)
                // 更新全局状态
                updateProgress(data.progress)
                break
                
              case 'complete':
                console.log('🎉 Generation completed successfully')
                console.log('🐛 Received images data:', data.data?.images)
                if (data.success && data.data?.images) {
                  console.log(`🐛 Number of images received: ${data.data.images.length}`)
                  setGeneratedImages(data.data.images)
                  // 同时设置旧的结果用于向后兼容
                  if (data.data.images.length > 0) {
                    setGeneratedImage(data.data.images[0].url)
                    setCurrentGeneratedImageUrl(data.data.images[0].url)
                    setCurrentGeneratedPrompt(textPrompt)
                    
                    // 自动保存图片到数据库并获取ID
                    if (session?.user) {
                      handleSaveImageAndGetId(data.data.images[0].url, textPrompt)
                    }
                  }
                  setCurrentStep("result")
                  setRenderProgress(100)
                  
                  // 更新全局状态
                  completeGeneration(data.data.images)
                  
                  // 触发生图完成提示音效和动画
                  setShowCompletionAlert(true)
                } else {
                  throw new Error(data.error || 'Generation failed')
                }
                break
                
              case 'error':
                console.error('❌ Generation error:', data.error)
                throw new Error(data.error || 'Generation failed')
                
              default:
                console.log('🔍 Unknown stream data type:', data.type)
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse stream data:', line, parseError)
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Image generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // 设置错误状态而不是直接返回CREATE页面
      setGenerationError(errorMessage)
      setIsGenerationFailed(true)
      setRenderProgress(0)
      
      // 确保切换到rendering状态以显示错误界面
      setCurrentStep("rendering")
      
      // 取消全局状态中的生成
      cancelGeneration()
      
      // 添加调试日志
      console.log('🐛 Error state set:', {
        errorMessage,
        isGenerationFailed: true,
        currentStep: 'rendering'
      })
    } finally {
      setIsRendering(false)
    }
  }

  // 处理用户手动切换页面
  const handleUserNavigation = (step: string) => {
    setIsUserNavigating(true)
    setCurrentStep(step)
    
    // 如果用户导航回CREATE页面，清除错误状态
    if (step === "create") {
      setGenerationError(null)
      setIsGenerationFailed(false)
    }
    
    // 短暂延迟后重置导航标记
    setTimeout(() => {
      setIsUserNavigating(false)
    }, 1000)
  }

  // 处理错误清除并返回CREATE页面
  const handleClearError = () => {
    setGenerationError(null)
    setIsGenerationFailed(false)
    handleUserNavigation("create")
  }

  const handleViewPromptsCommunity = () => {
    setShowPromptsCommunity(true)
  }

  const handleBackFromCommunity = () => {
    setShowPromptsCommunity(false)
  }

  // 处理使用提示词的函数
  const handleUsePrompt = (prompt: string, style?: string) => {
    console.log('🚀 handleUsePrompt 被调用:', { prompt, style })
    
    // 如果GenerationInterface组件有引用，调用它的方法来设置提示词
    if (generationInterfaceRef.current && generationInterfaceRef.current.setPromptForCurrentMode) {
      console.log('✅ 设置提示词:', prompt)
      generationInterfaceRef.current.setPromptForCurrentMode(prompt)
    } else {
      // 备用方案：直接设置文本提示词
      console.log('⚠️ 使用备用方案设置提示词:', prompt)
      setTextPrompt(prompt)
    }
    
    // 如果提供了风格，也设置风格
    if (style && generationInterfaceRef.current && generationInterfaceRef.current.setStyleByName) {
      console.log('✅ 调用 setStyleByName:', style)
      generationInterfaceRef.current.setStyleByName(style)
    } else if (style) {
      // 备用方案：设置风格ID（需要根据风格名称查找对应的ID）
      console.log('⚠️ 风格设置失败，没有可用的方法:', style)
    } else {
      console.log('ℹ️ 没有提供风格参数')
    }
  }

  // 处理比例变化的函数
  const handleAspectRatioChange = (aspectRatio: string) => {
    console.log('📐 Aspect ratio changed to:', aspectRatio)
    setSelectedAspectRatio(aspectRatio)
  }

  // 处理画廊分享勾选状态变化
  const handleShareToggle = async (checked: boolean) => {
    setShareToGallery(checked)
    
    // 如果用户勾选了分享，并且有图片数据，自动保存到画廊
    if (checked && currentGeneratedImageUrl && session?.user) {
      await handleGalleryShare()
    }
  }

  // 根据创建模式获取默认风格标识
  const getDefaultStyleByMode = (mode: string) => {
    // 返回通用的风格名称，而不是模式描述
    return "Generated"
  }

  // 添加已分享图片状态跟踪
  const [sharedImages, setSharedImages] = useState<Set<string>>(new Set())

  // 处理画廊分享
  const handleGalleryShare = async (imageUrl?: string) => {
    const targetImageUrl = imageUrl || currentGeneratedImageUrl
    if (!targetImageUrl || !session?.user) {
      return
    }

    // 检查是否已经分享过这张图片
    if (sharedImages.has(targetImageUrl)) {
      alert('🎉 This artwork has already been shared to the gallery!')
      return
    }

    setIsSavingToGallery(true)
    
    try {
      // 调用API保存图片信息到数据库
      const response = await fetch('/api/images/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: targetImageUrl,
          prompt: currentGeneratedPrompt || textPrompt || "AI Generated Artwork",
          isPublic: true, // 分享到画廊默认为公开
          style: selectedStyleName || getDefaultStyleByMode(creationMode),
          creationMode: creationMode // 传递创建模式以确保隐私保护
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Image saved successfully:', result)
        
        // 添加到已分享列表
        setSharedImages(prev => new Set(prev).add(targetImageUrl))
        
        if (shareToGallery) {
          alert('🎉 Your amazing artwork has been shared to the gallery!')
        } else {
          alert('✅ Your artwork has been saved to your personal collection!')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Failed to save image:', errorData)
        console.error('❌ Response status:', response.status)
        alert(`Failed to save image: ${errorData.error || errorData.details || 'Unknown error'}. Please try again.`)
      }
    } catch (error) {
      console.error('❌ Error saving image:', error)
      alert(`Error saving image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setIsSavingToGallery(false)
    }
  }

  // 处理登出的函数
  const handleLogout = async () => {
    try {
      console.log("🚪 开始登出流程...")
      
      // 首先调用我们的登出API来记录登出时间
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("✅ 登出时间记录成功:", result)
      } else {
        console.error("⚠️ 登出时间记录失败，但继续登出")
      }
    } catch (error) {
      console.error("⚠️ 调用登出API失败，但继续登出:", error)
    }
    
    // 然后执行NextAuth的登出
    await signOut()
  }

  // 打开图片查看器
  const handleViewImage = (imageUrl: string) => {
    setViewingImageUrl(imageUrl)
    setShowImageViewer(true)
  }

  // 关闭图片查看器
  const handleCloseImageViewer = () => {
    setShowImageViewer(false)
    setViewingImageUrl(null)
  }

  // 保存图片到数据库并获取ID
  const handleSaveImageAndGetId = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch('/api/images/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          prompt: prompt,
          isPublic: false, // 默认不公开，只保存到个人收藏
          style: selectedStyleName || getDefaultStyleByMode(creationMode),
          creationMode: creationMode
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Image saved with ID:', result.data.id)
        setCurrentImageId(result.data.id)
        
        // 检查是否已收藏
        const favoriteStatus = await checkIsFavorited(result.data.id)
        setIsFavorited(favoriteStatus)
      } else {
        console.error('❌ Failed to save image')
      }
    } catch (error) {
      console.error('❌ Error saving image:', error)
    }
  }

  // 处理LOVE IT按钮点击
  const handleLoveItClick = async () => {
    if (!currentImageId) {
      console.error('❌ No image ID available')
      return
    }

    const success = await addToFavorites(currentImageId)
    if (success) {
      setIsFavorited(true)
    }
  }

  if (showPromptsCommunity) {
    return <PromptsCommunity onBack={handleBackFromCommunity} onUsePrompt={handleUsePrompt} />
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] relative overflow-hidden">
      {/* 性能监控组件 */}
      <PerformanceMonitor />
      {/* SEO优化的元数据 */}
      <Head>
        <title>AIMAGICA - Turn Your Doodles into Art Masterpieces | AI Drawing Tool</title>
        <meta
          name="description"
          content="AIMAGICA is an AI-powered drawing tool that transforms your simple sketches into stunning art. Choose from various art styles and create in 30 seconds. Start for free!"
        />
        <meta name="keywords" content="AI drawing, AI art, image generation, AI art tool, doodle to art, AIMAGICA" />
        
        {/* Performance hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//api.openai.com" />
        
        {/* Preload critical images */}
        <link rel="preload" href="/images/examples/cat-wizard.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/images/examples/cyber-city.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="https://images.aimagica.ai/web-app-manifest-192x192.png" as="image" type="image/png" />
        
        <meta property="og:title" content="AIMAGICA - Turn Your Doodles into Art Masterpieces" />
        <meta
          property="og:description"
          content="Transform your simple sketches into stunning art with AIMAGICA. Choose from various styles and create in 30 seconds. Start for free!"
        />
        <meta property="og:image" content="/images/aimagica-preview.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aimagica.app" />
        <meta property="og:site_name" content="AIMAGICA" />
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AIMAGICA - AI Art Generator" />
        <meta name="twitter:description" content="Transform your doodles into amazing art with AI!" />
        <meta name="twitter:image" content="/images/aimagica-preview.jpg" />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href="https://aimagica.app" />
      </Head>

      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#8b7355]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-[#2d3e2d]/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#d4a574]/20 rounded-full blur-lg"></div>
      </div>

      {/* Floating cartoon elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isMounted && floatingElements.map((element) => (
          <div
            key={element.id}
            className={`absolute rounded-full animate-bounce ${
              element.type === 0
                ? "bg-[#8b7355]/20 w-3 h-3"
                : element.type === 1
                  ? "bg-[#2d3e2d]/20 w-2 h-2"
                  : "bg-[#d4a574]/20 w-4 h-4"
            }`}
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              animationDelay: `${element.animationDelay}s`,
              animationDuration: `${element.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* 顶部墨绿色条带 */}
      <div className="w-full h-2 md:h-3 bg-[#2d3e2d] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2d3e2d] via-[#8b7355] to-[#2d3e2d] opacity-50"></div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Header with Navigation */}
        <header className="p-4 md:p-6 flex justify-between items-center">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-2 md:space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 overflow-hidden">
                <img 
                  src={logoUrl} 
                  alt="Aimagica Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('🖼️ 首页logo加载失败:', logoUrl);
                    // 尝试使用备用logo
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('placeholder-logo')) {
                      target.src = '/placeholder-logo.png';
                    }
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <h1
                  className="text-2xl md:text-5xl font-black text-[#2d3e2d] transform -rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "2px 2px 0px #8b7355, 1px 1px 0px #d4a574",
                  }}
                >
                  AIMAGICA
                </h1>
                <p
                  className="text-sm md:text-lg font-bold text-[#8b7355] transform rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #f5f1e8",
                  }}
                >
                  AI + IMAGE + MAGIC = ✨ AMAZING ART!
                </p>
              </div>
              {/* Mobile Logo Text */}
              <div className="block sm:hidden">
                <h1
                  className="text-lg font-black text-[#2d3e2d] transform -rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #8b7355",
                  }}
                >
                  AIMAGICA
                </h1>
              </div>
            </div>

            {/* Navigation Menu - Hidden on mobile */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Button
                onClick={() => window.location.href = '/gallery'}
                variant="ghost"
                className="text-[#2d3e2d] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-black rounded-2xl transform hover:scale-105 transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                GALLERY 🖼️
              </Button>
              <Button
                onClick={() => window.location.href = '/favorites'}
                variant="ghost"
                className="text-[#2d3e2d] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-black rounded-2xl transform hover:scale-105 transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Heart className="w-4 h-4 mr-2" />
                FAVORITES ❤️
              </Button>
              <Button
                onClick={handleViewPromptsCommunity}
                variant="ghost"
                className="text-[#2d3e2d] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-black rounded-2xl transform hover:scale-105 transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                MAGIC PROMPTS ✨
              </Button>
              <Button
                onClick={() => window.location.href = '/admin/login'}
                variant="ghost"
                className="text-[#2d3e2d] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-black rounded-2xl transform hover:scale-105 transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Shield className="w-4 h-4 mr-2" />
                ADMIN 🛡️
              </Button>
              <Button
                onClick={() => window.location.href = '/pricing'}
                variant="ghost"
                className="text-[#2d3e2d] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-black rounded-2xl transform hover:scale-105 transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                PRICING 💰
              </Button>
            </nav>
          </div>

          {/* Right side - Upgrade and User */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-3 py-2 md:px-6 md:py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all text-xs md:text-sm"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              {isMobile ? "PRO" : "UPGRADE PRO!"} 🚀
            </Button>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 md:h-12 md:w-12 rounded-full border-2 md:border-4 border-[#8b7355] bg-white hover:bg-[#f5f1e8] transform hover:scale-105 transition-all"
                >
                  {session?.user?.image ? (
                    <img
                      src={getProxiedAvatarUrl(session.user.image)}
                      alt={session.user.name || 'User'}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        console.error('🖼️ 头像加载失败:', session.user.image);
                        e.currentTarget.src = getFallbackAvatarUrl(session.user.name || session.user.email);
                      }}
                      onLoad={() => {
                        console.log('✅ 头像加载成功:', session.user.image);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[#d4a574] to-[#8b7355] flex items-center justify-center">
                      <span
                        className="text-[#2d3e2d] font-black text-sm md:text-lg"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  {/* Online indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 md:-bottom-1 md:-right-1 w-2 h-2 md:w-4 md:h-4 ${session ? 'bg-green-500' : 'bg-orange-500'} border-1 md:border-2 border-white rounded-full animate-pulse`}></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 md:w-56 bg-white border-2 md:border-4 border-[#8b7355] rounded-2xl shadow-2xl"
                align="end"
                forceMount
              >
                <DropdownMenuLabel
                  className="font-black text-[#2d3e2d] border-b-2 border-[#8b7355] pb-2"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <div className="flex flex-col space-y-1">
                    {session ? (
                      <>
                        <p className="text-sm md:text-base">
                          {session.user?.name || 'Magic User'} 🪄
                        </p>
                        <p className="text-xs md:text-sm text-[#8b7355] font-bold">
                          {session.user?.email}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Logged In</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm md:text-base">
                          Welcome to AIMAGICA! 🎨
                        </p>
                        <p className="text-xs md:text-sm text-[#8b7355] font-bold">
                          Login to start your creative journey
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-orange-600">Not Logged In</span>
                        </div>
                      </>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#8b7355]" />
                
                {session ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push(session.user?.isAdmin ? '/admin/dashboard' : '/dashboard')}
                      className="font-bold text-[#2d3e2d] hover:bg-[#f5f1e8] rounded-xl m-1 cursor-pointer text-sm"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      {session.user?.isAdmin ? (
                        <Shield className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <User className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                      )}
                      <span>{session.user?.isAdmin ? 'Admin Dashboard 🛡️' : 'My Dashboard 📊'}</span>
                    </DropdownMenuItem>
                    {session.user?.isAdmin && (
                      <>
                        <DropdownMenuItem
                          onClick={() => router.push('/admin/magic-coins')}
                          className="font-bold text-[#2d3e2d] hover:bg-[#f5f1e8] rounded-xl m-1 cursor-pointer text-sm"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Crown className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                          <span>Magic Coins 🪙</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push('/admin/prompts')}
                          className="font-bold text-[#2d3e2d] hover:bg-[#f5f1e8] rounded-xl m-1 cursor-pointer text-sm"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Wand2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                          <span>Prompts Manager 🎨</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#8b7355]" />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => router.push('/favorites')}
                      className="font-bold text-[#2d3e2d] hover:bg-[#f5f1e8] rounded-xl m-1 cursor-pointer text-sm"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <Heart className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                      <span>My Favorites ❤️</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[#8b7355]" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="font-bold text-red-600 hover:bg-red-50 rounded-xl m-1 cursor-pointer text-sm"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <LogOut className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                      <span>Log out 👋</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2 m-1">
                      <p className="text-xs text-[#8b7355] font-bold mb-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        After login you can:
                      </p>
                      <div className="space-y-1 text-xs text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#d4a574] rounded-full"></div>
                          <span>Save artworks to cloud</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#d4a574] rounded-full"></div>
                          <span>Unlimited AI magic drawing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#d4a574] rounded-full"></div>
                          <span>Share community artworks</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-[#8b7355]" />
                    <DropdownMenuItem
                      onClick={() => signIn('google')}
                      className="font-bold text-[#2d3e2d] hover:bg-[#f5f1e8] rounded-xl m-1 cursor-pointer text-sm bg-gradient-to-r from-blue-50 to-green-50"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <svg className="mr-2 h-3 w-3 md:h-4 md:w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Login with Google 🚀</span>
                    </DropdownMenuItem>
                    <div className="px-3 py-2 m-1">
                      <p className="text-xs text-[#8b7355] text-center" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        Secure • Fast • Convenient
                      </p>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Hero Section */}
        <HeroSection />

        {/* AI功能导航区域 - SEO友好的内部链接 */}
        <section className="container mx-auto px-4 md:px-6 py-8 mb-8">
          <div className="text-center mb-8">
            <h2
              className="text-3xl md:text-4xl font-black text-[#2d3e2d] mb-4 transform -rotate-1"
              style={{
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "3px 3px 0px #d4a574",
              }}
            >
              EXPLORE ALL AI FEATURES! ✨
            </h2>
            <p
              className="text-lg md:text-xl font-bold text-[#8b7355] max-w-3xl mx-auto"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              Choose your perfect AI creation tool - each optimized for amazing results!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 首页 - 图生图（当前页面，突出显示） */}
            <div className="bg-gradient-to-br from-[#d4a574] to-[#c19660] border-4 border-[#2d3e2d] rounded-2xl p-6 transform hover:scale-105 hover:rotate-1 transition-all shadow-xl">
              <div className="text-center">
                <div className="text-5xl mb-3">🖼️</div>
                <h3
                  className="text-xl font-black text-[#2d3e2d] mb-2"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  Image to Image
                </h3>
                <p
                  className="text-[#2d3e2d] font-bold text-sm mb-4"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  Transform photos into stunning AI artworks
                </p>
                <div className="bg-[#2d3e2d] text-[#d4a574] px-4 py-2 rounded-xl font-black text-xs">
                  ✨ YOU ARE HERE
                </div>
              </div>
            </div>

            {/* 文生图页面 */}
            <Link href="/text-to-image" className="block">
              <div className="bg-white border-4 border-[#2d3e2d] rounded-2xl p-6 transform hover:scale-105 hover:-rotate-1 transition-all shadow-xl hover:shadow-2xl">
                <div className="text-center">
                  <div className="text-5xl mb-3">📝</div>
                  <h3
                    className="text-xl font-black text-[#2d3e2d] mb-2"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Text to Image
                  </h3>
                  <p
                    className="text-[#8b7355] font-bold text-sm mb-4"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Create amazing art from text descriptions
                  </p>
                  <div className="bg-[#8b7355] text-[#f5f1e8] px-4 py-2 rounded-xl font-black text-xs">
                    🚀 EXPLORE NOW
                  </div>
                </div>
              </div>
            </Link>

            {/* 文生视频页面 */}
            <Link href="/text-to-video" className="block">
              <div className="bg-white border-4 border-[#2d3e2d] rounded-2xl p-6 transform hover:scale-105 hover:rotate-1 transition-all shadow-xl hover:shadow-2xl">
                <div className="text-center">
                  <div className="text-5xl mb-3">🎬</div>
                  <h3
                    className="text-xl font-black text-[#2d3e2d] mb-2"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Text to Video
                  </h3>
                  <p
                    className="text-[#8b7355] font-bold text-sm mb-4"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Generate stunning videos from text
                  </p>
                  <div className="bg-[#8b7355] text-[#f5f1e8] px-4 py-2 rounded-xl font-black text-xs">
                    🎥 COMING SOON
                  </div>
                </div>
              </div>
            </Link>

            {/* 图生视频页面 */}
            <Link href="/image-to-video" className="block">
              <div className="bg-white border-4 border-[#2d3e2d] rounded-2xl p-6 transform hover:scale-105 hover:-rotate-1 transition-all shadow-xl hover:shadow-2xl">
                <div className="text-center">
                  <div className="text-5xl mb-3">🎥</div>
                  <h3
                    className="text-xl font-black text-[#2d3e2d] mb-2"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Image to Video
                  </h3>
                  <p
                    className="text-[#8b7355] font-bold text-sm mb-4"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Transform images into dynamic videos
                  </p>
                  <div className="bg-[#8b7355] text-[#f5f1e8] px-4 py-2 rounded-xl font-black text-xs">
                    🎭 COMING SOON
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Main content */}
        <main className="container mx-auto px-4 md:px-6 py-4 md:py-8">
          <Tabs value={currentStep} onValueChange={handleUserNavigation} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#4a5a4a] rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-xl">
              <TabsTrigger
                value="create"
                className="rounded-xl md:rounded-2xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                CREATE! 🎨
              </TabsTrigger>
              <TabsTrigger
                value="rendering"
                className="rounded-xl md:rounded-2xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm"
                disabled={!isRendering}
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Wand2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                MAGIC! ✨
              </TabsTrigger>
              <TabsTrigger
                value="result"
                className="rounded-xl md:rounded-2xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm"
                disabled={!generatedImage}
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                DONE! 🎉
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 md:mt-8 flex flex-col lg:flex-row gap-4 md:gap-8 items-start">
              {/* Main work area - 根据侧边栏是否显示来调整宽度 */}
              <div ref={leftContentRef} className={`w-full ${
                // 当在MAGIC界面、DONE界面、渲染中时，侧边栏大部分内容被隐藏，主区域应该居中
                showPromptsCommunity || currentStep === "result" || currentStep === "rendering"
                  ? 'lg:w-full flex lg:justify-center' 
                  : 'lg:w-2/3'
              } order-1`}>
                <div className={`${
                  showPromptsCommunity || currentStep === "result" || currentStep === "rendering"
                    ? 'w-full max-w-4xl' 
                    : 'w-full'
                }`}>
                <TabsContent value="create" className="mt-0" data-step="create">
                                      <GenerationInterface
                      ref={generationInterfaceRef}
                      onStartRender={handleStartRender}
                      textPrompt={textPrompt}
                      setTextPrompt={setTextPrompt}
                      creationMode={creationMode}
                      setCreationMode={setCreationMode}
                      interfaceMode={interfaceMode}
                      setInterfaceMode={setInterfaceMode}
                      onAspectRatioChange={handleAspectRatioChange}
                      onStyleChange={(styleId, styleName) => {
                        setSelectedStyleId(styleId)
                        setSelectedStyleName(styleName)
                      }}
                      initialSelectedStyleId={selectedStyleId}
                      initialSelectedStyleName={selectedStyleName}
                      forcedMode="img2img"
                      hideModeSelector={true}
                    />
                </TabsContent>

                <TabsContent value="rendering" className="mt-0">
                  <div ref={renderProgressRef}>
                    <RenderProgress 
                      progress={renderProgress} 
                      generatedImages={generatedImages}
                      selectedStyleId={selectedStyleId}
                      isGenerationFailed={isGenerationFailed}
                      generationError={generationError}
                      onClearError={handleClearError}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="result" className="mt-0">
                  {/* Result content with mobile optimization */}
                  <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 md:border-4 border-[#2d3e2d] transform hover:scale-[1.02] transition-all">
                    <div className="bg-[#d4a574] p-4 md:p-6 relative">
                      <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-8 md:h-8 bg-[#2d3e2d] rounded-full"></div>
                      <div className="absolute -bottom-1 -left-1 md:-bottom-2 md:-left-2 w-3 h-3 md:w-6 md:h-6 bg-[#8b7355] rounded-full"></div>
                      <h2
                        className="text-xl md:text-3xl font-black text-[#2d3e2d] mb-2 transform -rotate-1"
                        style={{
                          fontFamily: "Fredoka One, Arial Black, sans-serif",
                          textShadow: "2px 2px 0px #f5f1e8",
                        }}
                      >
                        YOUR AIMAGICA MASTERPIECE! 🎉
                      </h2>
                      <p
                        className="text-sm md:text-base text-[#2d3e2d] font-bold"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        The magic worked! Share your amazing creation! 🚀
                      </p>
                    </div>
                    <div className="p-4 md:p-6">
                      {/* 图片显示 - 居中显示，适中尺寸 */}
                      {generatedImages && generatedImages.length > 0 && (
                        <div className="flex justify-center">
                          <div className={`
                            ${generatedImages.length === 1 ? 'w-full max-w-md' : ''}
                            ${generatedImages.length === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl' : ''}
                            ${generatedImages.length >= 4 ? 'grid grid-cols-2 gap-4 w-full max-w-2xl' : ''}
                            ${generatedImages.length === 3 ? 'space-y-4 w-full max-w-md' : ''}
                          `}>
                            {generatedImages.map((image, index) => (
                              <div key={index} className="group relative bg-white rounded-xl shadow-lg overflow-hidden border-2 border-[#8b7355] hover:shadow-2xl transition-all duration-300">
                                {/* 适中尺寸的图片显示 */}
                                <div className="relative w-full aspect-square">
                                  <img
                                    src={image.url}
                                    alt={`Generated image ${index + 1}`}
                                    className="w-full h-full object-contain bg-gray-100 cursor-pointer"
                                    onClick={() => handleViewImage(image.url)}
                                  />
                                  
                                  {/* 悬停时显示的操作按钮 */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleViewImage(image.url)}
                                          className="flex-1 bg-white/90 backdrop-blur-sm border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] hover:border-[#d4a574] font-black rounded-xl transform hover:scale-105 transition-all text-sm py-2"
                                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                                        >
                                          🔍 View & Share
                                        </Button>
                                        <Button
                                                                    onClick={() => {
                            handleUserNavigation("create")
                            setTimeout(() => {
                              const createSection = document.querySelector('[data-step="create"]')
                              if (createSection) {
                                createSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }
                            }, 100)
                          }}
                          className="flex-1 bg-white/90 backdrop-blur-sm border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] hover:border-[#d4a574] font-black rounded-xl transform hover:scale-105 transition-all text-sm py-2"
                                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                                        >
                                          🔄 Retry
                                        </Button>
                                      </div>
                                      
                                      {/* 分享到画廊和下载按钮并排 */}
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleGalleryShare(image.url)}
                                          disabled={isSavingToGallery || sharedImages.has(image.url)}
                                          className={`flex-1 backdrop-blur-sm font-black rounded-xl border-3 shadow-xl transform hover:scale-110 transition-all text-xs py-3 animate-pulse ${
                                            sharedImages.has(image.url) 
                                              ? "bg-green-500/90 hover:bg-green-600/90 border-green-600 text-white cursor-not-allowed animate-none" 
                                              : "bg-gradient-to-r from-[#ffd700]/90 to-[#ff8c00]/90 hover:from-[#ffed4a] hover:to-[#f59e0b] text-[#2d3e2d] border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                                          }`}
                                          style={{ 
                                            fontFamily: "Fredoka One, Arial Black, sans-serif",
                                            textShadow: "1px 1px 0px rgba(255,255,255,0.5)"
                                          }}
                                        >
                                          {isSavingToGallery ? (
                                            <div className="flex flex-col items-center">
                                              <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2d3e2d] mr-2"></div>
                                                Sharing...
                                              </div>
                                            </div>
                                          ) : sharedImages.has(image.url) ? (
                                            <div className="flex flex-col items-center">
                                              <div>✅ Shared</div>
                                              <div className="text-xs opacity-80 mt-1">
                                                🎉 In gallery!
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex flex-col items-center">
                                              <div>🌟 Share</div>
                                              <div className="text-xs opacity-80 mt-1">
                                                📢 To gallery!
                                              </div>
                                            </div>
                                          )}
                                        </Button>
                                        
                                        <Button
                                          onClick={async () => {
                                            try {
                                              // 通过fetch获取图片数据
                                              const response = await fetch(image.url)
                                              const blob = await response.blob()
                                              
                                              // 创建下载链接
                                              const url = window.URL.createObjectURL(blob)
                                              const link = document.createElement('a')
                                              link.href = url
                                              link.download = `aimagica-artwork-${Date.now()}-${index + 1}.png`
                                              document.body.appendChild(link)
                                              link.click()
                                              
                                              // 清理
                                              window.URL.revokeObjectURL(url)
                                              document.body.removeChild(link)
                                            } catch (error) {
                                              console.error('Download failed:', error)
                                              alert('Download failed. Please try right-clicking and "Save Image As"')
                                            }
                                          }}
                                          className="flex-1 bg-white/90 backdrop-blur-sm border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] hover:border-[#d4a574] font-black rounded-xl transform hover:scale-105 transition-all text-xs py-3"
                                          style={{ 
                                            fontFamily: "Fredoka One, Arial Black, sans-serif",
                                            textShadow: "1px 1px 0px rgba(255,255,255,0.3)"
                                          }}
                                        >
                                          <div className="flex flex-col items-center">
                                            <div className="flex items-center">
                                              <Download className="w-4 h-4 mr-1" />
                                              📥 Download
                                            </div>
                                            <div className="text-xs opacity-80 mt-1">
                                              💾 Free!
                                            </div>
                                          </div>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}



                      {/* 操作按钮 - 适用于所有情况 */}
                      {generatedImage && (
                        <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-0 mt-4">
                          <div className="flex flex-wrap gap-2 md:gap-3">
                            <Button
                              onClick={handleLoveItClick}
                              variant="outline"
                              className={`${
                                isFavorited 
                                  ? "bg-[#ff6b6b] border-[#ff6b6b] text-white hover:bg-[#ff5252] hover:border-[#ff5252]" 
                                  : "bg-[#f5f1e8] border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8]"
                              } font-black rounded-xl md:rounded-2xl transform hover:rotate-1 hover:scale-105 transition-all text-xs md:text-sm px-3 py-2`}
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                              disabled={!currentImageId || !session?.user}
                            >
                              <Heart className={`w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                              {isFavorited ? 'LOVED! ❤️' : 'LOVE IT! ❤️'}
                            </Button>
                            <Button
                              onClick={() => {
                                handleUserNavigation("create")
                                setTimeout(() => {
                                  const createSection = document.querySelector('[data-step="create"]')
                                  if (createSection) {
                                    createSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                  }
                                }, 100)
                              }}
                              className="bg-gradient-to-r from-[#d4a574] to-[#c19660] border-2 md:border-4 border-[#2d3e2d] text-[#2d3e2d] hover:from-[#c19660] hover:to-[#b8935a] font-black rounded-xl md:rounded-2xl transform hover:rotate-1 hover:scale-110 transition-all text-xs md:text-sm px-4 py-2 shadow-xl animate-pulse"
                              style={{ 
                                fontFamily: "Fredoka One, Arial Black, sans-serif",
                                textShadow: "1px 1px 0px rgba(255,255,255,0.3)"
                              }}
                            >
                              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                              CREATE MORE! ✨
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 md:gap-3">
                            <Button
                              className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-xl md:rounded-2xl shadow-lg transform hover:scale-105 transition-all text-xs md:text-sm px-3 py-2"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              HD 💎
                            </Button>
                          </div>
                        </div>
                      )}


                    </div>
                  </div>
                </TabsContent>
                </div>
              </div>

              {/* Sidebar - Dynamic content based on creation mode，在MAGIC、DONE、渲染界面时隐藏 */}
              {!showPromptsCommunity && currentStep !== "result" && currentStep !== "rendering" && (
              <div ref={rightContentRef} className={`w-full lg:w-1/3 space-y-4 md:space-y-6 order-2 lg:order-2`}>

                {/* Recommendation Gallery - Only show when not rendering */}
                {!isRendering && currentStep === "create" && (
                  <RecommendationGallery 
                    onUsePrompt={handleUsePrompt}
                    className="mb-4"
                  />
                )}

                {/* Default Prompts Library - Only show when not rendering */}
                {!isRendering && currentStep === "create" && (
                  <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 md:border-4 border-[#2d3e2d] transform hover:scale-[1.02] transition-all">
                    <div className="bg-[#8b7355] p-3 md:p-4 relative">
                      <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-4 h-4 md:w-6 md:h-6 bg-[#d4a574] rounded-full"></div>
                      <h3
                        className="text-lg md:text-xl font-black text-[#f5f1e8] transform rotate-1"
                        style={{
                          fontFamily: "Fredoka One, Arial Black, sans-serif",
                          textShadow: "1px 1px 0px #2d3e2d",
                        }}
                      >
                        Magic Prompt Library! ✨
                      </h3>
                    </div>
                    <div className="p-3 md:p-4">
                      <CommunityGallery 
                        onUsePrompt={handleUsePrompt} 
                        onViewMore={handleViewPromptsCommunity}
                        creationMode={creationMode}
                        mode={interfaceMode as "pro" | "quick"}
                      />
                    </div>
                  </div>
                )}

                {/* Dynamic additional boxes */}
                {Array.from({ length: sidebarBoxes - 2 }, (_, index) => {
                  const box = additionalBoxes[index]
                  if (!box) return null
                  
                  // Skip Magic Prompts box - it's moved to navigation bar
                  if (box.title === "MAGIC PROMPTS! ✨") {
                    return null
                  }
                  
                  // Skip Daily Challenges box in MAGIC界面 (prompts community)、DONE界面、以及生图过程中
                  if (box.title === "DAILY CHALLENGES! 🏆" && (showPromptsCommunity || currentStep === "result" || isRendering)) {
                    return null
                  }
                  
                  return (
                    <div key={index} className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 md:border-4 border-[#2d3e2d] transform hover:scale-[1.02] transition-all">
                      <div className="bg-[#8b7355] p-3 md:p-4 relative">
                        <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-4 h-4 md:w-6 md:h-6 bg-[#d4a574] rounded-full"></div>
                        <h3
                          className="text-lg md:text-xl font-black text-[#f5f1e8] transform rotate-1"
                          style={{
                            fontFamily: "Fredoka One, Arial Black, sans-serif",
                            textShadow: "1px 1px 0px #2d3e2d",
                          }}
                        >
                          {box.title}
                        </h3>
                      </div>
                      <div className="p-3 md:p-4">
                        <div
                          className="text-[#2d3e2d] font-bold space-y-1 text-sm md:text-base"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {box.content.map((item, itemIndex) => (
                            <p key={itemIndex}>{item}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Upgrade - 只在CREATE时显示，DONE时隐藏 */}
                {currentStep === "create" && (
                <div className="bg-[#4a5a4a] rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 md:border-4 border-[#d4a574] transform hover:scale-[1.02] transition-all">
                  <div className="p-4 md:p-6 text-center relative">
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-8 md:h-8 bg-[#2d3e2d] rounded-full"></div>
                    <div className="absolute -bottom-1 -left-1 md:-bottom-2 md:-left-2 w-3 h-3 md:w-6 md:h-6 bg-[#8b7355] rounded-full"></div>
                    <div className="text-3xl md:text-4xl mb-2 md:mb-3">
                      {creationMode.includes("video") ? "🎬" : "🪄"}
                    </div>
                    <h3
                      className="text-lg md:text-2xl font-black text-[#f5f1e8] mb-2 md:mb-3 transform rotate-1"
                      style={{
                        fontFamily: "Fredoka One, Arial Black, sans-serif",
                        textShadow: "2px 2px 0px #8b7355",
                      }}
                    >
                      {creationMode.includes("video") ? "UNLOCK VIDEO PRO!" : "UNLOCK MORE MAGIC!"}
                    </h3>
                    <div
                      className="text-[#f5f1e8] font-bold space-y-1 md:space-y-2 mb-3 md:mb-4 text-sm md:text-base"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      {creationMode.includes("video") ? (
                        <>
                          <p>🎬 Unlimited videos!</p>
                          <p>⚡ 60-second length!</p>
                          <p>💾 4K downloads!</p>
                        </>
                      ) : (
                        <>
                          <p>⚡ Unlimited generations!</p>
                          <p>🚀 Lightning fast AI!</p>
                          <p>💎 Ultra HD downloads!</p>
                        </>
                      )}
                    </div>
                    <Button
                      className="w-full bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black py-2 md:py-3 rounded-xl md:rounded-2xl shadow-lg transform hover:scale-105 transition-all text-sm md:text-base"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      {creationMode.includes("video") ? "GET VIDEO PRO! 🎬" : "GET AIMAGICA PRO! 🚀"}
                    </Button>
                  </div>
                </div>
                )}
              </div>
              )}
            </div>
          </Tabs>
        </main>

        {/* 其余部分保持不变... */}
        
        {/* 管理员精选作品展示区域 - 动态显示 */}
        <FeaturedImagesSection />
        
        {/* SEO优化的特色部分 */}
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
                AIMAGICA Features ✨
              </h2>
              <p
                className="text-lg md:text-xl font-bold text-[#8b7355] max-w-3xl mx-auto"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Turn your simple sketches into stunning art in seconds!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {/* 特色1 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(-1deg)" }}
              >
                <div className="w-16 h-16 bg-[#d4a574] rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                  <PenTool className="w-8 h-8 text-[#2d3e2d]" />
                </div>
                <h3
                  className="text-xl font-black text-[#2d3e2d] mb-2"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  Simple Drawing 🖌️
                </h3>
                <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  No art skills needed! Just doodle, and AI magic will do the rest. Perfect for all ages and skill
                  levels!
                </p>
              </div>

              {/* 特色2 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(1deg)" }}
              >
                <div className="w-16 h-16 bg-[#8b7355] rounded-2xl flex items-center justify-center mb-4 transform -rotate-3">
                  <Layers className="w-8 h-8 text-[#f5f1e8]" />
                </div>
                <h3
                  className="text-xl font-black text-[#2d3e2d] mb-2"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  50+ Art Styles 🎭
                </h3>
                <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  From anime to oil painting, from cyberpunk to watercolor, choose your favorite style and let AI add
                  magic to your creation!
                </p>
              </div>

              {/* 特色3 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(-0.5deg)" }}
              >
                <div className="w-16 h-16 bg-[#2d3e2d] rounded-2xl flex items-center justify-center mb-4 transform rotate-6">
                  <Zap className="w-8 h-8 text-[#f5f1e8]" />
                </div>
                <h3
                  className="text-xl font-black text-[#2d3e2d] mb-2"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  Lightning Speed ⚡
                </h3>
                <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  Witness your creation turn into an art masterpiece in just 30 seconds! No waiting, enjoy the fun of
                  creating instantly!
                </p>
              </div>

              {/* 特色4 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(0.5deg)" }}
              >
                <div className="w-16 h-16 bg-[#d4a574] rounded-2xl flex items-center justify-center mb-4 transform -rotate-6">
                  <ImageIcon className="w-8 h-8 text-[#2d3e2d]" />
                </div>
                <h3
                  className="text-xl font-black text-[#2d3e2d] mb-2"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  HD Download 💎
                </h3>
                <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  Get standard resolution images for free, upgrade to PRO for ultra HD downloads, perfect for printing
                  and sharing!
                </p>
              </div>
            </div>
          </div>

          {/* 装饰元素 */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4a574]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-20 w-60 h-60 bg-[#2d3e2d]/10 rounded-full blur-3xl"></div>
        </section>

        {/* 如何工作部分 */}
        <section className="py-12 md:py-16 bg-[#4a5a4a] text-white relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-16">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-black text-[#f5f1e8] mb-4 transform rotate-1"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "3px 3px 0px #8b7355",
                }}
              >
                How It Works 🪄
              </h2>
              <p
                className="text-lg md:text-xl font-bold text-[#d4a574] max-w-3xl mx-auto"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Just four simple steps, witness the magic power of AI!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4">
              {/* 步骤1 */}
              <div className="relative">
                <div
                  className="bg-[#f5f1e8] rounded-2xl border-4 border-[#8b7355] p-6 shadow-xl h-full transform hover:scale-105 transition-all"
                  style={{ transform: "rotate(-1deg)" }}
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#d4a574] rounded-full flex items-center justify-center border-2 border-[#2d3e2d] shadow-lg">
                    <span
                      className="text-[#2d3e2d] font-black text-xl"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      1
                    </span>
                  </div>
                  <div className="text-4xl mb-4">✏️</div>
                  <h3
                    className="text-xl font-black text-[#2d3e2d] mb-2"
                    style={{
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "1px 1px 0px #d4a574",
                    }}
                  >
                    Draw Your Idea
                  </h3>
                  <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    Use our simple drawing tools to draw your ideas, no complex details needed, just simple lines!
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-[#d4a574]" />
                </div>
              </div>

              {/* 步骤2 */}
              <div className="relative">
                <div
                  className="bg-[#f5f1e8] rounded-2xl border-4 border-[#8b7355] p-6 shadow-xl h-full transform hover:scale-105 transition-all"
                  style={{ transform: "rotate(1deg)" }}
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#d4a574] rounded-full flex items-center justify-center border-2 border-[#2d3e2d] shadow-lg">
                    <span
                      className="text-[#2d3e2d] font-black text-xl"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      2
                    </span>
                  </div>
                  <div className="text-4xl mb-4">🎭</div>
                  <h3
                    className="text-xl font-black text-[#2d3e2d] mb-2"
                    style={{
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "1px 1px 0px #d4a574",
                    }}
                  >
                    Choose Magic Style
                  </h3>
                  <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    Choose from over 50 art styles, from anime to oil painting, from cyberpunk to watercolor, we have it
                    all!
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-[#d4a574]" />
                </div>
              </div>

              {/* 步骤3 */}
              <div className="relative">
                <div
                  className="bg-[#f5f1e8] rounded-2xl border-4 border-[#8b7355] p-6 shadow-xl h-full transform hover:scale-105 transition-all"
                  style={{ transform: "rotate(-0.5deg)" }}
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#d4a574] rounded-full flex items-center justify-center border-2 border-[#2d3e2d] shadow-lg">
                    <span
                      className="text-[#2d3e2d] font-black text-xl"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      3
                    </span>
                  </div>
                  <div className="text-4xl mb-4">✨</div>
                  <h3
                    className="text-xl font-black text-[#2d3e2d] mb-2"
                    style={{
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "1px 1px 0px #d4a574",
                    }}
                  >
                    AI Magic Processing
                  </h3>
                  <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    Our AI magician will turn your simple sketch into a beautiful work of art in 30 seconds!
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-[#d4a574]" />
                </div>
              </div>

              {/* 步骤4 */}
              <div>
                <div
                  className="bg-[#f5f1e8] rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl h-full transform hover:scale-105 transition-all"
                  style={{ transform: "rotate(0.5deg)" }}
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-[#d4a574] rounded-full flex items-center justify-center border-2 border-[#2d3e2d] shadow-lg">
                    <span
                      className="text-[#2d3e2d] font-black text-xl"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      4
                    </span>
                  </div>
                  <div className="text-4xl mb-4">🎉</div>
                  <h3
                    className="text-xl font-black text-[#2d3e2d] mb-2"
                    style={{
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "1px 1px 0px #d4a574",
                    }}
                  >
                    Share Your Masterpiece
                  </h3>
                  <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    Download, share your creation, or continue editing to improve it! Let the world see your magic
                    ideas!
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button
                className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-8 py-4 rounded-2xl shadow-xl transform hover:scale-110 transition-all text-lg"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating Now!
              </Button>
            </div>
          </div>

          {/* 装饰元素 */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#d4a574]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 right-20 w-60 h-60 bg-[#8b7355]/20 rounded-full blur-3xl"></div>
        </section>

        {/* 用户评价部分 */}
        <TestimonialsCarousel />

        {/* 常见问题部分 */}
        <section className="py-12 md:py-16 bg-[#4a5a4a] text-white relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-16">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-black text-[#f5f1e8] mb-4 transform rotate-1"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "3px 3px 0px #8b7355",
                }}
              >
                FAQ 🤔
              </h2>
              <p
                className="text-lg md:text-xl font-bold text-[#d4a574] max-w-3xl mx-auto"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Everything you want to know about AIMAGICA is here!
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem
                  value="item-1"
                  className="bg-[#f5f1e8] rounded-2xl border-4 border-[#8b7355] shadow-xl overflow-hidden"
                >
                  <AccordionTrigger
                    className="px-6 py-4 hover:no-underline"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <span className="font-black text-[#2d3e2d] text-left">
                      Do I need drawing skills to use AIMAGICA?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      Absolutely not! AIMAGICA is designed for users of all ages and skill levels. Just doodle, and AI
                      magic will do the rest.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-2"
                  className="bg-[#f5f1e8] rounded-2xl border-4 border-[#8b7355] shadow-xl overflow-hidden"
                >
                  <AccordionTrigger
                    className="px-6 py-4 hover:no-underline"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <span className="font-black text-[#2d3e2d] text-left">
                      How long does it take to generate an image?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      AIMAGICA generates stunning artwork in approximately 30 seconds, allowing you to quickly bring
                      your ideas to life.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-3"
                  className="bg-[#f5f1e8] rounded-2xl border-4 border-[#8b7355] shadow-xl overflow-hidden"
                >
                  <AccordionTrigger
                    className="px-6 py-4 hover:no-underline"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <span className="font-black text-[#2d3e2d] text-left">
                      Can I use AIMAGICA for commercial purposes?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      Yes, images generated with AIMAGICA can be used for both personal and commercial purposes, giving
                      you the freedom to create and monetize your art.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-4"
                  className="bg-[#f5f1e8] rounded-2xl border-4 border-[#8b7355] shadow-xl overflow-hidden"
                >
                  <AccordionTrigger
                    className="px-6 py-4 hover:no-underline"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <span className="font-black text-[#2d3e2d] text-left">
                      What art styles are available in AIMAGICA?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      AIMAGICA offers a wide range of art styles, including anime, oil painting, cyberpunk, watercolor,
                      and many more, allowing you to explore and create diverse artistic expressions.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-5"
                  className="bg-[#f5f1e8] rounded-2xl border-4 border-[#8b7355] shadow-xl overflow-hidden"
                >
                  <AccordionTrigger
                    className="px-6 py-4 hover:no-underline"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <span className="font-black text-[#2d3e2d] text-left">
                      What's the difference between free and PRO versions?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      The free version allows you to create standard resolution images with limited daily uses. The PRO
                      version offers unlimited daily uses, ultra HD downloads, exclusive art styles, and priority
                      processing.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* 装饰元素 */}
          <div className="absolute -top-10 right-20 w-40 h-40 bg-[#d4a574]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 -left-20 w-60 h-60 bg-[#8b7355]/20 rounded-full blur-3xl"></div>
        </section>

        {/* 完整的页脚 */}
        <footer className="bg-[#4a5a4a] text-white py-12 md:py-16 relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            {/* 主要页脚内容 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* 公司信息 */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#d4a574] rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                    <Sparkles className="w-6 h-6 text-[#2d3e2d]" />
                  </div>
                  <div>
                    <h3
                      className="text-2xl font-black text-[#f5f1e8] transform -rotate-1"
                      style={{
                        fontFamily: "Fredoka One, Arial Black, sans-serif",
                        textShadow: "2px 2px 0px #8b7355",
                      }}
                    >
                      AIMAGICA
                    </h3>
                  </div>
                </div>
                <p
                  className="text-[#d4a574] font-bold text-sm leading-relaxed"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  Turn your simple sketches into stunning art with AI magic! Join millions of creators worldwide and
                  unlock your creative potential.
                </p>
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 rounded-full bg-[#8b7355] hover:bg-[#d4a574] text-white hover:text-[#2d3e2d] transition-all transform hover:scale-110"
                  >
                    <Facebook className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 rounded-full bg-[#8b7355] hover:bg-[#d4a574] text-white hover:text-[#2d3e2d] transition-all transform hover:scale-110"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 rounded-full bg-[#8b7355] hover:bg-[#d4a574] text-white hover:text-[#2d3e2d] transition-all transform hover:scale-110"
                  >
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-10 h-10 rounded-full bg-[#8b7355] hover:bg-[#d4a574] text-white hover:text-[#2d3e2d] transition-all transform hover:scale-110"
                  >
                    <Youtube className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 产品链接 */}
              <div className="space-y-4">
                <h4
                  className="text-lg font-black text-[#f5f1e8] mb-4"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #8b7355",
                  }}
                >
                  Products 🎨
                </h4>
                <div className="space-y-3">
                  <Link
                    href="/"
                    className="block text-[#d4a574] hover:text-[#f5f1e8] font-bold transition-colors text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    AI Drawing Tool
                  </Link>
                  <Link
                    href="/gallery"
                    className="block text-[#d4a574] hover:text-[#f5f1e8] font-bold transition-colors text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Art Gallery
                  </Link>
                  <Link
                    href="/mobile-glass"
                    className="block text-[#d4a574] hover:text-[#f5f1e8] font-bold transition-colors text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Mobile App
                  </Link>

                </div>
              </div>

              {/* 公司链接 */}
              <div className="space-y-4">
                <h4
                  className="text-lg font-black text-[#f5f1e8] mb-4"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #8b7355",
                  }}
                >
                  Company 🏢
                </h4>
                <div className="space-y-3">
                  <Link
                    href="/about"
                    className="block text-[#d4a574] hover:text-[#f5f1e8] font-bold transition-colors text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/blog"
                    className="block text-[#d4a574] hover:text-[#f5f1e8] font-bold transition-colors text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Blog
                  </Link>

                </div>
              </div>

              {/* 支持和联系 */}
              <div className="space-y-4">
                <h4
                  className="text-lg font-black text-[#f5f1e8] mb-4"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #8b7355",
                  }}
                >
                  Support 🤝
                </h4>
                <div className="space-y-3">
                  <Link
                    href="/help"
                    className="flex items-center text-[#d4a574] hover:text-[#f5f1e8] font-bold transition-colors text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help Center
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center text-[#d4a574] hover:text-[#f5f1e8] font-bold transition-colors text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Us
                  </Link>

                </div>
              </div>
            </div>

            {/* 邮件订阅 */}
            <div className="border-t border-[#8b7355] pt-8 mb-8">
              <div className="max-w-md mx-auto text-center">
                <h4
                  className="text-xl font-black text-[#f5f1e8] mb-4"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #8b7355",
                  }}
                >
                  Stay Updated! 📧
                </h4>
                <p className="text-[#d4a574] font-bold mb-4 text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  Get the latest updates, tips, and exclusive content delivered to your inbox!
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your magic email..."
                    className="flex-1 bg-[#f5f1e8] border-2 border-[#8b7355] rounded-xl text-[#2d3e2d] placeholder:text-[#8b7355] font-bold"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  />
                  <Button
                    className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-xl px-4 transform hover:scale-105 transition-all"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 法律链接和版权 */}
            <div className="border-t border-[#8b7355] pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
                  <Link
                    href="/privacy"
                    className="flex items-center text-[#d4a574] hover:text-[#f5f1e8] font-bold transition-colors text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="flex items-center text-[#d4a574] hover:text-[#f5f1e8] font-bold transition-colors text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Terms of Service
                  </Link>
                  <Link
                    href="/cookies"
                    className="text-[#d4a574] hover:text-[#f5f1e8] font-bold transition-colors text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Cookie Policy
                  </Link>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[#d4a574] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    © 2024 AIMAGICA. All rights reserved. Made with ❤️ and AI magic!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 装饰元素 */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#d4a574]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-[#8b7355]/10 rounded-full blur-3xl"></div>
        </footer>
      </div>

      {/* 生图完成音效和动态提示组件 */}
      <GenerationCompletionAlert
        isVisible={showCompletionAlert}
        onDismiss={() => setShowCompletionAlert(false)}
      />

      {/* 图片查看器 */}
      {showImageViewer && viewingImageUrl && (
        <ImageViewer
          imageUrl={viewingImageUrl}
          onClose={handleCloseImageViewer}
        />
      )}

    </div>
  )
}
