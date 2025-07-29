"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GoogleAuthPage() {
  const router = useRouter()

  useEffect(() => {
    // 在静态部署中，直接构建Google OAuth URL
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = `${window.location.origin}/auth/callback`
    
    if (!clientId) {
      console.error('Google Client ID not configured')
      router.push('/?error=oauth_not_configured')
      return
    }
    
    // 生成state参数
    const state = crypto.randomUUID()
    sessionStorage.setItem('oauth_state', state)
    
    // 构建Google OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'openid email profile')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')
    
    console.log('🚀 启动Google OAuth (静态版本):', {
      clientId: clientId.substring(0, 20) + '...',
      redirectUri,
      state
    })
    
    // 重定向到Google OAuth
    window.location.href = authUrl.toString()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1e8]">
      <div className="text-center">
        <div className="text-6xl mb-4">🔄</div>
        <h1 className="text-2xl font-bold text-[#2d3e2d] mb-2">
          Redirecting to Google...
        </h1>
        <p className="text-[#8b7355]">
          Please wait while we redirect you to Google for authentication.
        </p>
      </div>
    </div>
  )
}