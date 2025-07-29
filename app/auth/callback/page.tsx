"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')
        
        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }
        
        if (!code || !state) {
          throw new Error('Missing authorization code or state')
        }
        
        // 验证state参数
        const storedState = sessionStorage.getItem('oauth_state')
        if (state !== storedState) {
          throw new Error('Invalid state parameter')
        }
        
        setMessage('Exchanging code for tokens...')
        
        // 注意：在静态部署中，我们需要调用后端API来处理token交换
        // 这里我们重定向到主页，实际项目中应该调用后端API
        
        setStatus('success')
        setMessage('Authentication successful! Redirecting...')
        
        // 清理状态
        sessionStorage.removeItem('oauth_state')
        
        // 重定向到主页
        setTimeout(() => {
          router.push('/')
        }, 2000)
        
      } catch (error) {
        console.error('Authentication error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Authentication failed')
        
        // 5秒后重定向到主页
        setTimeout(() => {
          router.push('/?error=auth_failed')
        }, 5000)
      }
    }
    
    handleCallback()
  }, [searchParams, router])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading': return '🔄'
      case 'success': return '✅'
      case 'error': return '❌'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'text-[#8b7355]'
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1e8]">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-6xl mb-4">{getStatusIcon()}</div>
        <h1 className="text-2xl font-bold text-[#2d3e2d] mb-4">
          Google Authentication
        </h1>
        <p className={`text-lg mb-4 ${getStatusColor()}`}>
          {message}
        </p>
        {status === 'loading' && (
          <div className="animate-pulse text-[#8b7355]">
            Please wait...
          </div>
        )}
        {status === 'error' && (
          <div className="text-sm text-[#8b7355]">
            You will be redirected to the homepage in a few seconds.
          </div>
        )}
      </div>
    </div>
  )
}