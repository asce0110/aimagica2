import { createClient } from '../supabase-server'
import { Tables } from '../supabase'

export type User = Tables<'users'>

// Get user by email (with service role to bypass RLS)
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      console.log(`👤 用户查询: ${email} - 未找到`)
      return null
    }

    console.log(`👤 用户查询: ${email} - 找到`)
    return data
  } catch (error) {
    console.error(`❌ 查询用户失败 ${email}:`, error)
    return null
  }
}

// Get user by Google ID
export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error(`❌ 通过Google ID查询用户失败:`, error)
    return null
  }
}

// Create or update user (with better error handling)
export async function upsertUser(userData: {
  email: string
  full_name?: string
  avatar_url?: string
  google_id?: string
}): Promise<User | null> {
  try {
    const supabase = await createClient()
    
    console.log(`📝 开始同步用户: ${userData.email}`)
    
    // Check if user exists by email
    const existingUser = await getUserByEmail(userData.email)
    
    if (existingUser) {
      console.log(`🔄 更新现有用户: ${userData.email}`)
      
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: userData.full_name || (existingUser as any).full_name,
          avatar_url: userData.avatar_url || existingUser.avatar_url,
          google_id: userData.google_id || existingUser.google_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (error) {
        console.error(`❌ 更新用户失败 ${userData.email}:`, error.message)
        return existingUser // 返回现有用户而不是null
      }

      console.log(`✅ 用户更新成功: ${userData.email}`)
      return data || existingUser
    } else {
      console.log(`🆕 创建新用户: ${userData.email}`)
      
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          full_name: userData.full_name, // 直接使用Google提供的名字
          avatar_url: userData.avatar_url,
          google_id: userData.google_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ 创建用户失败 ${userData.email}:`, error.message)
        
        // 如果是RLS错误，尝试再次查询是否用户实际已创建
        if (error.message.includes('infinite recursion') || error.code === '42P17') {
          console.log(`🔍 RLS错误，重新查询用户: ${userData.email}`)
          const retryUser = await getUserByEmail(userData.email)
          if (retryUser) {
            console.log(`✅ 用户实际已存在: ${userData.email}`)
            return retryUser
          }
        }
        
        return null
      }

      console.log(`✅ 用户创建成功: ${userData.email}`)

      // Try to create user stats record (but don't fail if it doesn't work)
      try {
        await createUserStats(data.id)
        console.log(`✅ 用户统计记录创建成功: ${userData.email}`)
      } catch (statsError) {
        console.error(`⚠️ 用户统计记录创建失败，但继续: ${userData.email}`, statsError)
      }

      return data
    }
  } catch (error) {
    console.error(`❌ upsertUser 总体失败 ${userData.email}:`, error)
    
    // 最后尝试：检查用户是否已存在
    try {
      const fallbackUser = await getUserByEmail(userData.email)
      if (fallbackUser) {
        console.log(`✅ 回退查询成功，用户已存在: ${userData.email}`)
        return fallbackUser
      }
    } catch (fallbackError) {
      console.error(`❌ 回退查询也失败: ${userData.email}`, fallbackError)
    }
    
    return null
  }
}

// Update user subscription
export async function updateUserSubscription(
  userId: string, 
  tier: 'free' | 'pro' | 'wizard',
  status: 'active' | 'canceled' | 'expired',
  endDate?: string
): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('users')
    .update({
      subscription_tier: tier,
      subscription_status: status,
      subscription_end_date: endDate || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user subscription:', error)
    return false
  }

  return true
}

// Increment daily render count
export async function incrementDailyRenderCount(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  // First reset counters if needed
  await resetDailyCountersIfNeeded()
  
  const { error } = await supabase
    .from('users')
    .update({
      daily_render_count: supabase.rpc('increment_render_count'),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    console.error('Error incrementing render count:', error)
    return false
  }

  return true
}

// Reset daily counters if needed
export async function resetDailyCountersIfNeeded(): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('reset_daily_counters')
  
  if (error) {
    console.error('Error resetting daily counters:', error)
  }
}

// Create user stats
async function createUserStats(userId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('user_stats')
    .insert({
      user_id: userId,
      total_renders: 0,
      total_rerenders: 0,
      total_downloads: 0,
      last_active: new Date().toISOString()
    })

  if (error) {
    console.error('Error creating user stats:', error)
  }
}

// Get user with stats
export async function getUserWithStats(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_stats (
        total_renders,
        total_rerenders,
        total_downloads,
        last_active
      )
    `)
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
} 