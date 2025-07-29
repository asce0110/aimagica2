"use client"

import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Video, Film, Wand2 } from 'lucide-react'
import Link from 'next/link'

export default function TextToVideoPage() {
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
                <p className="text-xs text-[#8b7355] font-bold">Text to Video</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" className="font-black rounded-xl">
                <Link href="/">🏠 Home</Link>
              </Button>
              <Button asChild variant="ghost" className="font-black rounded-xl">
                <Link href="/text-to-image">📝 Text to Image</Link>
              </Button>
              <Button asChild variant="ghost" className="font-black rounded-xl">
                <Link href="/image-to-image">🖼️ Image to Image</Link>
              </Button>
              <Button asChild variant="ghost" className="text-[#d4a574] border-b-2 border-[#d4a574] font-black rounded-xl">
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
            TEXT TO VIDEO AI 🎬
          </h1>
          <p
            className="text-xl md:text-2xl font-bold text-[#8b7355] max-w-4xl mx-auto mb-6"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            Transform your words into stunning AI-generated videos! Advanced text-to-video technology that brings your imagination to life in motion.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="bg-[#2d3e2d] text-[#f5f1e8] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              AI Video Generation
            </div>
            <div className="bg-[#8b7355] text-[#f5f1e8] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
              <Film className="w-4 h-4" />
              Multiple Styles
            </div>
            <div className="bg-[#d4a574] text-[#2d3e2d] px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2">
              <Video className="w-4 h-4" />
              HD Quality
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <main className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-[#2d3e2d] overflow-hidden max-w-4xl mx-auto">
          <div className="bg-[#2d3e2d] p-4 text-center">
            <h2
              className="text-2xl font-black text-[#f5f1e8] flex items-center justify-center gap-3"
              style={{
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "2px 2px 0px #8b7355",
              }}
            >
              <Sparkles className="w-6 h-6" />
              Coming Soon!
              <Sparkles className="w-6 h-6" />
            </h2>
          </div>
          
          <div className="p-8 text-center">
            <div className="text-8xl mb-6">🚧</div>
            <h3
              className="text-3xl font-black text-[#2d3e2d] mb-4"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              Text to Video is Coming Soon!
            </h3>
            <p
              className="text-lg text-[#8b7355] font-bold mb-6"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              We're working hard to bring you the most amazing text-to-video AI technology. 
              Stay tuned for updates!
            </p>
            
            <div className="bg-[#f5f1e8] rounded-xl p-6 mb-6">
              <h4 className="font-black text-[#2d3e2d] mb-3" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                What to expect:
              </h4>
              <ul className="text-[#8b7355] font-bold space-y-2">
                <li>✨ AI-powered video generation from text</li>
                <li>🎬 Multiple video styles and formats</li>
                <li>⚡ Fast rendering in 30-60 seconds</li>
                <li>🎥 HD quality output</li>
                <li>🎭 Creative scene generation</li>
              </ul>
            </div>

            <Link href="/">
              <Button className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all">
                Try Image to Image Instead! 🖼️
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* 功能导航区域 */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-[#2d3e2d] mb-2" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            Try Available AI Features! 🚀
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Link href="/" className="block">
            <div className="bg-gradient-to-br from-[#d4a574] to-[#c19660] border-2 border-[#2d3e2d] rounded-xl p-4 transform hover:scale-105 transition-all text-center">
              <div className="text-3xl mb-2">🖼️</div>
              <h3 className="font-black text-[#2d3e2d] text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Image to Image
              </h3>
              <p className="text-xs text-[#2d3e2d] font-bold">Available Now!</p>
            </div>
          </Link>
          <Link href="/text-to-image" className="block">
            <div className="bg-gradient-to-br from-[#8b7355] to-[#6d5a42] border-2 border-[#2d3e2d] rounded-xl p-4 transform hover:scale-105 transition-all text-center">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="font-black text-[#f5f1e8] text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Text to Image
              </h3>
              <p className="text-xs text-[#f5f1e8] font-bold">Available Now!</p>
            </div>
          </Link>
          <Link href="/image-to-video" className="block">
            <div className="bg-white border-2 border-[#8b7355] rounded-xl p-4 transform hover:scale-105 transition-all text-center">
              <div className="text-3xl mb-2">🎥</div>
              <h3 className="font-black text-[#2d3e2d] text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                Image to Video
              </h3>
              <p className="text-xs text-[#8b7355] font-bold">Coming Soon</p>
            </div>
          </Link>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-[#2d3e2d] mb-6 text-center" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            About Text to Video AI
          </h2>
          
          <div className="prose prose-lg mx-auto">
            <p className="text-[#8b7355] font-bold">
              Text-to-video AI technology represents the cutting-edge of artificial intelligence, 
              allowing users to create dynamic video content from simple text descriptions. 
              This revolutionary technology will enable creators, marketers, and storytellers 
              to bring their ideas to life through AI-generated videos.
            </p>
            
            <h3 className="text-2xl font-black text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Perfect for Content Creation
            </h3>
            <ul className="text-[#8b7355] font-bold">
              <li>Social Media Content</li>
              <li>Marketing Videos</li>
              <li>Educational Content</li>
              <li>Storytelling and Animation</li>
              <li>Concept Visualization</li>
              <li>Creative Experiments</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
} 