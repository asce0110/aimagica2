import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('👥 获取用户列表')
    
    // 创建Supabase客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Supabase环境变量未配置')
      return NextResponse.json({
        success: false,
        error: 'Database not configured',
        users: []
      })
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    try {
      // 查询用户列表，包含基本信息
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (usersError) {
        console.error('❌ 查询用户失败:', usersError)
        return NextResponse.json({ 
          success: false,
          error: 'Failed to fetch users',
          users: [] 
        })
      }

      // 为每个用户获取订阅信息和图片统计
      const usersWithStats = await Promise.all(
        (users || []).map(async (user) => {
          try {
            // 获取订阅信息
            const { data: subscription } = await supabase
              .from('user_subscriptions')
              .select('subscription_tier, subscription_status')
              .eq('user_id', user.id)
              .single()

            // 获取图片数量
            const { count: imageCount } = await supabase
              .from('generated_images')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)

            return {
              id: user.id,
              full_name: user.full_name || 'Anonymous User',
              email: user.email,
              avatar_url: user.avatar_url,
              created_at: user.created_at,
              subscription_tier: subscription?.subscription_tier || 'free',
              subscription_status: subscription?.subscription_status || 'inactive',
              image_count: imageCount || 0
            }
          } catch (error) {
            console.error(`❌ 获取用户 ${user.id} 统计失败:`, error)
            return {
              id: user.id,
              full_name: user.full_name || 'Anonymous User',
              email: user.email,
              avatar_url: user.avatar_url,
              created_at: user.created_at,
              subscription_tier: 'free',
              subscription_status: 'inactive',
              image_count: 0
            }
          }
        })
      )

      console.log(`✅ 成功获取 ${usersWithStats.length} 个用户`)

      return NextResponse.json({
        success: true,
        users: usersWithStats,
        timestamp: new Date().toISOString()
      })

    } catch (dbError) {
      console.error("❌ 数据库查询失败:", dbError)
      return NextResponse.json({ 
        success: false,
        error: 'Database query failed',
        users: [] 
      })
    }
    
  } catch (error) {
    console.error("❌ 获取用户列表失败:", error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch users',
      users: []
    }, { status: 500 })
  }
}