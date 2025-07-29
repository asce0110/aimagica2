"use client"

import GenerationInterface from '@/components/generation-interface'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, ImageIcon, Wand2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function ImageToImagePage() {
  const [textPrompt, setTextPrompt] = useState("")
  const [creationMode, setCreationMode] = useState<"text2img" | "img2img" | "text2video" | "img2video">("img2img")

  const handleStartRender = async (aspectRatio?: string, styleId?: string | null, imageCount?: number, uploadedImage?: string | null, modelParams?: any) => {
    console.log("🚀 Starting image-to-image generation:", { textPrompt, aspectRatio, styleId, imageCount })
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
                  
                >
                  AIMAGICA
                </h1>
                <p className="text-xs text-[#8b7355] font-bold">Image to Image</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" className="font-black rounded-xl">
                <Link href="/">🏠 Home</Link>
              </Button>
              <Button asChild variant="ghost" className="font-black rounded-xl">
                <Link href="/text-to-image">📝 Text to Image</Link>
              </Button>
              <Button asChild variant="ghost" className="text-[#d4a574] border-b-2 border-[#d4a574] font-black rounded-xl">
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
            
          >
            IMAGE TO IMAGE AI 🖼️
          </h1>
          <p
            className="text-xl md:text-2xl font-bold text-[#8b7355] max-w-4xl mx-auto mb-6 font-magic"
            
          >
            Upload your photos and transform them into stunning AI artworks! Advanced image-to-image technology that enhances and stylizes your images in seconds.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="bg-[#2d3e2d] text-[#f5f1e8] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Any Image
            </div>
            <div className="bg-[#8b7355] text-[#f5f1e8] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Multiple Art Styles
            </div>
            <div className="bg-[#d4a574] text-[#2d3e2d] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Instant Results
            </div>
          </div>
        </div>
      </section>

      {/* 功能导航区域 */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-6 font-magic">
          <h2 className="text-2xl font-black text-[#2d3e2d] mb-2" >
            Try Other AI Features! 🚀
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Link href="/text-to-image" className="block">
            <div className="bg-white border-2 border-[#8b7355] rounded-xl p-4 transform hover:scale-105 transition-all text-center">
              <div className="text-3xl mb-2 font-magic">📝</div>
              <h3 className="font-black text-[#2d3e2d] text-sm" >
                Text to Image
              </h3>
            </div>
          </Link>
          <Link href="/text-to-video" className="block">
            <div className="bg-white border-2 border-[#8b7355] rounded-xl p-4 transform hover:scale-105 transition-all text-center">
              <div className="text-3xl mb-2 font-magic">🎬</div>
              <h3 className="font-black text-[#2d3e2d] text-sm" >
                Text to Video
              </h3>
            </div>
          </Link>
          <Link href="/image-to-video" className="block">
            <div className="bg-white border-2 border-[#8b7355] rounded-xl p-4 transform hover:scale-105 transition-all text-center">
              <div className="text-3xl mb-2 font-magic">🎥</div>
              <h3 className="font-black text-[#2d3e2d] text-sm" >
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
              
            >
              <ImageIcon className="w-6 h-6" />
              Transform Your Images
              <ImageIcon className="w-6 h-6" />
            </h2>
          </div>
          
          <div className="p-6">
            <GenerationInterface 
              forcedMode="img2img"
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
        <div className="max-w-4xl mx-auto font-magic">
          <h2 className="text-3xl font-black text-[#2d3e2d] mb-6 text-center" >
            How Image to Image AI Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-white rounded-xl border-2 border-[#8b7355]">
              <div className="text-4xl mb-3 font-magic">📤</div>
              <h3 className="font-black text-[#2d3e2d] mb-2" >
                Upload Your Image
              </h3>
              <p className="text-[#8b7355] font-bold text-sm">
                Choose any photo, drawing, or image you want to transform
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border-2 border-[#8b7355]">
              <div className="text-4xl mb-3 font-magic">🎨</div>
              <h3 className="font-black text-[#2d3e2d] mb-2" >
                Select Art Style
              </h3>
              <p className="text-[#8b7355] font-bold text-sm">
                Choose from anime, photorealistic, artistic styles and more
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl border-2 border-[#8b7355]">
              <div className="text-4xl mb-3 font-magic">✨</div>
              <h3 className="font-black text-[#2d3e2d] mb-2" >
                Get Enhanced Image
              </h3>
              <p className="text-[#8b7355] font-bold text-sm">
                Download your transformed artwork in high quality
              </p>
            </div>
          </div>

          <div className="prose prose-lg mx-auto font-magic">
            <h3 className="text-2xl font-black text-[#2d3e2d]" >
              Transform Any Image with AI
            </h3>
            <p className="text-[#8b7355] font-bold">
              Our advanced image-to-image AI technology analyzes your uploaded photos and transforms them into stunning artworks. 
              Whether you want to enhance your photos, change their artistic style, or create completely new interpretations, 
              our AI can handle it all in just seconds.
            </p>
            
            <h3 className="text-2xl font-black text-[#2d3e2d]" >
              Perfect for Image Enhancement
            </h3>
            <ul className="text-[#8b7355] font-bold">
              <li>Photo to Anime Conversion</li>
              <li>Artistic Style Transfer</li>
              <li>Image Quality Enhancement</li>
              <li>Creative Photo Editing</li>
              <li>Portrait Style Changes</li>
              <li>Landscape Artistic Conversion</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
} 