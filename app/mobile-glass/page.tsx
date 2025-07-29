"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import MobileGlassContainer from "@/components/mobile-glass-container"
import DemoGlassEffects from "@/components/demo-glass-effects"

export default function MobileGlassPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <MobileGlassContainer
      backgroundImage="/placeholder.svg?height=1200&width=800&text=AIMAGICA+Background"
      className="min-h-screen"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="bg-white/70 backdrop-blur-md border-4 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355]/70 hover:text-[#f5f1e8] font-black rounded-2xl mr-4"
            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回主页
          </Button>
        </div>

        <DemoGlassEffects />
      </div>
    </MobileGlassContainer>
  )
}
