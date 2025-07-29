"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Film, ImageIcon, Upload, Wand2, PenTool, Palette, Video } from "lucide-react"

interface VideoCreationInterfaceProps {
  onStartRender: () => void
}

export default function VideoCreationInterface({ onStartRender }: VideoCreationInterfaceProps) {
  const [creationMode, setCreationMode] = useState("text-to-video")
  const [prompt, setPrompt] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState("cinematic")
  const [duration, setDuration] = useState(15)
  const [sketchData, setSketchData] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedVideo(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const videoStyles = [
    {
      id: "cinematic",
      name: "Cinematic",
      description: "Hollywood-quality cinematic style",
      icon: "🎬",
    },
    {
      id: "anime",
      name: "Anime",
      description: "Japanese animation style",
      icon: "🌸",
    },
    {
      id: "3d-cartoon",
      name: "3D Cartoon",
      description: "Pixar-like 3D animation",
      icon: "🧸",
    },
    {
      id: "pixel-art",
      name: "Pixel Art",
      description: "Retro pixel art animation",
      icon: "👾",
    },
    {
      id: "watercolor",
      name: "Watercolor",
      description: "Flowing watercolor painting style",
      icon: "🎨",
    },
    {
      id: "claymation",
      name: "Claymation",
      description: "Stop-motion clay animation style",
      icon: "🏺",
    },
  ]

  const creationModes = [
    {
      id: "text-to-video",
      name: "TEXT TO VIDEO",
      icon: Film,
      description: "Create videos from text descriptions",
      emoji: "📝",
    },
    {
      id: "image-to-video",
      name: "IMAGE TO VIDEO",
      icon: ImageIcon,
      description: "Animate static images into videos",
      emoji: "🖼️",
    },
    {
      id: "sketch-to-video",
      name: "SKETCH TO VIDEO",
      icon: PenTool,
      description: "Turn your drawings into animated videos",
      emoji: "✏️",
    },
    {
      id: "style-transfer",
      name: "STYLE TRANSFER",
      icon: Palette,
      description: "Apply artistic styles to existing videos",
      emoji: "🎭",
    },
  ]

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-2 md:border-4 border-[#2d3e2d] transform hover:scale-[1.01] transition-all">
      <div className="bg-[#2d3e2d] p-4 md:p-6 relative">
        <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-8 md:h-8 bg-[#d4a574] rounded-full"></div>
        <div className="absolute -bottom-1 -left-1 md:-bottom-2 md:-left-2 w-3 h-3 md:w-6 md:h-6 bg-[#8b7355] rounded-full"></div>
        <h2
          className="text-xl md:text-3xl font-black text-[#f5f1e8] mb-2 transform -rotate-1"
          
        >
          CREATE YOUR MAGIC VIDEO! 🎬
        </h2>
        <p className="text-[#f5f1e8] font-bold text-sm md:text-base" >
          Turn your imagination into amazing videos with AI magic! ✨
        </p>
      </div>

      <div className="p-4 md:p-6">
        {/* 4个创作模式按钮 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {creationModes.map((mode) => {
            const IconComponent = mode.icon
            return (
              <Button
                key={mode.id}
                type="button"
                variant="outline"
                className={`flex flex-col items-center justify-center h-auto py-4 px-3 border-2 ${
                  creationMode === mode.id
                    ? "bg-[#d4a574] border-[#d4a574] text-[#2d3e2d] shadow-lg"
                    : "border-[#8b7355] bg-[#f5f1e8] text-[#2d3e2d] hover:bg-[#d4a574]/20 hover:border-[#d4a574]"
                } rounded-xl transition-all transform hover:scale-105`}
                onClick={() => setCreationMode(mode.id)}
              >
                <div className="flex items-center justify-center w-8 h-8 mb-2">
                  <IconComponent className="w-5 h-5" />
                  <span className="ml-1 text-lg">{mode.emoji}</span>
                </div>
                <span
                  className="font-black text-xs md:text-sm text-center leading-tight font-magic"
                  
                >
                  {mode.name}
                </span>
                <span
                  className="text-xs text-center mt-1 opacity-75 hidden md:block font-magic"
                  
                >
                  {mode.description}
                </span>
              </Button>
            )
          })}
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* TEXT TO VIDEO */}
          {creationMode === "text-to-video" && (
            <div className="space-y-4">
              <div className="bg-[#f5f1e8] rounded-xl p-4 border-2 border-[#8b7355]">
                <div className="flex items-center mb-3">
                  <Film className="w-5 h-5 text-[#2d3e2d] mr-2 font-magic" />
                  <h3 className="font-black text-[#2d3e2d]" >
                    Text to Video Magic! 📝✨
                  </h3>
                </div>
                <p className="text-[#8b7355] font-bold text-sm mb-4" >
                  Describe your video idea and watch AI bring it to life!
                </p>
                <Textarea
                  placeholder="A magical cat wizard casting colorful spells in a fantasy forest while butterflies dance around..."
                  className="min-h-[100px] border-2 border-[#8b7355] rounded-xl focus:ring-[#d4a574] focus:border-[#d4a574]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* IMAGE TO VIDEO */}
          {creationMode === "image-to-video" && (
            <div className="space-y-4">
              <div className="bg-[#f5f1e8] rounded-xl p-4 border-2 border-[#8b7355]">
                <div className="flex items-center mb-3">
                  <ImageIcon className="w-5 h-5 text-[#2d3e2d] mr-2 font-magic" />
                  <h3 className="font-black text-[#2d3e2d]" >
                    Image to Video Magic! 🖼️✨
                  </h3>
                </div>
                <p className="text-[#8b7355] font-bold text-sm mb-4" >
                  Upload an image and describe how it should animate!
                </p>

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
                      <Upload className="w-8 h-8 text-[#8b7355] mb-2 font-magic" />
                      <p className="text-[#8b7355] font-bold text-sm" >
                        Click to upload or drag and drop
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        id="image-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-[#f5f1e8] border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8]"
                        onClick={() => document.getElementById("image-upload")?.click()}
                      >
                        Select Image
                      </Button>
                    </div>
                  )}
                </div>

                <Textarea
                  placeholder="The character comes to life and starts dancing with magical sparkles around them..."
                  className="min-h-[80px] border-2 border-[#8b7355] rounded-xl focus:ring-[#d4a574] focus:border-[#d4a574]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* SKETCH TO VIDEO */}
          {creationMode === "sketch-to-video" && (
            <div className="space-y-4">
              <div className="bg-[#f5f1e8] rounded-xl p-4 border-2 border-[#8b7355]">
                <div className="flex items-center mb-3">
                  <PenTool className="w-5 h-5 text-[#2d3e2d] mr-2 font-magic" />
                  <h3 className="font-black text-[#2d3e2d]" >
                    Sketch to Video Magic! ✏️✨
                  </h3>
                </div>
                <p className="text-[#8b7355] font-bold text-sm mb-4" >
                  Draw your idea and watch it come to life in motion!
                </p>

                <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-4 text-center mb-4 bg-white min-h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <PenTool className="w-12 h-12 text-[#8b7355] mx-auto mb-3 font-magic" />
                    <p className="text-[#8b7355] font-bold text-sm" >
                      Drawing Canvas Coming Soon! 🎨
                    </p>
                    <p className="text-[#8b7355] text-xs mt-2" >
                      Draw directly here to create animated videos
                    </p>
                  </div>
                </div>

                <Textarea
                  placeholder="Describe how your sketch should animate: 'The stick figure starts running and jumps over obstacles...'"
                  className="min-h-[80px] border-2 border-[#8b7355] rounded-xl focus:ring-[#d4a574] focus:border-[#d4a574]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STYLE TRANSFER */}
          {creationMode === "style-transfer" && (
            <div className="space-y-4">
              <div className="bg-[#f5f1e8] rounded-xl p-4 border-2 border-[#8b7355]">
                <div className="flex items-center mb-3">
                  <Palette className="w-5 h-5 text-[#2d3e2d] mr-2 font-magic" />
                  <h3 className="font-black text-[#2d3e2d]" >
                    Style Transfer Magic! 🎭✨
                  </h3>
                </div>
                <p className="text-[#8b7355] font-bold text-sm mb-4" >
                  Upload a video and apply amazing artistic styles!
                </p>

                <div className="border-2 border-dashed border-[#8b7355] rounded-xl p-4 text-center mb-4">
                  {uploadedVideo ? (
                    <div className="relative">
                      <video src={uploadedVideo} className="max-h-[200px] mx-auto rounded-lg" controls />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-[#f5f1e8] border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8]"
                        onClick={() => setUploadedVideo(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Video className="w-8 h-8 text-[#8b7355] mb-2 font-magic" />
                      <p className="text-[#8b7355] font-bold text-sm" >
                        Upload your video file
                      </p>
                      <Input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoUpload}
                        id="video-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-[#f5f1e8] border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8]"
                        onClick={() => document.getElementById("video-upload")?.click()}
                      >
                        Select Video
                      </Button>
                    </div>
                  )}
                </div>

                <Textarea
                  placeholder="Describe the style you want: 'Transform this into a Van Gogh painting style with swirling brushstrokes...'"
                  className="min-h-[80px] border-2 border-[#8b7355] rounded-xl focus:ring-[#d4a574] focus:border-[#d4a574]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* 通用设置 */}
          <div className="space-y-4">
            <div>
              <Label
                className="text-[#2d3e2d] font-bold text-sm md:text-base font-magic"
                
              >
                Choose video style 🎨
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mt-2">
                {videoStyles.map((style) => (
                  <Button
                    key={style.id}
                    type="button"
                    variant="outline"
                    className={`flex flex-col items-center justify-center h-auto py-3 px-2 border-2 ${
                      selectedStyle === style.id ? "bg-[#d4a574]/20 border-[#d4a574]" : "border-[#8b7355] bg-[#f5f1e8]"
                    } rounded-xl text-[#2d3e2d] hover:bg-[#d4a574]/20 hover:border-[#d4a574] transition-all`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <span className="text-xl mb-1 font-magic">{style.icon}</span>
                    <span className="font-bold text-xs md:text-sm" >
                      {style.name}
                    </span>
                    <span className="text-xs text-[#8b7355] mt-1 hidden md:block">{style.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="duration"
                  className="text-[#2d3e2d] font-bold text-sm md:text-base font-magic"
                  
                >
                  Video duration 🕒
                </Label>
                <span className="text-[#8b7355] font-bold text-sm" >
                  {duration} seconds
                </span>
              </div>
              <Slider
                id="duration"
                min={5}
                max={30}
                step={5}
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-[#8b7355]">
                <span>5s</span>
                <span>30s</span>
              </div>
            </div>

            <div className="pt-4 md:pt-6">
              <Button
                onClick={onStartRender}
                disabled={
                  !prompt ||
                  (creationMode === "image-to-video" && !uploadedImage) ||
                  (creationMode === "style-transfer" && !uploadedVideo)
                }
                className="w-full bg-[#4a5a4a] hover:bg-[#5a6a5a] text-[#f5f1e8] font-black py-3 rounded-xl md:rounded-2xl shadow-xl transform hover:scale-105 transition-all text-base font-magic"
                
              >
                <Wand2 className="w-5 h-5 mr-2" />
                CREATE MAGIC VIDEO! ✨
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
