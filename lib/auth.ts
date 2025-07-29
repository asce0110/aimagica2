/**
 * 前端OAuth客户端 - 使用Pages Functions
 */
import React from 'react'

export interface User {
  id: string
  email: string
  name: string
  picture: string
  isAdmin?: boolean
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

/**
 * 启动Google OAuth登录
 */
export function signIn() {
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/google'
  }
}

/**
 * 登出用户
 */
export function signOut() {
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/logout'
  }
}

/**
 * UTF-8安全的base64解码函数（对应后端的utf8ToBase64）
 */
function base64ToUtf8(str: string): string {
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

/**
 * 从Cookie获取用户信息（客户端读取）
 */
export function getUserFromCookie(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cookies = document.cookie.split(';')
    const userInfoCookie = cookies.find(c => c.trim().startsWith('user-info='))
    
    if (!userInfoCookie) return null
    
    const userInfoStr = userInfoCookie.split('=')[1]
    // 使用UTF-8安全解码，对应后端的utf8ToBase64编码
    const userInfo = JSON.parse(base64ToUtf8(userInfoStr))
    
    return userInfo
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * 检查是否已认证
 */
export function isAuthenticated(): boolean {
  return getUserFromCookie() !== null
}

/**
 * 获取当前用户信息（通过API验证）
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/user', {
      credentials: 'include'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.user
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * React Hook for authentication
 */
export function useAuth(): AuthState {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })
  
  React.useEffect(() => {
    const checkAuth = async () => {
      // 先从Cookie快速获取用户信息
      const cookieUser = getUserFromCookie()
      
      if (cookieUser) {
        setState({
          user: cookieUser,
          isLoading: false,
          isAuthenticated: true
        })
        
        // 后台验证Token有效性
        const apiUser = await getCurrentUser()
        if (!apiUser) {
          // Token无效，清除状态
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }
    
    checkAuth()
  }, [])
  
  return state
}

// 检查登录状态变化
export function checkLoginStatus() {
  if (typeof window === 'undefined') return
  
  const urlParams = new URLSearchParams(window.location.search)
  const loginStatus = urlParams.get('login')
  const error = urlParams.get('error')
  
  if (loginStatus === 'success') {
    // 登录成功，清除URL参数
    const newUrl = window.location.pathname
    window.history.replaceState({}, '', newUrl)
    window.location.reload() // 刷新页面加载用户信息
  } else if (error) {
    console.error('登录错误:', error)
    // 可以显示错误提示
    alert(`登录失败: ${error}`)
    // 清除URL参数
    const newUrl = window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }
}