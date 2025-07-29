"use client"

import GenerationInterface from '@/components/generation-interface'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, ImageIcon, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function TextToImagePage() {
  const [textPrompt, setTextPrompt] = useState("")
  const [creationMode, setCreationMode] = useState<"text2img" | "img2img" | "text2video" | "img2video">("text2img")

  const handleStartRender = async (aspectRatio?: string, styleId?: string | null, imageCount?: number, uploadedImage?: string | null, modelParams?: any) => {
    console.log("🚀 Starting text-to-image generation:", { textPrompt, aspectRatio, styleId, imageCount })
    // 这里可以添加实际的生成逻辑，或者重定向到主页面的生成流程
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      {/* Navigation Header */}
      <header className="bg-white shadow-lg border-b-4 border-[#2d3e2d] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-all">
              <img
                src="/images/aimagica-logo.png"
                alt="AIMAGICA"
                className="w-10 h-10 rounded-lg shadow-lg"
              />
              <div>
                <h1
                  className="text-xl font-black text-[#2d3e2d]"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "2px 2px 0px #d4a574",
                  }}
                >
                  AIMAGICA
                </h1>
                <p className="text-xs text-[#8b7355] font-bold">Text to Image</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" className="font-black rounded-xl">
                <Link href="/">🏠 Home</Link>
              </Button>
              <Button asChild variant="ghost" className="text-[#d4a574] border-b-2 border-[#d4a574] font-black rounded-xl">
                <Link href="/text-to-image">📝 Text to Image</Link>
              </Button>
              <Button asChild variant="ghost" className="font-black rounded-xl">
                <Link href="/image-to-image">🖼️ Image to Image</Link>
              </Button>
              <Button asChild variant="ghost" className="font-black rounded-xl">
                <Link href="/text-to-video">🎬 Text to Video</Link>
              </Button>
              <Button asChild variant="ghost" className="font-black rounded-xl">
                <Link href="/image-to-video">🎥 Image to Video</Link>
              </Button>
            </nav>

            <Button asChild className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-xl">
              <Link href="/pricing">✨ GET PRO</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-6xl font-black text-[#2d3e2d] mb-4 transform -rotate-1"
            style={{
              fontFamily: "Fredoka One, Arial Black, sans-serif",
              textShadow: "3px 3px 0px #d4a574",
            }}
          >
            TEXT TO IMAGE AI ✨
          </h1>
          <p
            className="text-xl md:text-2xl font-bold text-[#8b7355] max-w-4xl mx-auto mb-6"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            Transform your words into stunning AI-generated artwork! Just describe what you want to see and watch the magic happen in seconds.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="bg-[#2d3e2d] text-[#f5f1e8] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Multiple Art Styles
            </div>
            <div className="bg-[#8b7355] text-[#f5f1e8] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              30-Second Generation
            </div>
            <div className="bg-[#d4a574] text-[#2d3e2d] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              HD Downloads
            </div>
          </div>
        </div>
      </section>

      {/* 功能导航区域 */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-[#2d3e2d] mb-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            Try Other AI Features! 🚀
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Link href="/" className="block">
            <div className="bg-white border-2 border-[#8b7355] rounded-xl p-4 transform hover:scale-105 transition-all text-center">
              <div className="text-3xl mb-2">🖼️</div>
              <h3 className="font-black text-[#2d3e2d] text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Image to Image
              </h3>
            </div>
          </Link>
          <Link href="/text-to-video" className="block">
            <div className="bg-white border-2 border-[#8b7355] rounded-xl p-4 transform hover:scale-105 transition-all text-center">
              <div className="text-3xl mb-2">🎬</div>
              <h3 className="font-black text-[#2d3e2d] text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Text to Video
              </h3>
            </div>
          </Link>
          <Link href="/image-to-video" className="block">
            <div className="bg-white border-2 border-[#8b7355] rounded-xl p-4 transform hover:scale-105 transition-all text-center">
              <div className="text-3xl mb-2">🎥</div>
              <h3 className="font-black text-[#2d3e2d] text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Image to Video
              </h3>
            </div>
          </Link>
        </div>
      </section>

      {/* Main Generation Interface */}
      <main className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-[#2d3e2d] overflow-hidden">
          <div className="bg-[#2d3e2d] p-4 text-center">
            <h2
              className="text-2xl font-black text-[#f5f1e8] flex items-center justify-center gap-3"
              style={{
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "2px 2px 0px #8b7355",
              }}
            >
              <Sparkles className="w-6 h-6" />
              Create Your AI Artwork
              <Sparkles className="w-6 h-6" />
            </h2>
          </div>
          
          <div className="p-6">
            <GenerationInterface 
              forcedMode="text2img"
              hideModeSelector={true}
              onStartRender={handleStartRender}
              textPrompt={textPrompt}
              setTextPrompt={setTextPrompt}
              creationMode={creationMode}
              setCreationMode={setCreationMode}
            />
          </div>
        </div>
      </main>

      {/* SEO Content Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-[#2d3e2d] mb-6 text-center" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            How Text to Image AI Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-white rounded-xl border-2 border-[#8b7355]">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="font-black text-[#2d3e2d] mb-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Write Your Prompt
              </h3>
              <p className="text-[#8b7355] font-bold text-sm">
                Describe what you want to see in simple words
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border-2 border-[#8b7355]">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-black text-[#2d3e2d] mb-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Choose Your Style
              </h3>
              <p className="text-[#8b7355] font-bold text-sm">
                Select from anime, photorealistic, artistic styles
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border-2 border-[#8b7355]">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-black text-[#2d3e2d] mb-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Get Your Image
              </h3>
              <p className="text-[#8b7355] font-bold text-sm">
                Download your AI-generated masterpiece in HD
              </p>
            </div>
          </div>

          <div className="prose prose-lg mx-auto">
            <h3 className="text-2xl font-black text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Create Amazing Images from Text
            </h3>
            <p className="text-[#8b7355] font-bold">
              Our advanced AI text-to-image generator transforms your written descriptions into stunning visual artwork. 
              Whether you're looking to create digital art, concept designs, or just want to see your imagination come to life, 
              our tool makes it possible in just seconds.
            </p>
            
            <h3 className="text-2xl font-black text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Popular Text to Image Styles
            </h3>
            <ul className="text-[#8b7355] font-bold">
              <li>Anime and Manga Style</li>
              <li>Photorealistic Images</li>
              <li>Digital Art and Illustrations</li>
              <li>Fantasy and Sci-Fi</li>
              <li>Oil Painting and Watercolor</li>
              <li>Cyberpunk and Futuristic</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
} 