/**
 * Gallery数据库操作 - 全新实现
 * 专门处理点赞和评论功能的数据库连接
 */

// API基础配置
const API_BASE_URL = 'https://aimagica-api.403153162.workers.dev'
const REQUEST_TIMEOUT = 2000 // 2秒超时，极速回退到离线模式
const MAX_RETRIES = 0 // 不重试，立即回退

// 网络状态检测
let isApiAvailable: boolean | null = null
let lastCheckTime = 0
const CHECK_INTERVAL = 30000 // 30秒检查一次

// 快速网络连通性检查
async function quickNetworkCheck(): Promise<boolean> {
  const now = Date.now()
  
  // 如果最近检查过，直接返回缓存结果
  if (isApiAvailable !== null && (now - lastCheckTime) < CHECK_INTERVAL) {
    return isApiAvailable
  }
  
  try {
    // 尝试最简单的GET请求
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1000) // 1秒极速检查
    
    const response = await fetch(`${API_BASE_URL}/api/test`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store'
    })
    
    clearTimeout(timeoutId)
    isApiAvailable = response.ok
    lastCheckTime = now
    
    console.log(`🌐 网络检查结果: ${isApiAvailable ? '可用' : '不可用'}`)
    return isApiAvailable
  } catch (error) {
    isApiAvailable = false
    lastCheckTime = now
    console.log(`🌐 网络检查失败，判定为不可用:`, error)
    return false
  }
}

// 数据类型定义
export interface GalleryImageStats {
  id: string
  likes: number
  comments: number
  views: number
  isLiked: boolean
}

export interface Comment {
  id: string
  imageId: string
  content: string
  author: string
  authorAvatar: string
  createdAt: string
  likes: number
  isLiked: boolean
}

export interface LikeResponse {
  success: boolean
  liked: boolean
  newCount: number
}

export interface CommentsResponse {
  success: boolean
  comments: Comment[]
}

// 通用的fetch包装器，快速失败回退
async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    console.log(`🔄 API请求: ${url}`)
    
    // 创建带超时的fetch请求
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP_${response.status}`)
    }
    
    console.log(`✅ API请求成功: ${url}`)
    return response
  } catch (error: any) {
    console.warn(`⚠️ API请求失败: ${error.message}`)
    console.error(`❌ API不可用，启用离线模式: ${url}`)
    throw new Error('API_UNAVAILABLE')
  }
}

/**
 * 获取图片的点赞和评论统计
 */
export async function getImageStats(imageId: string): Promise<GalleryImageStats | null> {
  try {
    console.log(`📊 获取图片统计: ${imageId}`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/stats/${imageId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ 图片统计获取成功:`, data)
    
    return {
      id: imageId,
      likes: data.likes || 0,
      comments: data.comments || 0,
      views: data.views || 0,
      isLiked: data.isLiked || false,
    }
  } catch (error) {
    console.warn(`⚠️ 获取图片统计失败: ${imageId}`, error)
    return null
  }
}

/**
 * 切换图片点赞状态
 */
export async function toggleImageLike(imageId: string): Promise<LikeResponse> {
  try {
    console.log(`❤️ 尝试切换点赞状态: ${imageId}`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/like/${imageId}`, {
      method: 'POST',
    })
    
    const data = await response.json()
    console.log(`✅ 点赞操作成功:`, data)
    
    // 同步到本地缓存
    localStorage.setItem(`gallery_likes_${imageId}`, data.newCount?.toString() || '0')
    localStorage.setItem(`gallery_liked_${imageId}`, data.liked?.toString() || 'false')
    
    return {
      success: true,
      liked: data.liked,
      newCount: data.newCount || 0,
    }
  } catch (error) {
    console.warn(`⚠️ API不可用，使用离线模式点赞: ${imageId}`, error)
    
    // 离线模式：使用本地存储模拟点赞
    const currentLiked = localStorage.getItem(`gallery_liked_${imageId}`) === 'true'
    const currentLikes = parseInt(localStorage.getItem(`gallery_likes_${imageId}`) || '0')
    
    const newLiked = !currentLiked
    const newCount = newLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)
    
    localStorage.setItem(`gallery_liked_${imageId}`, newLiked.toString())
    localStorage.setItem(`gallery_likes_${imageId}`, newCount.toString())
    
    console.log(`📱 离线点赞成功: ${newLiked}, 新数量: ${newCount}`)
    
    return {
      success: true,
      liked: newLiked,
      newCount: newCount,
    }
  }
}

/**
 * 增加图片浏览量
 */
export async function incrementImageView(imageId: string): Promise<boolean> {
  try {
    console.log(`👁️ 增加浏览量: ${imageId}`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/view/${imageId}`, {
      method: 'POST',
    })
    
    const success = response.ok
    console.log(`${success ? '✅' : '⚠️'} 浏览量${success ? '增加成功' : '增加失败'}: ${imageId}`)
    
    return success
  } catch (error) {
    console.warn(`⚠️ 浏览量增加失败: ${imageId}`, error)
    return false
  }
}

