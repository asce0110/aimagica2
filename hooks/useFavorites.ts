import { useState, useEffect } from 'react'
import { useSessionCompat as useSession } from '@/components/session-provider'
import { toast } from 'sonner'

interface FavoriteImage {
  id: string
  created_at: string
  generated_images: {
    id: string
    generated_image_url: string
    style: string
    prompt: string
    created_at: string
    likes_count: number
  }
}

export function useFavorites() {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<FavoriteImage[]>([])
  const [loading, setLoading] = useState(false)

  // 获取收藏列表
  const fetchFavorites = async () => {
    if (!session?.user?.email) return

    setLoading(true)
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  // 添加收藏
  const addToFavorites = async (imageId: string) => {
    if (!session?.user?.email) {
      toast.error('Please sign in to add favorites')
      return false
    }

    try {
      const response = await fetch(`/api/favorites/${imageId}`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Added to favorites! ❤️')
        await fetchFavorites() // 刷新收藏列表
        return true
      } else {
        const data = await response.json()
        if (data.message === 'Already favorited') {
          toast.info('Already in your favorites!')
          return true
        } else {
          toast.error('Failed to add to favorites')
          return false
        }
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
      toast.error('Failed to add to favorites')
      return false
    }
  }

  // 删除收藏
  const removeFromFavorites = async (imageId: string) => {
    if (!session?.user?.email) return false

    try {
      const response = await fetch(`/api/favorites/${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Removed from favorites')
        await fetchFavorites() // 刷新收藏列表
        return true
      } else {
        toast.error('Failed to remove from favorites')
        return false
      }
    } catch (error) {
      console.error('Error removing from favorites:', error)
      toast.error('Failed to remove from favorites')
      return false
    }
  }

  // 检查是否已收藏
  const checkIsFavorited = async (imageId: string): Promise<boolean> => {
    if (!session?.user?.email) return false

    try {
      const response = await fetch(`/api/favorites/${imageId}`)
      if (response.ok) {
        const data = await response.json()
        return data.isFavorited
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
    return false
  }

  // 切换收藏状态
  const toggleFavorite = async (imageId: string) => {
    const isFavorited = await checkIsFavorited(imageId)
    if (isFavorited) {
      return await removeFromFavorites(imageId)
    } else {
      return await addToFavorites(imageId)
    }
  }

  useEffect(() => {
    if (session?.user?.email) {
      fetchFavorites()
    }
  }, [session?.user?.email])

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    checkIsFavorited,
    toggleFavorite,
    fetchFavorites
  }
} 