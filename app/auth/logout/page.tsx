"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // 清理本地存储
        sessionStorage.clear()
        localStorage.clear()
        
        // 清理cookies（如果有的话）
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=")
          const name = eqPos > -1 ? c.substr(0, eqPos) : c
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        })
        
        console.log('🚪 User logged out successfully')
        
        // 重定向到主页
        setTimeout(() => {
          router.push('/?message=logged_out')
        }, 1500)
        
      } catch (error) {
        console.error('Logout error:', error)
        // 即使出错也重定向到主页
        router.push('/')
      }
    }
    
    handleLogout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f1e8]">
      <div className="text-center">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-2xl font-bold text-[#2d3e2d] mb-2">
          Logging you out...
        </h1>
        <p className="text-[#8b7355]">
          Please wait while we log you out securely.
        </p>
        <div className="mt-4 animate-pulse">
          <div className="w-8 h-8 bg-[#d4a574] rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  )
}