"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Eye, Download, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

interface GalleryImage {
  id: number
  url: string
  title: string
  author: string
  likes: number
  views: number
  prompt: string
  size: "small" | "medium" | "large" | "vertical" | "horizontal"
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    url: "/placeholder.svg?height=200&width=150&text=Magic+Forest",
    title: "魔法森林",
    author: "梦想家",
    likes: 1243,
    views: 5678,
    prompt: "一个充满魔法的森林，有发光的树木和神秘生物",
    size: "vertical",
  },
  {
    id: 2,
    url: "/placeholder.svg?height=150&width=200&text=Future+City",
    title: "未来城市",
    author: "科技控",
    likes: 982,
    views: 4321,
    prompt: "2099年的未来城市，飞行汽车和全息投影",
    size: "horizontal",
  },
  {
    id: 3,
    url: "/placeholder.svg?height=120&width=120&text=Space",
    title: "太空探险家",
    author: "星际旅行者",
    likes: 756,
    views: 3210,
    prompt: "宇航员在外星球上探索未知区域",
    size: "small",
  },
  {
    id: 4,
    url: "/placeholder.svg?height=180&width=180&text=Underwater",
    title: "海底王国",
    author: "海洋之心",
    likes: 1567,
    views: 6789,
    prompt: "深海中的美人鱼王国，珊瑚宫殿和发光海洋生物",
    size: "medium",
  },
  {
    id: 5,
    url: "/placeholder.svg?height=120&width=120&text=Dragon",
    title: "驭龙者",
    author: "幻想大师",
    likes: 2134,
    views: 8765,
    prompt: "骑着巨龙飞越山脉的勇士",
    size: "small",
  },
  {
    id: 6,
    url: "/placeholder.svg?height=150&width=200&text=Cherry+Blossom",
    title: "樱花小径",
    author: "春天使者",
    likes: 1876,
    views: 7654,
    prompt: "樱花盛开的日本庭园小径",
    size: "horizontal",
  },
  {
    id: 7,
    url: "/placeholder.svg?height=200&width=150&text=Temple",
    title: "古老神庙",
    author: "历史探索者",
    likes: 1432,
    views: 5432,
    prompt: "被丛林覆盖的神秘古代神庙",
    size: "vertical",
  },
  {
    id: 8,
    url: "/placeholder.svg?height=180&width=180&text=Northern+Lights",
    title: "北极光",
    author: "极光猎手",
    likes: 2345,
    views: 9876,
    prompt: "挪威上空舞动的绚丽北极光",
    size: "medium",
  },
  {
    id: 9,
    url: "/placeholder.svg?height=120&width=120&text=Steampunk",
    title: "蒸汽朋克",
    author: "齿轮大师",
    likes: 876,
    views: 3456,
    prompt: "在工作室里创造奇妙机械的蒸汽朋克发明家",
    size: "small",
  },
  {
    id: 10,
    url: "/placeholder.svg?height=150&width=200&text=Islands",
    title: "浮空岛屿",
    author: "云上漫步者",
    likes: 1654,
    views: 6543,
    prompt: "天空中漂浮的神奇岛屿和瀑布",
    size: "horizontal",
  },
  {
    id: 11,
    url: "/placeholder.svg?height=120&width=120&text=Cat+Wizard",
    title: "猫咪魔法师",
    author: "喵星人",
    likes: 2876,
    views: 9432,
    prompt: "戴着魔法帽施法的可爱猫咪",
    size: "small",
  },
  {
    id: 12,
    url: "/placeholder.svg?height=150&width=200&text=Crystal+Cave",
    title: "水晶洞穴",
    author: "宝石收藏家",
    likes: 1543,
    views: 6123,
    prompt: "闪闪发光的神秘水晶洞穴",
    size: "horizontal",
  },
]

export default function InspirationGallery() {
  const [hoveredImage, setHoveredImage] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(12)
  const [isMounted, setIsMounted] = useState(false)

  // 生成固定的随机旋转角度数组，避免hydration mismatch
  const imageRotations = useMemo(() => {
    return galleryImages.map(() => Math.random() * 2 - 1)
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const loadMore = () => {
    setVisibleCount((prev) => prev + 6)
  }

  return (
    <section className="py-8 bg-[#f5f1e8]" id="inspiration-gallery">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-[#d4a574] rounded-full mr-2"></div>
            <h2
              className="text-3xl font-black text-[#2d3e2d] transform -rotate-1"
              style={{
                fontFamily: "Fredoka One, Arial Black, sans-serif",
                textShadow: "3px 3px 0px #d4a574",
              }}
            >
              AIMAGICA 魔法画廊 ✨
            </h2>
            <div className="w-8 h-8 bg-[#8b7355] rounded-full ml-2"></div>
          </div>
          <p
            className="text-lg font-bold text-[#8b7355] max-w-2xl mx-auto"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            探索用户创造的神奇艺术世界！每一幅作品都是AI、图像和魔法的完美结合！🪄
          </p>
        </div>

        {/* Masonry Gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3 auto-rows-auto">
          {isMounted && galleryImages.slice(0, visibleCount).map((image, index) => (
            <motion.div
              key={image.id}
              className={`relative rounded-xl overflow-hidden border-3 border-[#2d3e2d] shadow-md transform transition-all duration-300 hover:scale-[1.05] ${
                image.size === "small"
                  ? "col-span-1 row-span-1"
                  : image.size === "medium"
                    ? "col-span-2 row-span-2"
                    : image.size === "vertical"
                      ? "col-span-1 row-span-2"
                      : "col-span-2 row-span-1"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
              style={{
                rotate: `${imageRotations[index]}deg`,
                maxHeight:
                  image.size === "vertical"
                    ? "280px"
                    : image.size === "horizontal"
                      ? "160px"
                      : image.size === "medium"
                        ? "300px"
                        : "150px",
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  maxHeight:
                    image.size === "vertical"
                      ? "280px"
                      : image.size === "horizontal"
                        ? "160px"
                        : image.size === "medium"
                          ? "300px"
                          : "150px",
                }}
              >
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.title}
                  className="w-full h-full object-contain bg-gray-900 transition-transform duration-500 hover:scale-110"
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectPosition: "center",
                  }}
                />
              </div>

              {/* Overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-[#2d3e2d]/90 via-transparent to-transparent p-2 flex flex-col justify-end transition-opacity duration-300 ${
                  hoveredImage === image.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <h3
                  className="text-sm font-black text-[#f5f1e8] transform rotate-1 line-clamp-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #2d3e2d",
                  }}
                >
                  {image.title}
                </h3>
                <p
                  className="text-[#d4a574] font-bold text-xs line-clamp-1"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  by {image.author}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex space-x-2">
                    <span className="flex items-center text-[#d4a574] font-bold text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      {image.likes}
                    </span>
                    <span className="flex items-center text-[#d4a574] font-bold text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      {image.views}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="h-6 px-2 py-0 bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] text-xs font-black rounded-lg"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-1 right-1 w-3 h-3 bg-[#d4a574] rounded-full opacity-70"></div>
              <div className="absolute bottom-1 left-1 w-2 h-2 bg-[#8b7355] rounded-full opacity-70"></div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-6">
          <Button
            onClick={loadMore}
            className="bg-[#4a5a4a] hover:bg-[#5a6a5a] text-[#f5f1e8] font-black px-6 py-2 rounded-xl shadow-md transform hover:scale-105 transition-all"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            更多魔法作品
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}
