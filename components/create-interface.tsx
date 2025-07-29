"use client"

import type React from "react"

import { useState, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Type, ImageIcon, Upload, Brush, Wand2, X, Crown, Film, Video } from "lucide-react"
import SketchCanvas from "@/components/sketch-canvas"
import StyleSelector from "@/components/style-selector"

interface CreateInterfaceProps {
  onStartRender: (styleId?: string | null) => void
  textPrompt: string
  setTextPrompt: (prompt: string) => void
}

interface CreateInterfaceRef {
  setPromptForCurrentMode: (prompt: string) => void
}

const CreateInterface = forwardRef<CreateInterfaceRef, CreateInterfaceProps>(
  ({ onStartRender, textPrompt, setTextPrompt }, ref) => {
    const [mode, setMode] = useState<"text2img" | "img2img" | "text2video" | "img2video">("text2img")
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [uploadedVideo, setUploadedVideo] = useState<string | null>(null)
    const [showDrawing, setShowDrawing] = useState(false)
    const [img2imgPrompt, setImg2imgPrompt] = useState("")
    const [text2videoPrompt, setText2videoPrompt] = useState("")
    const [img2videoPrompt, setImg2videoPrompt] = useState("")
    const [videoDuration, setVideoDuration] = useState(15)
    const [selectedVideoStyle, setSelectedVideoStyle] = useState("cinematic")
    const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null)
    const [selectedStyleName, setSelectedStyleName] = useState<string | null>(null)
    
    // 防重复随机提示词状态
    const [usedImg2imgIndices, setUsedImg2imgIndices] = useState<Set<number>>(new Set())
    const [usedVideoIndices, setUsedVideoIndices] = useState<Set<number>>(new Set())

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      setPromptForCurrentMode: (prompt: string) => {
        if (mode === "text2img") {
          setTextPrompt(prompt)
        } else if (mode === "img2img") {
          setImg2imgPrompt(prompt)
        } else if (mode === "text2video") {
          setText2videoPrompt(prompt)
        } else if (mode === "img2video") {
          setImg2videoPrompt(prompt)
        }
      },
    }))

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedVideo(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }

    const handleStartDrawing = () => {
      setShowDrawing(true)
      setUploadedImage(null) // Clear uploaded image when starting to draw
    }

    const handleCloseDrawing = () => {
      setShowDrawing(false)
    }

    const handleSubmitDrawing = (imageData: string) => {
      setUploadedImage(imageData)
      setShowDrawing(false)
    }

    const handleStyleSelect = (styleId: string | null, styleName?: string, styleData?: any) => {
      setSelectedStyleId(styleId)
      setSelectedStyleName(styleName || null)
    }

    const handleStartRender = () => {
      // 根据不同模式检查条件
      if (mode === "text2img" && textPrompt.trim()) {
        onStartRender(selectedStyleId)
      } else if (mode === "img2img" && (uploadedImage || showDrawing)) {
        onStartRender(selectedStyleId)
      } else if (mode === "text2video" && text2videoPrompt.trim()) {
        onStartRender(selectedStyleId)
      } else if (mode === "img2video" && uploadedImage && img2videoPrompt.trim()) {
        onStartRender(selectedStyleId)
      }
    }

    const videoStyles = [
      { id: "cinematic", name: "Cinematic", icon: "🎬" },
      { id: "anime", name: "Anime", icon: "🌸" },
      { id: "3d-cartoon", name: "3D Cartoon", icon: "🧸" },
      { id: "pixel-art", name: "Pixel Art", icon: "👾" },
      { id: "watercolor", name: "Watercolor", icon: "🎨" },
      { id: "claymation", name: "Claymation", icon: "🏺" },
    ]

    return (
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 md:border-4 border-[#2d3e2d] transform hover:scale-[1.02] transition-all">
        <div className="bg-[#4a5a4a] p-4 md:p-6 relative">
          <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-8 md:h-8 bg-[#d4a574] rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 md:-bottom-2 md:-left-2 w-3 h-3 md:w-6 md:h-6 bg-[#8b7355] rounded-full"></div>
          <h2
            className="text-xl md:text-3xl font-black text-[#f5f1e8] mb-2 transform -rotate-1"
            style={{
              fontFamily: "Fredoka One, Arial Black, sans-serif",
              textShadow: "2px 2px 0px #8b7355",
            }}
          >
            CREATE YOUR AIMAGICA! 🎨
          </h2>
          <p className="text-[#f5f1e8] font-bold text-sm md:text-base" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            Choose your magic creation mode and let AIMAGICA work its wonders! ✨
          </p>
        </div>

        <div className="p-4 md:p-6">
          {/* Mode Selection - 现在有4个选项 */}
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "text2img" | "img2img" | "text2video" | "img2video")}
          >
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-[#8b7355] rounded-xl md:rounded-2xl p-1 md:p-2 shadow-lg mb-4 md:mb-6">
              <TabsTrigger
                value="text2img"
                className="rounded-lg md:rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm py-2"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Type className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                TEXT TO IMAGE 📝
              </TabsTrigger>
              <TabsTrigger
                value="img2img"
                className="rounded-lg md:rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm py-2"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <ImageIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                IMAGE TO IMAGE 🖼️
              </TabsTrigger>
              <TabsTrigger
                value="text2video"
                className="rounded-lg md:rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm py-2"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Film className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                TEXT TO VIDEO 🎬
              </TabsTrigger>
              <TabsTrigger
                value="img2video"
                className="rounded-lg md:rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] text-[#f5f1e8] transform hover:scale-105 transition-all text-xs md:text-sm py-2"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Video className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                IMAGE TO VIDEO 🎥
              </TabsTrigger>
            </TabsList>

            {/* Text to Image Mode */}
            <TabsContent value="text2img" className="space-y-4 md:space-y-6">
              <div>
                <Label
                  htmlFor="text-prompt"
                  className="text-[#2d3e2d] font-black text-base md:text-lg mb-2 md:mb-3 block transform rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  Enter Your Magic Spell! ✨
                </Label>
                <Textarea
                  id="text-prompt"
                  placeholder="Describe the amazing image you want to create... e.g., cute cat wizard casting rainbow magic in a crystal castle 🐱🏰"
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className="bg-white border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] placeholder:text-[#8b7355] rounded-xl md:rounded-2xl font-bold shadow-lg min-h-[100px] md:min-h-[120px] text-sm md:text-base"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  rows={4}
                />
                <div className="mt-2 flex flex-wrap gap-1 md:gap-2">
                  {["cute cat", "magic forest", "cyberpunk", "watercolor style", "anime girl"].map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      variant="outline"
                      onClick={() => setTextPrompt(textPrompt + (textPrompt ? ", " : "") + tag)}
                      className="bg-[#f5f1e8] border-1 md:border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] font-black rounded-lg md:rounded-xl transform hover:rotate-1 transition-all text-xs px-2 py-1"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Style Selection for Text2Img */}
              <div>
                <h3
                  className="text-[#2d3e2d] font-black text-base md:text-lg mb-3 md:mb-4 transform -rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  Choose Your Magic Style! 🎭
                </h3>
                <StyleSelector 
                  onStyleSelect={handleStyleSelect}
                  selectedStyleId={selectedStyleId}
                />
              </div>
            </TabsContent>

            {/* Image to Image Mode */}
            <TabsContent value="img2img" className="space-y-4 md:space-y-6">
              <div>
                <h3
                  className="text-[#2d3e2d] font-black text-base md:text-lg mb-3 md:mb-4 transform rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  Choose Your Creation Method! 🎨
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                  {/* Upload Image */}
                  <Card className="border-2 md:border-4 border-[#8b7355] rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    <CardContent className="p-3 md:p-4 text-center">
                      <div className="text-3xl md:text-4xl mb-2 md:mb-3">📁</div>
                      <h4
                        className="text-[#2d3e2d] font-black mb-1 md:mb-2 text-sm md:text-base"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        Upload Image
                      </h4>
                      <p
                        className="text-[#8b7355] font-bold text-xs md:text-sm mb-2 md:mb-3"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        Upload your image for AI transformation!
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        onClick={() => {
                          document.getElementById("image-upload")?.click()
                          setShowDrawing(false)
                        }}
                        className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-lg md:rounded-xl transform hover:rotate-1 transition-all text-xs md:text-sm px-3 py-2"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <Upload className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Choose Image
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Draw Image */}
                  <Card className="border-2 md:border-4 border-[#8b7355] rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    <CardContent className="p-3 md:p-4 text-center">
                      <div className="text-3xl md:text-4xl mb-2 md:mb-3">🖌️</div>
                      <h4
                        className="text-[#2d3e2d] font-black mb-1 md:mb-2 text-sm md:text-base"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        Edit Your Image
                      </h4>
                      <p
                        className="text-[#8b7355] font-bold text-xs md:text-sm mb-2 md:mb-3"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        Draw modifications on your uploaded image!
                      </p>
                      <Button
                        onClick={handleStartDrawing}
                        disabled={!uploadedImage}
                        className={`font-black rounded-lg md:rounded-xl transform transition-all text-xs md:text-sm px-3 py-2 ${
                          uploadedImage 
                            ? "bg-[#8b7355] hover:bg-[#6d5a42] text-[#f5f1e8] hover:rotate-1" 
                            : "bg-[#8b7355]/30 text-[#8b7355] cursor-not-allowed"
                        }`}
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <Brush className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        {uploadedImage ? "Start Editing" : "Upload First"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Show uploaded image */}
                {uploadedImage && (
                  <div className="mb-4 md:mb-6">
                    <h4
                      className="text-[#2d3e2d] font-black mb-2 md:mb-3 text-sm md:text-base"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      Uploaded Image 📸
                    </h4>
                    <div className="relative inline-block">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded"
                        className="max-w-full h-32 md:h-48 object-cover rounded-xl md:rounded-2xl border-2 md:border-4 border-[#8b7355] shadow-lg"
                      />
                      <Button
                        size="sm"
                        onClick={() => setUploadedImage(null)}
                        className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-full w-6 h-6 md:w-8 md:h-8 p-0"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Drawing Canvas - Only show when drawing is active */}
                {showDrawing && (
                  <div className="mb-4 md:mb-6">
                    <div className="flex justify-between items-center mb-2 md:mb-3">
                      <h4
                        className="text-[#2d3e2d] font-black transform -rotate-1 text-sm md:text-base"
                        style={{
                          fontFamily: "Fredoka One, Arial Black, sans-serif",
                          textShadow: "1px 1px 0px #d4a574",
                        }}
                      >
                        Image Editing Canvas 🖼️
                      </h4>
                      <Button
                        size="sm"
                        onClick={handleCloseDrawing}
                        variant="outline"
                        className="bg-[#f5f1e8] border-1 md:border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-black rounded-lg md:rounded-xl text-xs px-2 py-1"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Close Canvas
                      </Button>
                    </div>
                    <SketchCanvas 
                      onSubmitDrawing={handleSubmitDrawing} 
                      baseImage={uploadedImage}
                      mode="edit"
                    />
                  </div>
                )}

                {/* Prompt for img2img */}
                <div>
                  <Label
                    htmlFor="img2img-prompt"
                    className="text-[#2d3e2d] font-black text-base md:text-lg mb-2 md:mb-3 block transform rotate-1"
                    style={{
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "1px 1px 0px #d4a574",
                    }}
                  >
                    Describe Your Vision! ✨
                  </Label>
                  <div className="relative group">
                    <Textarea
                      id="img2img-prompt"
                      placeholder="Tell AIMAGICA how to transform your image... e.g., make it anime style, add magical effects, turn into watercolor painting, cyberpunk style"
                      value={img2imgPrompt}
                      onChange={(e) => setImg2imgPrompt(e.target.value)}
                      className="bg-white border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] placeholder:text-[#8b7355] rounded-xl md:rounded-2xl font-bold shadow-lg min-h-[100px] md:min-h-[120px] text-sm md:text-base pr-10"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      rows={4}
                    />
                    {/* Clear button */}
                    {img2imgPrompt && (
                      <button
                        onClick={() => setImg2imgPrompt('')}
                        className="absolute top-2 right-2 w-6 h-6 bg-[#8b7355] hover:bg-[#d4a574] text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
                        style={{ 
                          fontFamily: "Fredoka One, Arial Black, sans-serif",
                          fontSize: "14px",
                          fontWeight: "bold"
                        }}
                        title="Clear text"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="mt-2 space-y-2">
                    {/* Quick add tags */}
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {["anime style", "watercolor", "cyberpunk", "oil painting", "cartoon style"].map((tag) => (
                        <Button
                          key={tag}
                          size="sm"
                          variant="outline"
                          onClick={() => setImg2imgPrompt(img2imgPrompt + (img2imgPrompt ? ", " : "") + tag)}
                          className="bg-[#f5f1e8] border-1 md:border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] font-black rounded-lg md:rounded-xl transform hover:rotate-1 transition-all text-xs px-2 py-1"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Random and Reset buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const randomPrompts = [
                            "Transform into anime style with vibrant colors",
                            "Make it a watercolor painting with soft brushstrokes",
                            "Convert to cyberpunk style with neon lighting",
                            "Turn into oil painting with rich textures",
                            "Make it cartoon style with bold outlines",
                            "Create steampunk version with brass details",
                            "Transform into fantasy art with magical elements",
                            "Make it vintage style with sepia tones",
                            "Convert to impressionist painting with dreamy colors",
                            "Transform into digital art with glowing effects",
                            "Make it a pencil sketch with detailed shading",
                            "Turn into pop art with bright, bold colors",
                            "Create Art Nouveau style with flowing patterns",
                            "Transform into minimalist design with clean lines",
                            "Make it surreal art with impossible elements",
                            "Convert to Gothic style with dark atmosphere",
                            "Turn into pixel art with retro gaming vibes",
                            "Create Renaissance painting with classical beauty",
                            "Transform into street art with graffiti elements",
                            "Make it photorealistic with enhanced lighting",
                            "Convert to abstract art with geometric shapes",
                            "Turn into stained glass window design",
                            "Create noir style with dramatic shadows",
                            "Transform into kawaii cute style",
                            "Make it cosmic space art with stars and nebulas",
                            "Convert to tropical paradise with palm trees",
                            "Turn into winter wonderland with snow and ice",
                            "Create underwater scene with sea creatures",
                            "Transform into magical forest with fairy elements",
                            "Make it post-apocalyptic with ruins and nature",
                            "Convert to ancient Egyptian hieroglyph style",
                            "Turn into Japanese ukiyo-e woodblock print",
                            "Create Van Gogh style with swirling brushstrokes",
                            "Transform into Picasso cubist interpretation",
                            "Make it Salvador Dali surrealist masterpiece",
                            "Convert to Art Deco with geometric elegance",
                            "Turn into children's book illustration style",
                            "Create comic book hero action scene",
                            "Transform into romantic landscape painting",
                            "Make it futuristic sci-fi with advanced technology"
                          ]
                          // 智能防重复随机选择
                          let availableIndices = Array.from({length: randomPrompts.length}, (_, i) => i)
                            .filter(i => !usedImg2imgIndices.has(i))
                          
                          // 如果所有提示词都用过了，重置已使用列表
                          if (availableIndices.length === 0) {
                            setUsedImg2imgIndices(new Set())
                            availableIndices = Array.from({length: randomPrompts.length}, (_, i) => i)
                          }
                          
                          const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
                          const randomPrompt = randomPrompts[randomIndex]
                          
                          // 记录已使用的提示词索引
                          setUsedImg2imgIndices(prev => new Set([...prev, randomIndex]))
                          setImg2imgPrompt(randomPrompt)
                        }}
                        className="px-3 py-1 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        title="Generate random transformation prompt"
                      >
                        🎲 Random
                      </button>
                      <button
                        onClick={() => setImg2imgPrompt('')}
                        className="px-3 py-1 bg-[#8b7355] hover:bg-[#7a6449] text-white rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        title="Reset text"
                      >
                        🔄 Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Style Selection for Img2Img */}
                <div>
                  <h3
                    className="text-[#2d3e2d] font-black text-base md:text-lg mb-3 md:mb-4 transform rotate-1"
                    style={{
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "1px 1px 0px #d4a574",
                    }}
                  >
                    Choose Transformation Style! 🎭
                  </h3>
                  <StyleSelector 
                    onStyleSelect={handleStyleSelect}
                    selectedStyleId={selectedStyleId}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Text to Video Mode */}
            <TabsContent value="text2video" className="space-y-4 md:space-y-6">
              <div>
                <Label
                  htmlFor="text2video-prompt"
                  className="text-[#2d3e2d] font-black text-base md:text-lg mb-2 md:mb-3 block transform rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  Describe Your Video Magic! 🎬✨
                </Label>
                <div className="relative group">
                  <Textarea
                    id="text2video-prompt"
                    placeholder="Describe the amazing video you want to create... e.g., a magical cat wizard casting colorful spells in a fantasy forest while butterflies dance around 🐱🦋"
                    value={text2videoPrompt}
                    onChange={(e) => setText2videoPrompt(e.target.value)}
                    className="bg-white border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] placeholder:text-[#8b7355] rounded-xl md:rounded-2xl font-bold shadow-lg min-h-[100px] md:min-h-[120px] text-sm md:text-base pr-10"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    rows={4}
                  />
                  {/* Clear button */}
                  {text2videoPrompt && (
                    <button
                      onClick={() => setText2videoPrompt('')}
                      className="absolute top-2 right-2 w-6 h-6 bg-[#8b7355] hover:bg-[#d4a574] text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
                      style={{ 
                        fontFamily: "Fredoka One, Arial Black, sans-serif",
                        fontSize: "14px",
                        fontWeight: "bold"
                      }}
                      title="Clear text"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  {/* Quick add tags */}
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {["magical forest", "flying dragon", "dancing characters", "cinematic style", "anime adventure"].map(
                      (tag) => (
                        <Button
                          key={tag}
                          size="sm"
                          variant="outline"
                          onClick={() => setText2videoPrompt(text2videoPrompt + (text2videoPrompt ? ", " : "") + tag)}
                          className="bg-[#f5f1e8] border-1 md:border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] font-black rounded-lg md:rounded-xl transform hover:rotate-1 transition-all text-xs px-2 py-1"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {tag}
                        </Button>
                      ),
                    )}
                  </div>
                  
                  {/* Random and Reset buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const randomPrompts = [
                          "A magical cat wizard casting colorful spells in a fantasy forest while butterflies dance around",
                          "A dragon soaring through clouds above ancient mountains with cinematic lighting",
                          "Dancing characters in a vibrant anime world with sparkling effects",
                          "A steampunk airship sailing through golden sunset sky with smooth camera movement",
                          "Underwater adventure with tropical fish swimming through coral reefs",
                          "Epic fantasy battle scene with magical creatures in slow motion",
                          "Peaceful zen garden with cherry blossoms falling in gentle breeze",
                          "Cyberpunk city at night with neon lights and flying cars",
                          "A phoenix rising from ashes with flames swirling dramatically around it",
                          "Time-lapse of flowers blooming in a magical garden with fairy lights",
                          "A robot exploring an alien planet with strange purple vegetation",
                          "Pirates sailing through a storm with lightning illuminating their ship",
                          "A clockwork city where gears turn and steam rises from chimneys",
                          "Astronauts floating in space while colorful nebulas swirl behind them",
                          "A medieval knight riding through an enchanted forest with glowing trees",
                          "Dolphins jumping through ocean waves as the sun sets on the horizon",
                          "A witch brewing potions in her cottage while magic sparkles in the air",
                          "Snow falling on a cozy village with warm lights glowing in windows",
                          "A carousel of mythical creatures spinning under a starry night sky",
                          "Lava flowing down a volcano while dragons fly overhead dramatically",
                          "A train chugging through autumn mountains with leaves falling like confetti",
                          "Mermaids swimming through an underwater palace with pearls and coral",
                          "A hot air balloon festival with dozens of colorful balloons rising at dawn",
                          "Ancient ruins being reclaimed by nature with vines growing over stone",
                          "A lighthouse beacon cutting through thick fog on a stormy night",
                          "Butterflies migrating across a field of wildflowers in spring",
                          "A spacecraft landing on Mars with dust clouds and red landscape",
                          "Cherry trees blooming along a river with petals floating downstream",
                          "A carnival at twilight with spinning rides and twinkling lights",
                          "Whales breaching the ocean surface with water cascading off their bodies",
                          "A medieval castle during siege with catapults and arrows flying",
                          "Northern lights dancing over a frozen lake with ice crystals sparkling",
                          "A forest fire spreading while wildlife escapes through smoky haze",
                          "Penguins sliding down icy slopes while snowflakes fall gently",
                          "A rocket launching into space with flames and smoke trailing behind",
                          "Hummingbirds feeding from flowers in a tropical rainforest",
                          "A tornado forming over plains with debris swirling in the air",
                          "Fireflies blinking in a summer meadow as twilight deepens",
                          "A submarine exploring deep ocean trenches with bioluminescent creatures",
                          "Eagles soaring over mountain peaks with clouds drifting below them"
                        ]
                        // 智能防重复随机选择
                        let availableIndices = Array.from({length: randomPrompts.length}, (_, i) => i)
                          .filter(i => !usedVideoIndices.has(i))
                        
                        // 如果所有提示词都用过了，重置已使用列表
                        if (availableIndices.length === 0) {
                          setUsedVideoIndices(new Set())
                          availableIndices = Array.from({length: randomPrompts.length}, (_, i) => i)
                        }
                        
                        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
                        const randomPrompt = randomPrompts[randomIndex]
                        
                        // 记录已使用的提示词索引
                        setUsedVideoIndices(prev => new Set([...prev, randomIndex]))
                        setText2videoPrompt(randomPrompt)
                      }}
                      className="px-3 py-1 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      title="Generate random video prompt"
                    >
                      🎲 Random
                    </button>
                    <button
                      onClick={() => setText2videoPrompt('')}
                      className="px-3 py-1 bg-[#8b7355] hover:bg-[#7a6449] text-white rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 shadow-md"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      title="Reset text"
                    >
                      🔄 Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Style Selection */}
              <div>
                <h3
                  className="text-[#2d3e2d] font-black text-base md:text-lg mb-3 md:mb-4 transform -rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  Choose Video Style! 🎭
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {videoStyles.map((style) => (
                    <Button
                      key={style.id}
                      type="button"
                      variant="outline"
                      className={`flex flex-col items-center justify-center h-auto py-3 px-2 border-2 ${
                        selectedVideoStyle === style.id
                          ? "bg-[#d4a574]/20 border-[#d4a574]"
                          : "border-[#8b7355] bg-[#f5f1e8]"
                      } rounded-xl text-[#2d3e2d] hover:bg-[#d4a574]/20 hover:border-[#d4a574] transition-all`}
                      onClick={() => setSelectedVideoStyle(style.id)}
                    >
                      <span className="text-xl mb-1">{style.icon}</span>
                      <span className="font-bold text-xs md:text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        {style.name}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Video Duration */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label
                    className="text-[#2d3e2d] font-black text-sm md:text-base"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Video Duration 🕒
                  </Label>
                  <span className="text-[#8b7355] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    {videoDuration} seconds
                  </span>
                </div>
                <Slider
                  min={5}
                  max={30}
                  step={5}
                  value={[videoDuration]}
                  onValueChange={(value) => setVideoDuration(value[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-[#8b7355]">
                  <span>5s</span>
                  <span>30s</span>
                </div>
              </div>
            </TabsContent>

            {/* Image to Video Mode */}
            <TabsContent value="img2video" className="space-y-4 md:space-y-6">
              <div>
                <h3
                  className="text-[#2d3e2d] font-black text-base md:text-lg mb-3 md:mb-4 transform rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  Upload Image for Video Magic! 🖼️✨
                </h3>

                <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-4 text-center mb-4">
                  {uploadedImage ? (
                    <div className="relative">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded"
                        className="max-h-[200px] mx-auto rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-[#f5f1e8] border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8]"
                        onClick={() => setUploadedImage(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Upload className="w-8 h-8 text-[#8b7355] mb-2" />
                      <p className="text-[#8b7355] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                        Click to upload or drag and drop
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        id="img2video-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-[#f5f1e8] border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8]"
                        onClick={() => document.getElementById("img2video-upload")?.click()}
                      >
                        Select Image
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="img2video-prompt"
                    className="text-[#2d3e2d] font-black text-base md:text-lg mb-2 md:mb-3 block transform rotate-1"
                    style={{
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "1px 1px 0px #d4a574",
                    }}
                  >
                    How Should It Animate? 🎭
                  </Label>
                  <Textarea
                    id="img2video-prompt"
                    placeholder="Describe how your image should come to life... e.g., the character starts dancing with magical sparkles, the background moves like flowing water"
                    value={img2videoPrompt}
                    onChange={(e) => setImg2videoPrompt(e.target.value)}
                    className="bg-white border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] placeholder:text-[#8b7355] rounded-xl md:rounded-2xl font-bold shadow-lg min-h-[100px] md:min-h-[120px] text-sm md:text-base"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    rows={4}
                  />
                  <div className="mt-2 flex flex-wrap gap-1 md:gap-2">
                    {["gentle movement", "magical sparkles", "flowing hair", "blinking eyes", "swaying trees"].map(
                      (tag) => (
                        <Button
                          key={tag}
                          size="sm"
                          variant="outline"
                          onClick={() => setImg2videoPrompt(img2videoPrompt + (img2videoPrompt ? ", " : "") + tag)}
                          className="bg-[#f5f1e8] border-1 md:border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#d4a574] font-black rounded-lg md:rounded-xl transform hover:rotate-1 transition-all text-xs px-2 py-1"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          {tag}
                        </Button>
                      ),
                    )}
                  </div>
                </div>

                {/* Video Style Selection */}
                <div>
                  <h3
                    className="text-[#2d3e2d] font-black text-base md:text-lg mb-3 md:mb-4 transform -rotate-1"
                    style={{
                      fontFamily: "Fredoka One, Arial Black, sans-serif",
                      textShadow: "1px 1px 0px #d4a574",
                    }}
                  >
                    Choose Animation Style! 🎭
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {videoStyles.map((style) => (
                      <Button
                        key={style.id}
                        type="button"
                        variant="outline"
                        className={`flex flex-col items-center justify-center h-auto py-3 px-2 border-2 ${
                          selectedVideoStyle === style.id
                            ? "bg-[#d4a574]/20 border-[#d4a574]"
                            : "border-[#8b7355] bg-[#f5f1e8]"
                        } rounded-xl text-[#2d3e2d] hover:bg-[#d4a574]/20 hover:border-[#d4a574] transition-all`}
                        onClick={() => setSelectedVideoStyle(style.id)}
                      >
                        <span className="text-xl mb-1">{style.icon}</span>
                        <span className="font-bold text-xs md:text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                          {style.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Video Duration */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label
                      className="text-[#2d3e2d] font-black text-sm md:text-base"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      Video Duration 🕒
                    </Label>
                    <span className="text-[#8b7355] font-bold text-sm" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      {videoDuration} seconds
                    </span>
                  </div>
                  <Slider
                    min={5}
                    max={30}
                    step={5}
                    value={[videoDuration]}
                    onValueChange={(value) => setVideoDuration(value[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-[#8b7355]">
                    <span>5s</span>
                    <span>30s</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="mt-6 md:mt-8 mb-2 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setTextPrompt("")
                  setImg2imgPrompt("")
                  setText2videoPrompt("")
                  setImg2videoPrompt("")
                  setUploadedImage(null)
                  setUploadedVideo(null)
                  setShowDrawing(false)
                }}
                className="bg-[#f5f1e8] border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-black rounded-xl md:rounded-2xl transform hover:rotate-1 transition-all text-xs md:text-sm px-3 py-2"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Reset 🔄
              </Button>
              <Button
                variant="outline"
                className="bg-[#f5f1e8] border-2 md:border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-black rounded-xl md:rounded-2xl transform hover:rotate-1 transition-all text-xs md:text-sm px-3 py-2"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Random Inspiration 🎲
              </Button>
            </div>

            {/* Credits 和 Cast Magic 按钮组合 */}
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
              {/* Credits 显示 */}
              <div className="bg-[#2d3e2d] rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-2 shadow-lg transform -rotate-1">
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Crown className="w-3 h-3 md:w-4 md:h-4 text-[#d4a574]" />
                  <span
                    className="font-black text-[#f5f1e8] text-xs md:text-sm"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    Credits: 3/3 ⭐
                  </span>
                </div>
              </div>

              {/* Cast Magic 按钮 */}
              <Button
                onClick={handleStartRender}
                disabled={
                  (mode === "text2img" && !textPrompt.trim()) ||
                  (mode === "img2img" && !uploadedImage && !showDrawing) ||
                  (mode === "text2video" && !text2videoPrompt.trim()) ||
                  (mode === "img2video" && (!uploadedImage || !img2videoPrompt.trim()))
                }
                className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full md:w-auto"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                <Wand2 className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                Cast AIMAGICA Magic! ✨
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-[#f5f1e8] rounded-xl md:rounded-2xl border-2 md:border-4 border-[#8b7355] shadow-lg">
            <h4
              className="text-[#2d3e2d] font-black mb-2 transform rotate-1 text-sm md:text-base"
              style={{
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "1px 1px 0px #d4a574",
              }}
            >
              Magic Tips! 💡
            </h4>
            <div
              className="text-[#2d3e2d] font-bold space-y-1 text-xs md:text-sm"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              {mode === "text2img" && (
                <>
                  <p>📝 Detailed descriptions get better results</p>
                  <p>🎨 Try adding style keywords like "watercolor", "oil painting"</p>
                  <p>✨ Use emotional words like "dreamy", "mysterious"</p>
                </>
              )}
              {mode === "img2img" && (
                <>
                  <p>🖼️ Clear, high-quality images work best</p>
                  <p>🎨 Bold lines are easier to recognize when drawing</p>
                  <p>✨ Additional descriptions help guide the transformation</p>
                </>
              )}
              {mode === "text2video" && (
                <>
                  <p>🎬 Describe movement and action for better videos</p>
                  <p>🎨 Include camera angles like "close-up", "wide shot"</p>
                  <p>✨ Mention lighting and atmosphere for cinematic feel</p>
                </>
              )}
              {mode === "img2video" && (
                <>
                  <p>🖼️ Use clear, well-lit images for best results</p>
                  <p>🎭 Describe specific movements you want to see</p>
                  <p>✨ Keep animations simple for more realistic results</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  },
)

CreateInterface.displayName = "CreateInterface"

export default CreateInterface
