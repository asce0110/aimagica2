import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('🖼️ 获取图片列表')
    
    // 创建Supabase客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Supabase环境变量未配置')
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        images: []
      })
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    try {
      // 查询生成的图片，获取基本信息
      const { data: images, error: imagesError } = await supabase
        .from('generated_images')
        .select(`
          id,
          prompt,
          image_url,
          style,
          status,
          view_count,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (imagesError) {
        console.error('❌ 查询图片失败:', imagesError)
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch images',
          images: []
        })
      }

      // 为每个图片获取用户信息和点赞统计
      const imagesWithStats = await Promise.all(
        (images || []).map(async (image) => {
          try {
            // 获取用户信息
            const { data: user } = await supabase
              .from('users')
              .select('full_name, email')
              .eq('id', image.user_id)
              .single()

            // 获取点赞数
            const { count: likeCount } = await supabase
              .from('image_likes')
              .select('*', { count: 'exact', head: true })
              .eq('image_id', image.id)

            return {
              id: image.id,
              title: image.prompt?.substring(0, 30) + '...' || 'Untitled',
              user_name: user?.full_name || user?.email || 'Anonymous',
              created_at: image.created_at,
              view_count: image.view_count || 0,
              like_count: likeCount || 0,
              style: image.style || 'Unknown',
              status: image.status || 'pending',
              image_url: image.image_url,
              prompt: image.prompt
            }
          } catch (error) {
            console.error(`❌ 获取图片 ${image.id} 统计失败:`, error)
            return {
              id: image.id,
              title: image.prompt?.substring(0, 30) + '...' || 'Untitled',
              user_name: 'Anonymous',
              created_at: image.created_at,
              view_count: image.view_count || 0,
              like_count: 0,
              style: image.style || 'Unknown',
              status: image.status || 'pending',
              image_url: image.image_url,
              prompt: image.prompt
            }
          }
        })
      )

      console.log(`✅ 成功获取 ${imagesWithStats.length} 张图片`)

      return NextResponse.json({
        success: true,
        images: imagesWithStats,
        timestamp: new Date().toISOString()
      })

    } catch (dbError) {
      console.error("❌ 数据库查询失败:", dbError)
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        images: []
      })
    }

  } catch (error) {
    console.error('❌ 获取图片列表失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch images',
      message: error.message
    }, { status: 500 })
  }
}