"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Film,
  ImageIcon,
  Share2,
  Download,
  Heart,
  Menu,
  X,
  Crown,
  SparklesIcon,
  Eye,
  MessageCircle,
  Star,
  Zap,
  Users,
  Layers,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import VideoCreationInterface from "@/components/video-creation-interface"
import RenderProgress from "@/components/render-progress"
import { useRouter } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Head from "next/head"
import Link from "next/link"

export default function VideoCreationPage() {
  const [currentStep, setCurrentStep] = useState("create")
  const [isRendering, setIsRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const renderProgressRef = useRef<HTMLDivElement>(null)

  const handleStartRender = () => {
    setIsRendering(true)
    setCurrentStep("rendering")
    
    // 自动滚动到生图进度组件
    setTimeout(() => {
      if (renderProgressRef.current) {
        renderProgressRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 100)

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      if (progress >= 100) {
        progress = 100
        setIsRendering(false)
        setGeneratedVideo("/placeholder.svg?height=480&width=640&text=Generated+Video")
        setCurrentStep("result")
        clearInterval(interval)
      }
      setRenderProgress(progress)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] relative overflow-hidden pb-8">
      {/* SEO优化的元数据 */}
      <Head>
        <title>AIMAGICA Video Studio - 创建令人惊叹的AI视频 | 文本到视频 | 图像到视频</title>
        <meta
          name="description"
          content="使用AIMAGICA Video Studio将你的创意转变为精美视频。支持文本到视频和图像到视频转换，多种风格选择，30秒内完成，免费开始使用！"
        />
        <meta name="keywords" content="AI视频生成,文本到视频,图像到视频,AI动画,视频创作工具,AIMAGICA,AI创意工具" />
        <meta property="og:title" content="AIMAGICA Video Studio - 创建令人惊叹的AI视频" />
        <meta
          property="og:description"
          content="使用AIMAGICA Video Studio将你的创意转变为精美视频。支持文本到视频和图像到视频转换，多种风格选择，快速生成！"
        />
        <meta property="og:image" content="/images/aimagica-video-preview.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://aimagica.com/video-creation" />
      </Head>

      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#8b7355]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-[#2d3e2d]/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#d4a574]/20 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10">
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
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "2px 2px 0px #333",
                    }}
                  >
                    AIMAGICA
                  </h1>
                  <p
                    className="text-xs text-gray-400 transform rotate-1"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Video Studio 🎬
                  </p>
                </div>
              </div>

              {/* 桌面导航菜单 */}
              <nav className="hidden md:flex items-center space-x-1">
                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  HOME 🏠
                </Button>

                <Button
                  onClick={() => router.push("/gallery")}
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  GALLERY 🖼️
                </Button>

                <Button
                  variant="ghost"
                  className="text-[#d4a574] hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all border-b-2 border-[#d4a574]"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  VIDEO STUDIO 🎬
                </Button>

                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-2 transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  LEARN 📚
                </Button>
              </nav>

              {/* PRO按钮和移动菜单 */}
              <div className="flex items-center space-x-3">
                <Button
                  className="bg-[#d4a574] hover:bg-[#c19660] text-black font-black px-3 py-2 rounded-xl shadow-lg transform hover:rotate-1 hover:scale-105 transition-all text-xs md:text-sm"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  PRO
                </Button>

                {/* 移动菜单按钮 */}
                <Button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  variant="ghost"
                  className="md:hidden text-white hover:bg-white/10 p-2 rounded-xl"
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* 移动导航菜单 */}
            {showMobileMenu && (
              <div className="md:hidden mt-4 p-4 bg-[#1a1a1a] rounded-xl border-2 border-[#333] shadow-lg">
                <nav className="flex flex-col space-y-2">
                  <Button
                    onClick={() => {
                      router.push("/")
                      setShowMobileMenu(false)
                    }}
                    variant="ghost"
                    className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <SparklesIcon className="w-4 h-4 mr-3" />
                    HOME 🏠
                  </Button>

                  <Button
                    onClick={() => {
                      router.push("/gallery")
                      setShowMobileMenu(false)
                    }}
                    variant="ghost"
                    className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Eye className="w-4 h-4 mr-3" />
                    GALLERY 🖼️
                  </Button>

                  <Button
                    variant="ghost"
                    className="text-[#d4a574] hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all border-l-4 border-[#d4a574]"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <MessageCircle className="w-4 h-4 mr-3" />
                    VIDEO STUDIO 🎬
                  </Button>

                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10 font-black rounded-xl px-4 py-3 text-left justify-start transform hover:scale-105 transition-all"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Star className="w-4 h-4 mr-3" />
                    LEARN 📚
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-black text-[#2d3e2d] mb-4 transform -rotate-1"
              style={{
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "3px 3px 0px #d4a574",
              }}
            >
              AIMAGICA VIDEO STUDIO 🎬
            </h1>
            <p
              className="text-lg md:text-2xl font-bold text-[#8b7355] max-w-3xl mx-auto"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              将你的创意转变为令人惊叹的视频，只需几秒钟！
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="bg-[#d4a574]/20 text-[#2d3e2d] px-3 py-1 rounded-full text-sm font-bold">
                文本到视频 ✨
              </span>
              <span className="bg-[#d4a574]/20 text-[#2d3e2d] px-3 py-1 rounded-full text-sm font-bold">
                图像到视频 🖼️
              </span>
              <span className="bg-[#d4a574]/20 text-[#2d3e2d] px-3 py-1 rounded-full text-sm font-bold">
                多种视频风格 🎭
              </span>
              <span className="bg-[#d4a574]/20 text-[#2d3e2d] px-3 py-1 rounded-full text-sm font-bold">
                高清视频输出 💎
              </span>
            </div>
          </div>

          {/* Main content */}
          <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#2d3e2d] rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-xl">
              <TabsTrigger
                value="create"
                className="rounded-xl md:rounded-2xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Film className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                CREATE! 🎬
              </TabsTrigger>
              <TabsTrigger
                value="rendering"
                className="rounded-xl md:rounded-2xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm"
                disabled={!isRendering}
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <ImageIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                MAGIC! ✨
              </TabsTrigger>
              <TabsTrigger
                value="result"
                className="rounded-xl md:rounded-2xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] data-[state=active]:shadow-lg text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm"
                disabled={!generatedVideo}
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Film className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                DONE! 🎉
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 md:mt-8">
              <TabsContent value="create" className="mt-0">
                <div className="mb-6 md:mb-8">
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="bg-white/80 border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574]/20 rounded-xl"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      <span className="font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        Back to Home
                      </span>
                    </Button>
                  </Link>
                </div>
                <VideoCreationInterface onStartRender={handleStartRender} />
              </TabsContent>

              <TabsContent value="rendering" className="mt-0">
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 md:border-4 border-[#2d3e2d] transform hover:scale-[1.02] transition-all">
                  <div className="bg-[#2d3e2d] p-4 md:p-6 relative">
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-8 md:h-8 bg-[#d4a574] rounded-full"></div>
                    <div className="absolute -bottom-1 -left-1 md:-bottom-2 md:-left-2 w-3 h-3 md:w-6 md:h-6 bg-[#8b7355] rounded-full"></div>
                    <h2
                      className="text-xl md:text-3xl font-black text-[#f5f1e8] mb-2 transform -rotate-1"
                      style={{
                        fontFamily: "Fredoka One, Arial Black, sans-serif",
                        textShadow: "2px 2px 0px #8b7355",
                      }}
                    >
                      CREATING YOUR MAGIC VIDEO! 🎬
                    </h2>
                    <p
                      className="text-[#f5f1e8] font-bold text-sm md:text-base"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      Our AI wizards are working hard to bring your vision to life! ✨
                    </p>
                  </div>
                  <div className="p-4 md:p-6">
                    <div ref={renderProgressRef}>
                      <RenderProgress progress={renderProgress} />
                    </div>
                    <div className="mt-4 text-center">
                      <p
                        className="text-[#8b7355] font-bold text-sm md:text-base"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        Video creation takes a bit longer than images. Thanks for your patience! 🙏
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="result" className="mt-0">
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
                      YOUR AIMAGICA VIDEO IS READY! 🎉
                    </h2>
                    <p
                      className="text-sm md:text-base text-[#2d3e2d] font-bold"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      The magic worked! Share your amazing creation! 🚀
                    </p>
                  </div>
                  <div className="p-4 md:p-6">
                    {generatedVideo && (
                      <div className="space-y-4 md:space-y-6">
                        <div className="relative group">
                          <video
                            src={generatedVideo}
                            controls
                            poster="/placeholder.svg?height=480&width=640&text=Generated+Video"
                            className="w-full rounded-xl md:rounded-2xl shadow-xl border-2 md:border-4 border-[#8b7355]"
                          />
                        </div>

                        {/* Mobile-optimized button layout */}
                        <div className="flex flex-col md:flex-row justify-between gap-3 md:gap-0">
                          <div className="flex flex-wrap gap-2 md:gap-3">
                            <Button
                              variant="outline"
                              className="bg-[#f5f1e8] border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-black rounded-xl md:rounded-2xl transform hover:rotate-1 transition-all text-xs md:text-sm px-3 py-2"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              <Heart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              LOVE IT! ❤️
                            </Button>
                            <Button
                              variant="outline"
                              className="bg-[#f5f1e8] border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-black rounded-xl md:rounded-2xl transform hover:rotate-1 transition-all text-xs md:text-sm px-3 py-2"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              SHARE 📤
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 md:gap-3">
                            <Button
                              variant="outline"
                              className="bg-[#f5f1e8] border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-black rounded-xl md:rounded-2xl transform hover:rotate-1 transition-all text-xs md:text-sm px-3 py-2"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              FREE DL 📥
                            </Button>
                            <Button
                              className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-xl md:rounded-2xl shadow-lg transform hover:scale-105 transition-all text-xs md:text-sm px-3 py-2"
                              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                            >
                              <Film className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              HD VIDEO 💎
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* 视频特色部分 */}
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
                AIMAGICA 视频魔法特色 ✨
              </h2>
              <p
                className="text-lg md:text-xl font-bold text-[#8b7355] max-w-3xl mx-auto"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                探索我们强大的AI视频创作功能，让你的创意栩栩如生！
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {/* 特色1 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(-1deg)" }}
              >
                <div className="w-16 h-16 bg-[#d4a574] rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                  <Film className="w-8 h-8 text-[#2d3e2d]" />
                </div>
                <h3
                  className="text-xl font-black text-[#2d3e2d] mb-2"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  文本到视频 📝
                </h3>
                <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  只需描述你的创意，AI就能将你的文字转化为生动的视频。从奇幻场景到现实生活，一切皆有可能！
                </p>
              </div>

              {/* 特色2 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(1deg)" }}
              >
                <div className="w-16 h-16 bg-[#8b7355] rounded-2xl flex items-center justify-center mb-4 transform -rotate-3">
                  <ImageIcon className="w-8 h-8 text-[#f5f1e8]" />
                </div>
                <h3
                  className="text-xl font-black text-[#2d3e2d] mb-2"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  图像到视频 🖼️
                </h3>
                <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  上传你的静态图像，让它们动起来！为你的照片、插图或艺术作品注入生命，创造令人惊叹的动态效果。
                </p>
              </div>

              {/* 特色3 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(-0.5deg)" }}
              >
                <div className="w-16 h-16 bg-[#2d3e2d] rounded-2xl flex items-center justify-center mb-4 transform rotate-6">
                  <Layers className="w-8 h-8 text-[#f5f1e8]" />
                </div>
                <h3
                  className="text-xl font-black text-[#2d3e2d] mb-2"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  多种视频风格 🎭
                </h3>
                <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  从电影级画面到动漫风格，从3D卡通到水彩动画，多种视频风格任你选择，让你的创作独具特色！
                </p>
              </div>

              {/* 特色4 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(0.5deg)" }}
              >
                <div className="w-16 h-16 bg-[#d4a574] rounded-2xl flex items-center justify-center mb-4 transform -rotate-6">
                  <Zap className="w-8 h-8 text-[#2d3e2d]" />
                </div>
                <h3
                  className="text-xl font-black text-[#2d3e2d] mb-2"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  快速生成 ⚡
                </h3>
                <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  无需等待数小时！我们的AI技术能在几分钟内生成高质量视频，让你的创意立即成为现实。
                </p>
              </div>
            </div>
          </div>

          {/* 装饰元素 */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#d4a574]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-20 w-60 h-60 bg-[#2d3e2d]/10 rounded-full blur-3xl"></div>
        </section>

        {/* 如何工作部分 */}
        <section className="py-12 md:py-16 bg-[#2d3e2d] text-white relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-16">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-black text-[#f5f1e8] mb-4 transform rotate-1"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "3px 3px 0px #8b7355",
                }}
              >
                视频魔法如何运作 🪄
              </h2>
              <p
                className="text-lg md:text-xl font-bold text-[#d4a574] max-w-3xl mx-auto"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                只需简单四步，见证你的创意变成精彩视频！
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
                  <div className="text-4xl mb-4">📝</div>
                  <h3
                    className="text-xl font-black text-[#2d3e2d] mb-2"
                    style={{
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "1px 1px 0px #d4a574",
                    }}
                  >
                    描述你的创意
                  </h3>
                  <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    输入文字描述你想要的视频场景，或上传一张图片作为起点。越详细的描述，效果越好！
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
                    选择视频风格
                  </h3>
                  <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    从多种视频风格中选择，如电影级、动漫、3D卡通、像素艺术等，定制你的视频外观。
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
                    AI魔法处理
                  </h3>
                  <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    我们的AI魔法师将在几分钟内处理你的请求，生成高质量、流畅的视频内容。
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="w-8 h-8 text-[#d4a574]" />
                </div>
              </div>

              {/* 步骤4 */}
              <div>
                <div
                  className="bg-[#f5f1e8] rounded-2xl border-4 border-[#8b7355] p-6 shadow-xl h-full transform hover:scale-105 transition-all"
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
                    分享你的视频
                  </h3>
                  <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    下载、分享你的视频创作，或继续编辑完善！让全世界看到你的魔法创意！
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button
                className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-8 py-4 rounded-2xl shadow-xl transform hover:scale-110 transition-all text-lg"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Film className="w-5 h-5 mr-2" />
                立即创建视频！
              </Button>
            </div>
          </div>

          {/* 装饰元素 */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#d4a574]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 right-20 w-60 h-60 bg-[#8b7355]/20 rounded-full blur-3xl"></div>
        </section>

        {/* Video Examples Section */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2
            className="text-2xl md:text-3xl font-black text-[#2d3e2d] mb-6 text-center transform -rotate-1"
            style={{
              fontFamily: "Fredoka One, Arial Black, sans-serif",
              textShadow: "2px 2px 0px #d4a574",
            }}
          >
            MAGICAL VIDEO EXAMPLES ✨
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Dancing Wizard Cat",
                description: "A magical cat wizard casting colorful spells in a fantasy forest",
                thumbnail: "/placeholder.svg?height=200&width=320&text=Dancing+Wizard+Cat",
              },
              {
                title: "Cyberpunk City",
                description: "A futuristic cityscape with neon lights and flying vehicles",
                thumbnail: "/placeholder.svg?height=200&width=320&text=Cyberpunk+City",
              },
              {
                title: "Underwater Adventure",
                description: "Exploring a magical underwater kingdom with mermaids and sea creatures",
                thumbnail: "/placeholder.svg?height=200&width=320&text=Underwater+Adventure",
              },
              {
                title: "Space Odyssey",
                description: "Journey through colorful nebulas and distant galaxies",
                thumbnail: "/placeholder.svg?height=200&width=320&text=Space+Odyssey",
              },
              {
                title: "Enchanted Forest",
                description: "Magical creatures and glowing plants in a mystical forest",
                thumbnail: "/placeholder.svg?height=200&width=320&text=Enchanted+Forest",
              },
              {
                title: "Dragon's Lair",
                description: "A mighty dragon guarding its treasure in a mountain cave",
                thumbnail: "/placeholder.svg?height=200&width=320&text=Dragon+Lair",
              },
            ].map((example, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border-2 border-[#8b7355] shadow-lg overflow-hidden transform hover:scale-[1.03] transition-all"
              >
                <div className="relative aspect-video">
                  <img
                    src={example.thumbnail || "/placeholder.svg"}
                    alt={example.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-3 text-white">
                      <h3 className="font-black text-lg" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        {example.title}
                      </h3>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-[#d4a574] text-[#2d3e2d] rounded-full px-2 py-1 text-xs font-bold">
                    15s
                  </div>
                  <Button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2d3e2d]/70 hover:bg-[#2d3e2d] text-white rounded-full w-12 h-12 flex items-center justify-center">
                    <Film className="w-6 h-6" />
                  </Button>
                </div>
                <div className="p-3">
                  <p className="text-[#8b7355] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    {example.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              className="bg-[#2d3e2d] hover:bg-[#1a2a1a] text-[#f5f1e8] font-black px-6 py-3 rounded-2xl shadow-xl transform hover:scale-110 transition-all text-base"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <Film className="w-5 h-5 mr-2" />
              View Video Gallery
            </Button>
          </div>
        </section>

        {/* 用户评价部分 */}
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
                视频魔法师们的评价 💬
              </h2>
              <p
                className="text-lg md:text-xl font-bold text-[#8b7355] max-w-3xl mx-auto"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                看看其他创作者如何使用AIMAGICA Video Studio创造精彩视频！
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* 评价1 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(-1deg)" }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#8b7355] mr-4">
                    <img
                      src="/placeholder.svg?height=100&width=100&text=David"
                      alt="David, a content creator who uses AIMAGICA Video Studio"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      David M.
                    </h4>
                    <div className="flex text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-[#8b7355] font-bold mb-4" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  "作为一名内容创作者，AIMAGICA Video
                  Studio彻底改变了我的工作方式！我可以快速将创意转变为精美视频，为我的社交媒体带来了更多互动和关注。"
                </p>
                <div className="flex justify-end">
                  <span className="text-[#d4a574] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    内容创作者
                  </span>
                </div>
              </div>

              {/* 评价 2 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(0.5deg)" }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#8b7355] mr-4">
                    <img
                      src="/placeholder.svg?height=100&width=100&text=Emma"
                      alt="Emma, a marketing professional who uses AIMAGICA Video Studio"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      Emma L.
                    </h4>
                    <div className="flex text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-[#8b7355] font-bold mb-4" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  "我们的营销团队使用AIMAGICA Video
                  Studio创建产品演示和社交媒体内容。它不仅节省了我们的时间和预算，还提高了我们内容的质量和吸引力。绝对是营销人员的必备工具！"
                </p>
                <div className="flex justify-end">
                  <span className="text-[#d4a574] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    营销经理
                  </span>
                </div>
              </div>

              {/* 评价 3 */}
              <div
                className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: "rotate(-0.5deg)" }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#8b7355] mr-4">
                    <img
                      src="/placeholder.svg?height=100&width=100&text=Alex"
                      alt="Alex, a student who uses AIMAGICA Video Studio"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      Alex K.
                    </h4>
                    <div className="flex text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
                <p className="text-[#8b7355] font-bold mb-4" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  "作为一名学生，我用AIMAGICA Video
                  Studio为我的课程项目创建视频。即使没有任何视频制作经验，我也能创建出专业水准的动画和演示。老师和同学们都被惊艳到了！"
                </p>
                <div className="flex justify-end">
                  <span className="text-[#d4a574] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    大学生
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center mt-10">
              <div className="inline-flex items-center bg-[#2d3e2d] rounded-full px-6 py-3 shadow-lg">
                <Users className="w-5 h-5 text-[#d4a574] mr-2" />
                <span className="text-[#f5f1e8] font-black" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  已有超过50万用户使用AIMAGICA Video Studio创造魔法视频！
                </span>
              </div>
            </div>
          </div>

          {/* 装饰元素 */}
          <div className="absolute top-40 -right-20 w-40 h-40 bg-[#8b7355]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 left-40 w-60 h-60 bg-[#d4a574]/10 rounded-full blur-3xl"></div>
        </section>

        {/* 常见问题部分 */}
        <section className="py-12 md:py-16 bg-[#2d3e2d] text-white relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10 md:mb-16">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-black text-[#f5f1e8] mb-4 transform rotate-1"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "3px 3px 0px #8b7355",
                }}
              >
                常见问题 🤔
              </h2>
              <p
                className="text-lg md:text-xl font-bold text-[#d4a574] max-w-3xl mx-auto"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                关于AIMAGICA Video Studio的一切，你想知道的都在这里！
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
                    <span className="font-black text-[#2d3e2d] text-left">我需要具备视频制作技能才能使用吗？</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      完全不需要！AIMAGICA Video
                      Studio专为所有人设计，无论你是专业创作者还是完全没有视频制作经验的初学者。只需描述你的创意或上传图片，AI魔法将完成剩下的工作！
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
                    <span className="font-black text-[#2d3e2d] text-left">生成一个视频需要多长时间？</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      视频生成时间取决于视频的长度和复杂度，通常在2-5分钟内完成。我们的AI技术不断优化，致力于提供最快的视频生成体验！
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
                    <span className="font-black text-[#2d3e2d] text-left">我可以商用我创建的视频吗？</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      当然可以！你创建的所有视频都属于你，可以自由用于个人或商业用途。无论是社交媒体内容、营销材料还是教育资源，都没有限制！
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
                    <span className="font-black text-[#2d3e2d] text-left">免费版和PRO版有什么区别？</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      免费版每天提供3次视频创作机会，标准分辨率下载。PRO版提供每天无限创作、超高清视频下载、更长的视频时长、独家视频风格，以及优先处理速度！
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
                    <span className="font-black text-[#2d3e2d] text-left">我可以编辑生成的视频吗？</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      是的！生成视频后，你可以下载并使用任何视频编辑软件进行进一步编辑。我们也计划在未来添加内置的视频编辑功能，敬请期待！
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* 装饰元素 */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#d4a574]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 right-20 w-60 h-60 bg-[#8b7355]/20 rounded-full blur-3xl"></div>
        </section>
      </div>
    </div>
  )
}
