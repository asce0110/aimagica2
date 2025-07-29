"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Copy, Star, Bookmark, MessageCircle } from "lucide-react"

interface CommunityGalleryProps {
  onUsePrompt?: (prompt: string) => void
  onViewMore?: () => void
  creationMode?: "text2img" | "img2img" | "text2video" | "img2video"
  mode?: "quick" | "pro"
}

const magicPrompts = [
  {
    id: 1,
    prompt: "Cute cat wizard wearing a starry magic hat, casting rainbow spells",
    author: "CatLover",
    avatar: "/placeholder.svg?height=40&width=40&text=Cat",
    likes: 834,
    uses: 2156,
    category: "Cute",
    featured: true,
    emoji: "🐱",
  },
  {
    id: 6,
    prompt: "Beautiful anime girl with flowing silver hair, starlight in her eyes, magical aura",
    author: "AnimeLover",
    avatar: "/placeholder.svg?height=40&width=40&text=Anime",
    likes: 1245,
    uses: 2890,
    category: "Anime",
    featured: true,
    emoji: "✨",
  },
  {
    id: 8,
    prompt: "Magical crystal cave with rainbow reflections, glowing gems, mystical atmosphere",
    author: "CrystalMage",
    avatar: "/placeholder.svg?height=40&width=40&text=Crystal",
    likes: 892,
    uses: 2134,
    category: "Magic",
    featured: true,
    emoji: "💎",
  },
]

export default function CommunityGallery({ onUsePrompt, onViewMore, creationMode = "text2img", mode = "quick" }: CommunityGalleryProps) {
  // Dynamic number of prompts based on creation mode and interface mode
  const getPromptCount = () => {
    switch (creationMode) {
      case "text2video":
        return 3 // Text to Video shows 3 prompts
      case "img2video":
        return 4 // Image to Video shows 4 prompts
      case "text2img":
        return 6 // Text to Image shows 6 prompts
      case "img2img":
        return 8 // Image to Image shows 8 prompts
      default:
        return 6 // Default to 6 prompts
    }
  }

  const displayedPrompts = magicPrompts.slice(0, getPromptCount())

  return (
    <div className="space-y-4">
      {displayedPrompts.map((prompt) => (
        <Card
          key={prompt.id}
          className="bg-white border-4 border-[#8b7355] hover:border-[#2d3e2d] transition-all cursor-pointer rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <CardContent className="p-3">
            <div className="flex items-start space-x-3">
              <div className="relative flex-shrink-0">
                <img
                  src={prompt.avatar || "/placeholder.svg?height=40&width=40"}
                  alt={prompt.author}
                  className="w-10 h-10 rounded-full object-cover border-3 border-[#8b7355]"
                />
                {prompt.featured && (
                  <div className="absolute -top-1 -right-1 bg-[#d4a574] border-2 border-[#2d3e2d] text-[#2d3e2d] rounded-full w-5 h-5 flex items-center justify-center transform rotate-12">
                    <Star className="w-3 h-3" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 text-lg">{prompt.emoji}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-[#8b7355] font-bold text-xs" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                    by {prompt.author}
                  </p>
                  <div
                    className="bg-[#f5f1e8] border-2 border-[#8b7355] text-[#2d3e2d] font-black px-2 py-0.5 rounded-xl text-xs transform rotate-1"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    {prompt.category}
                  </div>
                </div>

                <div
                  className="mt-1 p-2 bg-[#f5f1e8] rounded-xl border-2 border-dashed border-[#8b7355] text-[#2d3e2d] text-sm line-clamp-2 overflow-hidden"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  title={prompt.prompt}
                >
                  "{prompt.prompt}"
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div
                    className="flex items-center space-x-2 text-xs text-[#8b7355] font-bold"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <span className="flex items-center">
                      <Heart className="w-3 h-3 mr-1 text-red-500" />
                      {prompt.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-3 h-3 mr-1 text-blue-500" />
                      {prompt.uses}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="h-6 w-6 p-0 bg-[#f5f1e8] border-2 border-[#8b7355] text-[#2d3e2d] font-black rounded-xl hover:bg-[#8b7355] hover:text-[#f5f1e8] transform hover:rotate-3 transition-all"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <Bookmark className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-6 px-2 text-xs bg-[#d4a574] border-2 border-[#2d3e2d] text-[#2d3e2d] font-black rounded-xl hover:bg-[#c19660] transform hover:rotate-1 transition-all"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      onClick={() => onUsePrompt && onUsePrompt(prompt.prompt)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        onClick={onViewMore}
                    className="w-full bg-[#4a5a4a] hover:bg-[#5a6a5a] text-[#f5f1e8] font-black py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all"
        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
      >
        Discover More Magic Prompts! ✨
      </Button>
    </div>
  )
}
