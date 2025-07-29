import { supabase } from '@/lib/supabase'

// 风格数据类型
export interface StyleModel {
  id: string
  name: string
  description: string
  emoji: string
  image_url: string
  prompt_template: string
  default_prompt?: string | null
  type: 'image' | 'video' | 'both'
  category: 'photographic-realism' | 'illustration-digital-painting' | 'anime-comics' | 'concept-art' | '3d-render' | 'abstract' | 'fine-art-movements' | 'technical-scientific' | 'architecture-interior' | 'design-commercial' | 'genre-driven' | 'vintage-retro'
  is_premium: boolean
  is_active: boolean
  sort_order: number
  // 新增的限制条件字段
  requires_image_upload?: boolean
  requires_prompt_description?: boolean
  prohibits_image_upload?: boolean // 新增：禁止图片上传（用于纯文本风格）
  min_prompt_length?: number
  max_prompt_length?: number
  allowed_image_formats?: string[]
  requirements_description?: string | null
  created_at: string
  updated_at: string
}

/**
 * 获取所有风格
 */
export async function getAllStyles(type?: 'image' | 'video' | 'both'): Promise<StyleModel[]> {
  try {
    console.log('🔍 getAllStyles called with type:', type)
    
    let query = supabase
      .from('styles')
      .select(`
        id,
        name,
        description,
        emoji,
        image_url,
        prompt_template,
        default_prompt,
        type,
        category,
        is_premium,
        is_active,
        sort_order,
        requires_image_upload,
        requires_prompt_description,
        prohibits_image_upload,
        min_prompt_length,
        max_prompt_length,
        allowed_image_formats,
        requirements_description,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (type) {
      query = query.or(`type.eq.${type},type.eq.both`)
    }

    console.log('📊 Executing query...')
    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching styles:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return []
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} styles`)
    return data || []
  } catch (error) {
    console.error('❌ Error in getAllStyles:', error)
    console.error('Error details:', error)
    return []
  }
}

/**
 * 获取单个风格详情
 */
export async function getStyleById(id: string): Promise<StyleModel | null> {
  try {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching style:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getStyleById:', error)
    return null
  }
}

/**
 * 创建新风格
 */
export async function createStyle(styleData: Omit<StyleModel, 'id' | 'created_at' | 'updated_at'>): Promise<StyleModel | null> {
  try {
    const { data, error } = await supabase
      .from('styles')
      .insert(styleData)
      .select()
      .single()

    if (error) {
      console.error('Error creating style:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createStyle:', error)
    return null
  }
}

/**
 * 更新风格
 */
export async function updateStyle(id: string, updates: Partial<StyleModel>): Promise<StyleModel | null> {
  try {
    const { data, error } = await supabase
      .from('styles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating style:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateStyle:', error)
    return null
  }
}

/**
 * 删除风格（软删除）
 */
export async function deleteStyle(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('styles')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting style:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteStyle:', error)
    return false
  }
}

/**
 * 管理员获取所有风格（包括非活跃的）
 */
export async function getAllStylesForAdmin(): Promise<StyleModel[]> {
  try {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching admin styles:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllStylesForAdmin:', error)
    return []
  }
}

/**
 * 更新风格排序
 */
export async function updateStylesOrder(styles: { id: string; sort_order: number }[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('styles')
      .upsert(
        styles.map(style => ({
          id: style.id,
          sort_order: style.sort_order,
          updated_at: new Date().toISOString()
        }))
      )

    if (error) {
      console.error('Error updating styles order:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateStylesOrder:', error)
    return false
  }
}

/**
 * 验证风格使用要求
 */
export interface StyleValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateStyleRequirements(
  style: StyleModel,
  prompt: string,
  hasUploadedImage: boolean,
  imageFormat?: string
): StyleValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 检查是否禁止上传图片
  if (style.prohibits_image_upload && hasUploadedImage) {
    errors.push(`${style.name} style does not support image upload. This is a text-only style.`)
  }

  // 检查是否需要上传图片
  if (style.requires_image_upload && !hasUploadedImage) {
    errors.push(`${style.name} style requires uploading a reference image to generate.`)
  }

  // 检查是否需要提示词描述
  if (style.requires_prompt_description && (!prompt || prompt.trim().length === 0)) {
    errors.push(`${style.name} style requires a description prompt.`)
  }

  // 检查提示词长度
  if (style.min_prompt_length && prompt.length < style.min_prompt_length) {
    errors.push(`Description must be at least ${style.min_prompt_length} characters long. Current: ${prompt.length} characters.`)
  }

  if (style.max_prompt_length && prompt.length > style.max_prompt_length) {
    errors.push(`Description cannot exceed ${style.max_prompt_length} characters. Current: ${prompt.length} characters.`)
  }

  // 检查图片格式
  if (hasUploadedImage && imageFormat && style.allowed_image_formats) {
    const normalizedFormat = imageFormat.toLowerCase().replace('.', '')
    if (!style.allowed_image_formats.includes(normalizedFormat)) {
      errors.push(`Unsupported image format: ${imageFormat}. Supported formats: ${style.allowed_image_formats.join(', ')}.`)
    }
  }

  // 添加建议性警告
  if (style.requires_image_upload && hasUploadedImage) {
    warnings.push('Image uploaded successfully! AI will create based on your image.')
  }

  if (prompt.length < 10 && !style.min_prompt_length) {
    warnings.push('For better results, consider providing a more detailed description.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 获取风格的要求描述
 */
export function getStyleRequirementsText(style: StyleModel): string {
  const requirements: string[] = []

  if (style.requires_image_upload) {
    requirements.push('📸 需要上传参考图片')
  }

  if (style.requires_prompt_description) {
    requirements.push('✍️ 需要输入描述')
  }

  if (style.min_prompt_length && style.min_prompt_length > 0) {
    requirements.push(`📝 描述至少 ${style.min_prompt_length} 个字符`)
  }

  if (style.allowed_image_formats && style.allowed_image_formats.length > 0) {
    requirements.push(`🖼️ 支持格式：${style.allowed_image_formats.join(', ')}`)
  }

  return requirements.length > 0 ? requirements.join(' • ') : ''
} 