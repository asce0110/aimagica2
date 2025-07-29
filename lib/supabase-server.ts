import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './supabase'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // 在构建时返回一个假的客户端，在运行时抛出错误
    if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)) {
      throw new Error('Supabase environment variables are not configured')
    }
    // 构建时使用占位符
    const placeholderUrl = supabaseUrl || 'https://placeholder.supabase.co'
    const placeholderKey = supabaseAnonKey || 'placeholder-key'
    
    const cookieStore = await cookies()
    return createServerClient<Database>(
      placeholderUrl,
      placeholderKey,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      }
    )
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// 创建一个使用 service role key 的客户端，用于绕过 RLS 策略
export async function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    // 在构建时返回一个假的客户端，在运行时抛出错误
    if (process.env.NODE_ENV === 'production' && !serviceRoleKey) {
      throw new Error('Supabase environment variables are not configured')
    }
    // 构建时使用占位符
    const placeholderUrl = supabaseUrl || 'https://placeholder.supabase.co'
    const placeholderKey = serviceRoleKey || 'placeholder-key'
    
    const cookieStore = await cookies()
    return createServerClient<Database>(
      placeholderUrl,
      placeholderKey,
      {
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {},
        },
      }
    )
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Service role doesn't need session management
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Service role doesn't need session management
          }
        },
      },
    }
  )
}

// 优化版本：快速创建服务角色客户端，不处理cookies（仅用于API路由）
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createFastServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    // 在构建时返回一个假的客户端，在运行时抛出错误
    if (process.env.NODE_ENV === 'production' && !serviceRoleKey) {
      throw new Error('Supabase environment variables are not configured')
    }
    // 构建时使用占位符
    const placeholderUrl = supabaseUrl || 'https://placeholder.supabase.co'
    const placeholderKey = serviceRoleKey || 'placeholder-key'
    
    return createSupabaseClient<Database>(
      placeholderUrl,
      placeholderKey
    )
  }

  return createSupabaseClient<Database>(
    supabaseUrl,
    serviceRoleKey
  )
} 