import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * 前端样式API - 为用户界面提供样式数据
 * 支持类型过滤和活跃状态过滤
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🎨 Frontend styles API called')
    
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // image, video, both
    const category = searchParams.get('category')
    const includeInactive = searchParams.get('include_inactive') === 'true'
    
    console.log('📋 Query parameters:', { type, category, includeInactive })
    
    // 创建Supabase客户端
    const supabase = await createClient()
    
    // 构建查询
    let query = supabase
      .from('styles')
      .select('*')
      .order('sort_order', { ascending: true })
    
    // 默认只返回活跃的样式（除非明确要求包含非活跃的）
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }
    
    // 类型过滤
    if (type) {
      query = query.or(`type.eq.${type},type.eq.both`)
    }
    
    // 分类过滤
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data: styles, error } = await query
    
    if (error) {
      console.error('❌ Failed to fetch styles:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch styles',
        styles: []
      }, { status: 500 })
    }
    
    console.log(`✅ Successfully fetched ${styles?.length || 0} styles`)
    
    // 处理图片URL，确保在Cloudflare环境下正常工作
    const processedStyles = styles?.map(style => ({
      ...style,
      // 确保图片URL是完整的
      image_url: style.image_url?.startsWith('http') 
        ? style.image_url 
        : style.image_url 
          ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aimagica.ai'}${style.image_url}`
          : null
    })) || []
    
    return NextResponse.json({
      success: true,
      count: processedStyles.length,
      styles: processedStyles,
      metadata: {
        total: processedStyles.length,
        filtered_by: {
          type: type || 'all',
          category: category || 'all',
          active_only: !includeInactive
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Styles API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      styles: []
    }, { status: 500 })
  }
}

/**
 * 获取单个样式的详细信息
 */
export async function POST(request: NextRequest) {
  try {
    const { styleId } = await request.json()
    
    if (!styleId) {
      return NextResponse.json({
        success: false,
        error: 'Style ID is required'
      }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    const { data: style, error } = await supabase
      .from('styles')
      .select('*')
      .eq('id', styleId)
      .eq('is_active', true)
      .single()
    
    if (error) {
      console.error('❌ Failed to fetch style:', error)
      return NextResponse.json({
        success: false,
        error: 'Style not found',
        style: null
      }, { status: 404 })
    }
    
    // 处理图片URL
    const processedStyle = {
      ...style,
      image_url: style.image_url?.startsWith('http') 
        ? style.image_url 
        : style.image_url 
          ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://aimagica.ai'}${style.image_url}`
          : null
    }
    
    return NextResponse.json({
      success: true,
      style: processedStyle
    })
    
  } catch (error) {
    console.error('❌ Style detail API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}