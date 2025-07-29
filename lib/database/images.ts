import { createClient } from '../supabase-server'
import { Tables } from '../supabase'
import { deleteFromR2 } from '../storage/r2'

export type GeneratedImage = Tables<'generated_images'>
export type ImageLike = Tables<'image_likes'>

// Create new generated image
export async function createGeneratedImage(imageData: {
  user_id: string
  original_sketch_url?: string
  generated_image_url: string
  style: string
  prompt?: string
  is_public?: boolean
  r2_key?: string
  original_url?: string
}): Promise<GeneratedImage | null> {
  const supabase = await createClient()
  
  const insertData: any = {
    user_id: imageData.user_id,
    original_sketch_url: imageData.original_sketch_url,
    generated_image_url: imageData.generated_image_url,
    style: imageData.style,
    prompt: imageData.prompt,
    is_public: imageData.is_public || false,
    status: 'completed' // 直接设置为completed，因为图片已经生成完成
  }

  // 如果有R2相关信息，添加到数据中
  if (imageData.r2_key) {
    insertData.r2_key = imageData.r2_key
  }
  if (imageData.original_url) {
    insertData.original_url = imageData.original_url
  }
  
  console.log('🔍 Attempting database insert with data:', insertData)
  
  const { data, error } = await supabase
    .from('generated_images')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('❌ Database insert error:', error)
    throw new Error(`Database insert failed: ${error.message} (Code: ${error.code})`)
  }

  console.log('✅ Database insert successful:', data)
  return data
}

// Update image status
export async function updateImageStatus(
  imageId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  errorMessage?: string,
  renderTime?: number
): Promise<boolean> {
  const supabase = await createClient()
  
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  }

  if (errorMessage) {
    updateData.error_message = errorMessage
  }

  if (renderTime) {
    updateData.render_time_seconds = renderTime
  }

  const { error } = await supabase
    .from('generated_images')
    .update(updateData)
    .eq('id', imageId)

  if (error) {
    console.error('Error updating image status:', error)
    return false
  }

  return true
}

// Get user's images
export async function getUserImages(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<GeneratedImage[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching user images:', error)
    return []
  }

  return data || []
}

// Get public images for gallery
export async function getPublicImages(
  limit: number = 20,
  offset: number = 0,
  styleFilter?: string
): Promise<GeneratedImage[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('generated_images')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
  
  // 如果有风格过滤参数，添加风格过滤条件
  if (styleFilter) {
    query = query.ilike('style', `%${styleFilter}%`)
  }
  
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching public images:', error)
    return []
  }

  return data || []
}

// Get popular images (by likes)
export async function getPopularImages(
  limit: number = 20,
  offset: number = 0
): Promise<GeneratedImage[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'completed')
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching popular images:', error)
    return []
  }

  return data || []
}

// Toggle image public status
export async function toggleImagePublic(imageId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // First get current status
  const { data: currentImage, error: fetchError } = await supabase
    .from('generated_images')
    .select('is_public')
    .eq('id', imageId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !currentImage) {
    console.error('Error fetching image:', fetchError)
    return false
  }

  // Toggle status
  const { error } = await supabase
    .from('generated_images')
    .update({
      is_public: !currentImage.is_public,
      updated_at: new Date().toISOString()
    })
    .eq('id', imageId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error toggling image public status:', error)
    return false
  }

  return true
}

// Delete image (deprecated - use deleteImageWithCleanup instead)
export async function deleteImage(imageId: string, userId: string): Promise<boolean> {
  console.warn('⚠️ Using deprecated deleteImage function. Consider using deleteImageWithCleanup for R2 cleanup.')
  return deleteImageWithCleanup(imageId, userId)
}

// Like/Unlike image
export async function toggleImageLike(imageId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Check if already liked
  const { data: existingLike, error: fetchError } = await supabase
    .from('image_likes')
    .select('id')
    .eq('image_id', imageId)
    .eq('user_id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking existing like:', fetchError)
    return false
  }

  if (existingLike) {
    // Unlike - remove the like
    const { error } = await supabase
      .from('image_likes')
      .delete()
      .eq('image_id', imageId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing like:', error)
      return false
    }
  } else {
    // Like - add the like
    const { error } = await supabase
      .from('image_likes')
      .insert({
        image_id: imageId,
        user_id: userId
      })

    if (error) {
      console.error('Error adding like:', error)
      return false
    }
  }

  return true
}