/**
 * 获取图片评论列表
 */
export async function getImageComments(imageId: string): Promise<Comment[]> {
  try {
    console.log(`💬 尝试获取图片评论: ${imageId}`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/comments/${imageId}`)
    
    const data = await response.json()
    console.log(`✅ 评论获取成功:`, data)
    
    if (data.success && Array.isArray(data.comments)) {
      const comments = data.comments.map((comment: any) => {
        // 从localStorage获取评论的点赞状态
        const localLiked = localStorage.getItem(`comment_liked_${comment.id}`) === 'true'
        const localLikes = parseInt(localStorage.getItem(`comment_likes_${comment.id}`) || '0')
        
        return {
          id: comment.id,
          imageId: comment.imageId || imageId,
          content: comment.content,
          author: comment.author || 'AIMAGICA User',
          authorAvatar: comment.authorAvatar || '/images/aimagica-logo.png',
          createdAt: comment.createdAt || new Date().toISOString(),
          likes: Math.max(comment.likes || 0, localLikes), // 使用更大的值
          isLiked: comment.isLiked || localLiked,
        }
      })
      
      // 缓存到本地存储
      localStorage.setItem(`gallery_comments_data_${imageId}`, JSON.stringify(comments))
      localStorage.setItem(`gallery_comments_${imageId}`, comments.length.toString())
      
      return comments
    }
    
    return []
  } catch (error) {
    console.warn(`⚠️ API不可用，使用离线模式评论: ${imageId}`, error)
    
    // 从本地存储获取缓存的评论
    try {
      const cachedComments = localStorage.getItem(`gallery_comments_data_${imageId}`)
      if (cachedComments) {
        const comments = JSON.parse(cachedComments).map((comment: any) => {
          // 确保离线模式下也能获取最新的点赞状态
          const localLiked = localStorage.getItem(`comment_liked_${comment.id}`) === 'true'
          const localLikes = parseInt(localStorage.getItem(`comment_likes_${comment.id}`) || comment.likes?.toString() || '0')
          
          return {
            ...comment,
            likes: localLikes,
            isLiked: localLiked,
          }
        })
        console.log(`📱 使用缓存评论: ${comments.length}条`)
        return comments
      }
    } catch (e) {
      console.warn('缓存评论解析失败:', e)
    }
    
    return []
  }
}

/**
 * 添加新评论
 */
export async function addImageComment(imageId: string, content: string): Promise<Comment | null> {
  try {
    console.log(`💬 开始添加评论: ${imageId}, 内容长度: ${content.length}`)
    
    // 验证输入
    if (!content || content.trim().length === 0) {
      console.warn('⚠️ 评论内容为空')
      return null
    }
    
    if (content.length > 500) {
      console.warn('⚠️ 评论内容过长')
      throw new Error('评论内容不能超过500字符')
    }
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/comments/${imageId}`, {
      method: 'POST',
      body: JSON.stringify({
        content: content.trim(),
        author: 'AIMAGICA User', // 匿名用户名
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API响应错误: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`服务器错误: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ 评论添加成功:`, data)
    
    if (data.success && data.comment) {
      const newComment = {
        id: data.comment.id,
        imageId: imageId,
        content: data.comment.content,
        author: data.comment.author || 'AIMAGICA User',
        authorAvatar: data.comment.authorAvatar || '/images/aimagica-logo.png',
        createdAt: data.comment.createdAt || new Date().toISOString(),
        likes: data.comment.likes || 0,
        isLiked: false,
      }
      
      // 同步到本地缓存
      const currentCount = parseInt(localStorage.getItem(`gallery_comments_${imageId}`) || '0')
      localStorage.setItem(`gallery_comments_${imageId}`, (currentCount + 1).toString())
      
      // 缓存评论数据
      try {
        const cachedComments = localStorage.getItem(`gallery_comments_data_${imageId}`)
        const comments = cachedComments ? JSON.parse(cachedComments) : []
        comments.unshift(newComment)
        localStorage.setItem(`gallery_comments_data_${imageId}`, JSON.stringify(comments))
      } catch (e) {
        console.warn('缓存评论数据失败:', e)
      }
      
      return newComment
    }
    
    return null
  } catch (error) {
    console.warn(`⚠️ API不可用，使用离线模式添加评论: ${imageId}`, error)
    
    // 离线模式：生成本地评论
    const offlineComment: Comment = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageId: imageId,
      content: content.trim(),
      author: 'AIMAGICA User',
      authorAvatar: '/images/aimagica-logo.png',
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    }
    
    // 存储到本地缓存
    try {
      const currentCount = parseInt(localStorage.getItem(`gallery_comments_${imageId}`) || '0')
      localStorage.setItem(`gallery_comments_${imageId}`, (currentCount + 1).toString())
      
      const cachedComments = localStorage.getItem(`gallery_comments_data_${imageId}`)
      const comments = cachedComments ? JSON.parse(cachedComments) : []
      comments.unshift(offlineComment)
      localStorage.setItem(`gallery_comments_data_${imageId}`, JSON.stringify(comments))
      
      console.log(`📱 离线评论添加成功: ${offlineComment.id}`)
      return offlineComment
    } catch (e) {
      console.error('离线评论存储失败:', e)
      return null
    }
  }
}

/**
 * 切换评论点赞状态
 */
export async function toggleCommentLike(commentId: string): Promise<{ success: boolean; liked: boolean; newCount: number }> {
  try {
    console.log(`👍 切换评论点赞: ${commentId}`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/comment-like/${commentId}`, {
      method: 'POST',
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ 评论点赞成功: ${commentId}`)
      
      // 同步到本地缓存
      localStorage.setItem(`comment_liked_${commentId}`, data.liked?.toString() || 'false')
      localStorage.setItem(`comment_likes_${commentId}`, data.newCount?.toString() || '0')
      
      return {
        success: true,
        liked: data.liked || false,
        newCount: data.newCount || 0,
      }
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    console.warn(`⚠️ API不可用，使用离线模式评论点赞: ${commentId}`, error)
    
    // 离线模式：使用本地存储模拟评论点赞
    const currentLiked = localStorage.getItem(`comment_liked_${commentId}`) === 'true'
    const currentLikes = parseInt(localStorage.getItem(`comment_likes_${commentId}`) || '0')
    
    const newLiked = !currentLiked
    const newCount = newLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)
    
    localStorage.setItem(`comment_liked_${commentId}`, newLiked.toString())
    localStorage.setItem(`comment_likes_${commentId}`, newCount.toString())
    
    console.log(`📱 离线评论点赞成功: ${newLiked}, 新数量: ${newCount}`)
    
    return {
      success: true,
      liked: newLiked,
      newCount: newCount,
    }
  }
}

/**
 * 批量获取多个图片的统计信息
 */
export async function getBatchImageStats(imageIds: string[]): Promise<Record<string, GalleryImageStats>> {
  // 首先快速检查网络
  const networkAvailable = await quickNetworkCheck()
  
  if (!networkAvailable) {
    console.log(`📱 网络不可用，直接使用离线模式统计: ${imageIds.length}张图片`)
    
    // 直接回退到本地存储
    const fallbackStats: Record<string, GalleryImageStats> = {}
    imageIds.forEach(id => {
      const localLikes = parseInt(localStorage.getItem(`gallery_likes_${id}`) || '0')
      const localViews = parseInt(localStorage.getItem(`gallery_views_${id}`) || '0') 
      const localComments = parseInt(localStorage.getItem(`gallery_comments_${id}`) || '0')
      const localIsLiked = localStorage.getItem(`gallery_liked_${id}`) === 'true'
      
      fallbackStats[id] = {
        id,
        likes: localLikes,
        comments: localComments,
        views: localViews,
        isLiked: localIsLiked
      }
    })
    
    return fallbackStats
  }
  
  // 网络可用时尝试API请求
  try {
    console.log(`📊 网络可用，尝试批量获取图片统计: ${imageIds.length}张图片`)
    
    const response = await apiRequest(`${API_BASE_URL}/api/gallery/batch-stats`, {
      method: 'POST',
      body: JSON.stringify({ imageIds }),
    })
    
    const data = await response.json()
    console.log(`✅ 批量统计获取成功:`, Object.keys(data.stats || {}).length)
    
    return data.stats || {}
  } catch (error) {
    console.warn(`⚠️ API请求失败，使用离线模式统计: ${imageIds.length}张图片`, error)
    
    // 回退到本地存储的模拟数据
    const fallbackStats: Record<string, GalleryImageStats> = {}
    imageIds.forEach(id => {
      const localLikes = parseInt(localStorage.getItem(`gallery_likes_${id}`) || '0')
      const localViews = parseInt(localStorage.getItem(`gallery_views_${id}`) || '0') 
      const localComments = parseInt(localStorage.getItem(`gallery_comments_${id}`) || '0')
      const localIsLiked = localStorage.getItem(`gallery_liked_${id}`) === 'true'
      
      fallbackStats[id] = {
        id,
        likes: localLikes,
        comments: localComments,
        views: localViews,
        isLiked: localIsLiked
      }
    })
    
    console.log('📱 使用本地缓存数据作为回退')
    return fallbackStats
  }
}

// 导出默认的数据库操作对象
export const galleryDB = {
  getImageStats,
  toggleImageLike,
  incrementImageView,
  getImageComments,
  addImageComment,
  toggleCommentLike,
  getBatchImageStats,
  quickNetworkCheck,
}

export default galleryDB