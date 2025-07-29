import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * 精选图片API - 获取社区精选的优秀AI生成作品
 */
export async function GET() {
  try {
    console.log('🌟 Featured images API called')
    
    // 默认参数（静态导出时不能使用request.url）
    const limit = 12
    
    // 创建Supabase客户端
    const supabase = await createClient()
    
    // 查询精选图片
    const { data: images, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('is_public', true)
      .eq('is_featured', true)
      .order('featured_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('❌ Failed to fetch featured images:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch featured images',
        data: []
      }, { status: 500 })
    }
    
    console.log(`✅ Successfully fetched ${images?.length || 0} featured images`)
    
    // 处理图片数据
    const processedImages = (images || []).map(image => ({
      id: image.id.toString(),
      title: image.title || `AI Generated Image`,
      prompt: image.prompt || '',
      url: image.generated_image_url || '',
      originalUrl: image.original_url || image.generated_image_url || '',
      image_url: image.generated_image_url || '',
      style: image.style || 'Default',
      created_at: image.created_at,
      featured_at: image.featured_at
    }))
    
    return NextResponse.json({
      success: true,
      count: processedImages.length,
      data: processedImages
    })
    
  } catch (error) {
    console.error('❌ Featured images API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 })
  }
}