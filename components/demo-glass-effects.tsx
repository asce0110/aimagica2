"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Wand2, Palette, Star, Info } from "lucide-react"
import GlassMorphism from "@/components/glass-morphism"
import MobileOptimizedCard from "@/components/mobile-optimized-card"
import MobileGlassButton from "@/components/mobile-glass-button"

export default function DemoGlassEffects() {
  const [activeTab, setActiveTab] = useState("cards")

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h2
          className="text-2xl md:text-3xl font-black text-[#2d3e2d] transform -rotate-1"
          style={{
            fontFamily: "Fredoka One, Arial Black, sans-serif",
            textShadow: "3px 3px 0px #d4a574",
          }}
        >
          AIMAGICA 玻璃拟态效果展示 ✨
        </h2>
        <p className="text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
          在各种设备上都能完美呈现的魔法玻璃效果！
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#2d3e2d]/80 backdrop-blur-md rounded-2xl p-2 shadow-lg">
          <TabsTrigger
            value="cards"
            className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] text-[#f5f1e8] transform hover:scale-105 transition-all"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <Palette className="w-4 h-4 mr-2" />
            卡片效果
          </TabsTrigger>
          <TabsTrigger
            value="buttons"
            className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] text-[#f5f1e8] transform hover:scale-105 transition-all"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            按钮效果
          </TabsTrigger>
          <TabsTrigger
            value="info"
            className="rounded-xl font-black data-[state=active]:bg-[#d4a574] data-[state=active]:text-[#2d3e2d] text-[#f5f1e8] transform hover:scale-105 transition-all"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <Info className="w-4 h-4 mr-2" />
            使用说明
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MobileOptimizedCard title="主色调玻璃卡片" icon={<Sparkles className="w-5 h-5" />} color="primary">
              <p className="text-[#f5f1e8] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                这是一个使用主色调的玻璃拟态卡片，在移动设备上也能完美呈现！
              </p>
              <div className="mt-4 flex justify-end">
                <MobileGlassButton variant="accent" size="sm">
                  魔法按钮
                </MobileGlassButton>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard title="次要色调玻璃卡片" icon={<Star className="w-5 h-5" />} color="secondary">
              <p className="text-[#f5f1e8] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                这是一个使用次要色调的玻璃拟态卡片，在移动设备上也能完美呈现！
              </p>
              <div className="mt-4 flex justify-end">
                <MobileGlassButton variant="neutral" size="sm">
                  魔法按钮
                </MobileGlassButton>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard title="强调色玻璃卡片" icon={<Wand2 className="w-5 h-5" />} color="accent">
              <p className="text-[#2d3e2d] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                这是一个使用强调色的玻璃拟态卡片，在移动设备上也能完美呈现！
              </p>
              <div className="mt-4 flex justify-end">
                <MobileGlassButton variant="primary" size="sm">
                  魔法按钮
                </MobileGlassButton>
              </div>
            </MobileOptimizedCard>

            <MobileOptimizedCard title="中性色玻璃卡片" icon={<Palette className="w-5 h-5" />} color="neutral">
              <p className="text-[#2d3e2d] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                这是一个使用中性色的玻璃拟态卡片，在移动设备上也能完美呈现！
              </p>
              <div className="mt-4 flex justify-end">
                <MobileGlassButton variant="secondary" size="sm">
                  魔法按钮
                </MobileGlassButton>
              </div>
            </MobileOptimizedCard>
          </div>
        </TabsContent>

        <TabsContent value="buttons" className="mt-6">
          <GlassMorphism intensity="light" color="neutral">
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <h3
                  className="text-xl font-black text-[#2d3e2d] transform -rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "2px 2px 0px #d4a574",
                  }}
                >
                  玻璃效果按钮
                </h3>
                <div className="flex flex-wrap gap-4">
                  <MobileGlassButton variant="primary" size="md" icon={<Sparkles className="w-4 h-4" />}>
                    主色调按钮
                  </MobileGlassButton>
                  <MobileGlassButton variant="secondary" size="md" icon={<Wand2 className="w-4 h-4" />}>
                    次要色调按钮
                  </MobileGlassButton>
                  <MobileGlassButton variant="accent" size="md" icon={<Star className="w-4 h-4" />}>
                    强调色按钮
                  </MobileGlassButton>
                  <MobileGlassButton variant="neutral" size="md" icon={<Palette className="w-4 h-4" />}>
                    中性色按钮
                  </MobileGlassButton>
                </div>
              </div>

              <div className="space-y-4">
                <h3
                  className="text-xl font-black text-[#2d3e2d] transform -rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "2px 2px 0px #d4a574",
                  }}
                >
                  不同尺寸按钮
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <MobileGlassButton variant="primary" size="sm">
                    小按钮
                  </MobileGlassButton>
                  <MobileGlassButton variant="primary" size="md">
                    中按钮
                  </MobileGlassButton>
                  <MobileGlassButton variant="primary" size="lg">
                    大按钮
                  </MobileGlassButton>
                </div>
              </div>

              <div className="space-y-4">
                <h3
                  className="text-xl font-black text-[#2d3e2d] transform -rotate-1"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "2px 2px 0px #d4a574",
                  }}
                >
                  状态按钮
                </h3>
                <div className="flex flex-wrap gap-4">
                  <MobileGlassButton variant="accent" isLoading>
                    加载中
                  </MobileGlassButton>
                  <MobileGlassButton variant="accent" disabled>
                    禁用状态
                  </MobileGlassButton>
                </div>
              </div>
            </div>
          </GlassMorphism>
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <GlassMorphism intensity="light" color="neutral">
            <div className="p-6 space-y-4">
              <h3
                className="text-xl font-black text-[#2d3e2d] transform -rotate-1"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "2px 2px 0px #d4a574",
                }}
              >
                玻璃拟态效果使用指南
              </h3>

              <div className="space-y-2">
                <p className="text-[#2d3e2d] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  ✨ 这些组件专为移动设备优化，确保在各种屏幕尺寸上都能呈现完美的玻璃拟态效果。
                </p>

                <p className="text-[#2d3e2d] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  🔍 主要特点：
                </p>
                <ul
                  className="list-disc pl-6 space-y-1 text-[#2d3e2d]"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <li>自动检测设备类型，调整模糊效果强度</li>
                  <li>针对不支持backdrop-filter的设备提供优雅降级方案</li>
                  <li>优化触摸交互体验</li>
                  <li>调整透明度和模糊程度，确保在小屏幕上清晰可读</li>
                  <li>减少移动设备上的装饰元素，提高性能</li>
                </ul>

                <p className="text-[#2d3e2d] font-bold mt-4" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                  🧙‍♂️ 如何使用：
                </p>
                <div className="bg-[#2d3e2d]/10 p-3 rounded-xl">
                  <code className="text-sm text-[#2d3e2d]">
                    {`<GlassMorphism color="primary" intensity="medium">\n  <YourContent />\n</GlassMorphism>`}
                  </code>
                </div>
              </div>
            </div>
          </GlassMorphism>
        </TabsContent>
      </Tabs>
    </div>
  )
}
