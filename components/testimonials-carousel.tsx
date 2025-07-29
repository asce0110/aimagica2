"use client"

import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: "Sarah L.",
    role: "Digital Artist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4&clothesColor=262e33",
    content: "As a digital artist, AIMAGICA has completely revolutionized my workflow! I can quickly turn sketches into beautiful concept art, saving me a lot of time. Clients are amazed by the final results!",
    rating: 5
  },
  {
    id: 2,
    name: "Mike T.",
    role: "Primary School Teacher", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike&backgroundColor=c0aede&clothesColor=3c4f5c&accessories=wayfarers",
    content: "I use AIMAGICA in the classroom, and the students absolutely love it! Even those who think they 'can't draw' can create amazing artwork. This greatly improves their confidence and creativity!",
    rating: 5
  },
  {
    id: 3,
    name: "Lily K.",
    role: "Hobbyist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&backgroundColor=ffd5dc&clothesColor=ffeaa7&hair=longHairBun",
    content: "I never thought I could create such beautiful artwork! AIMAGICA allows me, someone with absolutely no drawing talent, to create amazing works. Now I can't wait to create something new every day!",
    rating: 5
  },
  {
    id: 4,
    name: "Alex Chen",
    role: "Graphic Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=ffdfbf&clothesColor=74b9ff&hair=shortHairShortFlat",
    content: "AIMAGICA has become my secret weapon for client presentations! I can quickly visualize concepts that would take hours to sketch manually. The quality is consistently outstanding!",
    rating: 5
  },
  {
    id: 5,
    name: "Emma Wilson",
    role: "Content Creator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=a29bfe&clothesColor=00b894&hair=longHairStraight",
    content: "My social media engagement has skyrocketed since I started using AIMAGICA! The AI-generated art gets so many likes and shares. It's like having a personal artist on demand!",
    rating: 5
  },
  {
    id: 6,
    name: "David Park",
    role: "Indie Game Developer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=fd79a8&clothesColor=6c5ce7&accessories=prescription02",
    content: "Creating concept art for my game has never been easier! AIMAGICA helps me explore different visual styles quickly. It's an invaluable tool for any creative professional!",
    rating: 5
  },
  {
    id: 7,
    name: "Maria Santos",
    role: "Art Student",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=fd79a8&clothesColor=e17055&hair=longHairWavy",
    content: "AIMAGICA is helping me learn about different art styles and compositions! It's like having a master artist mentor available 24/7. Perfect for studying and inspiration!",
    rating: 5
  },
  {
    id: 8,
    name: "John Miller",
    role: "Marketing Manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=55a3ff&clothesColor=2d3436&hair=shortHairShortWaved",
    content: "Our marketing campaigns have been so much more visually compelling since we started using AIMAGICA! Creating custom artwork for each campaign is now quick and cost-effective!",
    rating: 5
  },
  {
    id: 9,
    name: "Sophie Taylor",
    role: "Children's Book Author",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&backgroundColor=81ecec&clothesColor=fab1a0&hair=longHairBigHair",
    content: "AIMAGICA brings my stories to life in ways I never imagined! I can create vivid illustrations that perfectly match my characters and scenes. My readers absolutely love the artwork!",
    rating: 5
  },
  {
    id: 10,
    name: "Ryan Kim",
    role: "Freelance Artist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan&backgroundColor=fdcb6e&clothesColor=00cec9&hair=shortHairTheCaesar",
    content: "AIMAGICA has revolutionized my freelance business! I can take on more projects and deliver higher quality work faster than ever before. My clients are consistently impressed!",
    rating: 5
  }
]

export default function TestimonialsCarousel() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev - 420) // 连续向左移动，永不重置
    }, 4000) // 每4秒移动一次

    return () => clearInterval(interval)
  }, [])

  return (
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
            What Magicians Say 💬
          </h2>
          <p
            className="text-lg md:text-xl font-bold text-[#8b7355] max-w-3xl mx-auto"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            See how other creators are using AIMAGICA to unlock their creative potential!
          </p>
        </div>

        {/* 轮播容器 */}
        <div className="relative h-80 overflow-hidden">
          <div 
            className="flex transition-transform duration-1000 ease-in-out"
            style={{
              transform: `translateX(${offset}px)`,
              paddingLeft: '50%',
              marginLeft: '-210px' // 半个卡片宽度，让卡片中心对齐
            }}
          >
            {/* 重复50遍数组以创建永不停止的循环 */}
            {Array.from({ length: 50 }, () => testimonials).flat().map((testimonial, index) => {
              // 计算当前卡片相对于屏幕中心的位置
              const basePosition = index * 420
              const currentPosition = basePosition + offset
              const screenCenter = 0
              const distanceFromCenter = Math.abs(currentPosition - screenCenter)
              
              // 计算透明度：距离中心越远越透明
              let opacity = 1
              if (distanceFromCenter === 0) {
                opacity = 1 // 中心卡片
              } else if (distanceFromCenter <= 420) {
                opacity = 0.3 // 相邻卡片
              } else if (distanceFromCenter <= 840) {
                opacity = 0.1 // 更远的卡片
              } else {
                opacity = 0 // 不可见
              }
              
              // 计算旋转角度：基于距离中心的位置
              let rotation = 0
              if (currentPosition < 0) {
                rotation = -1.5 // 左侧倾斜
              } else if (currentPosition > 0) {
                rotation = 1.5 // 右侧倾斜
              }

              return (
                <div
                  key={`${testimonial.id}-${Math.floor(index / testimonials.length)}`}
                  className="flex-shrink-0 px-2"
                  style={{
                    width: '420px',
                    opacity,
                    transform: `rotate(${rotation}deg)`,
                    transition: 'opacity 1s ease-in-out, transform 1s ease-in-out'
                  }}
                >
                  <div className="bg-white rounded-2xl border-4 border-[#2d3e2d] p-6 shadow-xl h-full flex flex-col justify-between w-full">
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full border-2 border-[#8b7355] mr-4 shadow-lg transform hover:scale-110 transition-transform overflow-hidden bg-white">
                          <img
                            src={testimonial.avatar}
                            alt={`${testimonial.name}'s avatar`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 备用头像
                              e.currentTarget.src = `/placeholder.svg?height=50&width=50&text=${testimonial.name.charAt(0)}`
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-[#2d3e2d]" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                            {testimonial.name}
                          </h4>
                          <div className="flex text-yellow-500">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p
                        className="text-[#2d3e2d] text-sm leading-relaxed font-medium"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        "{testimonial.content}"
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#d4a574]">
                      <p
                        className="text-xs font-bold text-[#8b7355]"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="text-center mt-10 md:mt-16">
          <div className="flex justify-center items-center gap-8 text-[#2d3e2d]">
            <div className="text-center">
              <p
                className="text-3xl md:text-4xl font-black"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                500K+
              </p>
              <p
                className="text-sm font-bold"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Happy Creators
              </p>
            </div>
            <div className="text-center">
              <p
                className="text-3xl md:text-4xl font-black"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                10M+
              </p>
              <p
                className="text-sm font-bold"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Images Generated
              </p>
            </div>
            <div className="text-center">
              <p
                className="text-3xl md:text-4xl font-black"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                4.9★
              </p>
              <p
                className="text-sm font-bold"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Average Rating
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 