"use client"

import React, { useState, useEffect } from "react"
import { useSessionCompat as useSession } from "@/components/session-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft, Download, Share2, Trash2, Eye } from "lucide-react"
import { useFavorites } from "@/hooks/useFavorites"
import { toast } from "sonner"
import ImageViewer from "@/components/image-viewer"

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { favorites, loading, removeFromFavorites, fetchFavorites } = useFavorites()
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null)

  // 如果未登录，重定向到首页
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  // 处理图片查看
  const handleViewImage = (imageUrl: string) => {
    setViewingImageUrl(imageUrl)
    setShowImageViewer(true)
  }

  // 关闭图片查看器
  const handleCloseImageViewer = () => {
    setShowImageViewer(false)
    setViewingImageUrl(null)
  }

  // 处理删除收藏
  const handleRemoveFavorite = async (imageId: string) => {
    const success = await removeFromFavorites(imageId)
    if (success) {
      await fetchFavorites() // 刷新列表
    }
  }

  // 处理下载图片
  const handleDownload = async (imageUrl: string, imageId: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `aimagica-favorite-${imageId}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded! 📥')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Download failed')
    }
  }

  // 处理分享
  const handleShare = async (imageUrl: string, prompt: string) => {
    const shareData = {
      title: 'Check out my AIMAGICA creation!',
      text: `"${prompt}" - Created with AIMAGICA ✨`,
      url: imageUrl
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        toast.success('Link copied to clipboard! 📋')
      }
    } catch (error) {
      console.error('Share failed:', error)
      toast.error('Share failed')
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4a574] mx-auto mb-4"></div>
          <p className="text-[#2d3e2d] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
            Loading your favorites...
          </p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // 会被重定向
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-[#2d3e2d]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="bg-[#f5f1e8] border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-[#f5f1e8] font-black rounded-xl transform hover:rotate-1 transition-all"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to AIMAGICA
            </Button>
            <div>
              <h1
                className="text-2xl md:text-3xl font-black text-[#2d3e2d] transform -rotate-1"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "2px 2px 0px #d4a574",
                }}
              >
                MY FAVORITES ❤️
              </h1>
              <p
                className="text-sm text-[#8b7355] font-bold"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Your loved AIMAGICA creations
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4a574] mx-auto mb-4"></div>
            <p className="text-[#2d3e2d] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
              Loading your favorites...
            </p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-xl border-4 border-[#2d3e2d] p-8 max-w-md mx-auto">
              <Heart className="w-16 h-16 text-[#d4a574] mx-auto mb-4" />
              <h2
                className="text-xl font-black text-[#2d3e2d] mb-2"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                No favorites yet! 💔
              </h2>
              <p
                className="text-[#8b7355] font-bold mb-4"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Start creating and loving your AIMAGICA artworks!
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black rounded-xl shadow-lg transform hover:scale-105 transition-all"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Create Your First Artwork! 🎨
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-2xl shadow-xl border-4 border-[#2d3e2d] overflow-hidden transform hover:scale-105 transition-all group"
              >
                {/* Image */}
                <div className="relative aspect-square">
                  <img
                    src={favorite.generated_images.generated_image_url}
                    alt="Favorite artwork"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleViewImage(favorite.generated_images.generated_image_url)}
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewImage(favorite.generated_images.generated_image_url)}
                        size="sm"
                        className="bg-white/90 text-[#2d3e2d] hover:bg-white rounded-full p-2"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDownload(favorite.generated_images.generated_image_url, favorite.generated_images.id)}
                        size="sm"
                        className="bg-white/90 text-[#2d3e2d] hover:bg-white rounded-full p-2"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleShare(favorite.generated_images.generated_image_url, favorite.generated_images.prompt)}
                        size="sm"
                        className="bg-white/90 text-[#2d3e2d] hover:bg-white rounded-full p-2"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleRemoveFavorite(favorite.generated_images.id)}
                        size="sm"
                        className="bg-red-500/90 text-white hover:bg-red-600 rounded-full p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                    <span
                      className="text-xs text-[#8b7355] font-bold"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      Added {new Date(favorite.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p
                    className="text-sm text-[#2d3e2d] font-bold line-clamp-2 mb-2"
                    style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                  >
                    {favorite.generated_images.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-[#8b7355]">
                    <span style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      Style: {favorite.generated_images.style}
                    </span>
                    <span style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                      ❤️ {favorite.generated_images.likes_count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Image Viewer */}
      {showImageViewer && viewingImageUrl && (
        <ImageViewer
          imageUrl={viewingImageUrl}
          onClose={handleCloseImageViewer}
        />
      )}
    </div>
  )
} 