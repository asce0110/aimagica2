import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 安全的环境变量检查，避免构建时错误
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 只有在环境变量存在时才创建客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null

// Server-side client factory function
export async function createClient() {
  // 在运行时检查环境变量
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured')
  }
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    // Use service role key on server side to bypass RLS when needed
    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'wizard'
          subscription_status: 'active' | 'canceled' | 'expired'
          subscription_end_date: string | null
          google_id: string | null
          created_at: string
          updated_at: string
          daily_render_count: number
          daily_rerender_count: number
          last_reset_date: string
        }
        Insert: {
          id?: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'wizard'
          subscription_status?: 'active' | 'canceled' | 'expired'
          subscription_end_date?: string | null
          google_id?: string | null
          created_at?: string
          updated_at?: string
          daily_render_count?: number
          daily_rerender_count?: number
          last_reset_date?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'wizard'
          subscription_status?: 'active' | 'canceled' | 'expired'
          subscription_end_date?: string | null
          google_id?: string | null
          created_at?: string
          updated_at?: string
          daily_render_count?: number
          daily_rerender_count?: number
          last_reset_date?: string
        }
      }
      generated_images: {
        Row: {
          id: string
          user_id: string
          original_sketch_url: string | null
          generated_image_url: string
          style: string
          prompt: string | null
          render_time_seconds: number | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          is_public: boolean
          likes_count: number
          view_count: number
          r2_key: string | null
          original_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_sketch_url?: string | null
          generated_image_url: string
          style: string
          prompt?: string | null
          render_time_seconds?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          is_public?: boolean
          likes_count?: number
          view_count?: number
          r2_key?: string | null
          original_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_sketch_url?: string | null
          generated_image_url?: string
          style?: string
          prompt?: string | null
          render_time_seconds?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          is_public?: boolean
          likes_count?: number
          view_count?: number
          r2_key?: string | null
          original_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          plan_price: number
          billing_cycle: 'monthly' | 'yearly'
          status: 'active' | 'canceled' | 'expired' | 'past_due'
          current_period_start: string
          current_period_end: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_name: string
          plan_price: number
          billing_cycle: 'monthly' | 'yearly'
          status?: 'active' | 'canceled' | 'expired' | 'past_due'
          current_period_start: string
          current_period_end: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_name?: string
          plan_price?: number
          billing_cycle?: 'monthly' | 'yearly'
          status?: 'active' | 'canceled' | 'expired' | 'past_due'
          current_period_start?: string
          current_period_end?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      image_likes: {
        Row: {
          id: string
          user_id: string
          image_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          created_at?: string
        }
      }
      image_comments: {
        Row: {
          id: string
          user_id: string
          image_id: string
          content: string
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          content: string
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          content?: string
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          user_id: string
          comment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          comment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          comment_id?: string
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_renders: number
          total_rerenders: number
          total_downloads: number
          last_active: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_renders?: number
          total_rerenders?: number
          total_downloads?: number
          last_active: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_renders?: number
          total_rerenders?: number
          total_downloads?: number
          last_active?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'pro' | 'wizard'
      subscription_status: 'active' | 'canceled' | 'expired' | 'past_due'
      image_status: 'pending' | 'processing' | 'completed' | 'failed'
      billing_cycle: 'monthly' | 'yearly'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T] 