// Check if user liked image
export async function hasUserLikedImage(imageId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('image_likes')
    .select('id')
    .eq('image_id', imageId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking if user liked image:', error)
    return false
  }

  return !!data
}

// Get images with like status for user
export async function getImagesWithLikeStatus(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<(GeneratedImage & { user_has_liked: boolean })[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generated_images')
    .select(`
      *,
      image_likes!left (
        user_id
      )
    `)
    .eq('is_public', true)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching images with like status:', error)
    return []
  }

  return data?.map(image => ({
    ...image,
    user_has_liked: image.image_likes?.some((like: any) => like.user_id === userId) || false
  })) || []
}

// Get image statistics
export async function getImageStats() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generated_images')
    .select('status')

  if (error) {
    console.error('Error fetching image stats:', error)
    return {
      total: 0,
      completed: 0,
      processing: 0,
      failed: 0,
      public: 0
    }
  }

  const stats = data.reduce((acc, image) => {
    acc.total++
    if (image.status === 'completed') acc.completed++
    if (image.status === 'processing') acc.processing++
    if (image.status === 'failed') acc.failed++
    return acc
  }, {
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
    public: 0
  })

  // Get public count separately
  const { count: publicCount } = await supabase
    .from('generated_images')
    .select('*', { count: 'exact', head: true })
    .eq('is_public', true)

  stats.public = publicCount || 0

  return stats
}

// Delete image with R2 cleanup
export async function deleteImageWithCleanup(imageId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    // 首先获取图片信息，包括R2 key
    const { data: image, error: fetchError } = await supabase
      .from('generated_images')
      .select('r2_key')
      .eq('id', imageId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching image for deletion:', fetchError)
      return false
    }

    // 从数据库删除记录
    const { error: deleteError } = await supabase
      .from('generated_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Error deleting image from database:', deleteError)
      return false
    }

    // 如果有R2 key，从R2删除文件
    if (image?.r2_key) {
      console.log(`🗑️ Cleaning up R2 file: ${image.r2_key}`)
      const r2Result = await deleteFromR2(image.r2_key)
      if (!r2Result.success) {
        console.warn(`⚠️ Failed to delete R2 file ${image.r2_key}:`, r2Result.error)
        // 即使R2删除失败，也继续完成操作，避免数据不一致
      } else {
        console.log(`✅ R2 file deleted successfully: ${image.r2_key}`)
      }
    }

    return true
  } catch (error) {
    console.error('Error in deleteImageWithCleanup:', error)
    return false
  }
}

// Get images with R2 information for admin management
export async function getImagesWithR2Info(
  limit: number = 20,
  offset: number = 0
): Promise<GeneratedImage[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching images with R2 info:', error)
    return []
  }

  return data || []
}

// Save general image record (for upload middleware)
export async function saveImageRecord(imageData: {
  r2Key: string
  publicUrl: string
  originalUrl: string
  fileName: string
  fileSize: number
  contentType: string
  isPublic?: boolean
  userId?: string
  metadata?: Record<string, any>
}): Promise<number> {
  const supabase = await createClient()
  
  const insertData = {
    user_id: imageData.userId || null,
    generated_image_url: imageData.publicUrl,
    original_url: imageData.originalUrl,
    style: 'uploaded', // 默认样式
    prompt: imageData.metadata?.originalPrompt || '',
    is_public: imageData.isPublic || false,
    r2_key: imageData.r2Key,
    status: 'completed',
    metadata: {
      fileName: imageData.fileName,
      fileSize: imageData.fileSize,
      contentType: imageData.contentType,
      uploadedAt: new Date().toISOString(),
      ...imageData.metadata
    }
  }
  
  console.log('🔍 Saving image record:', insertData)
  
  const { data, error } = await supabase
    .from('generated_images')
    .insert(insertData)
    .select('id')
    .single()

  if (error) {
    console.error('❌ Failed to save image record:', error)
    throw new Error(`Failed to save image record: ${error.message}`)
  }
  
  console.log('✅ Image record saved with ID:', data.id)
  return data.id
} 