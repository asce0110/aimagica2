'use client'

import { useEffect, useState } from 'react'

export default function StagewiseWrapper() {
  const [showToolbar, setShowToolbar] = useState(false)

  useEffect(() => {
    // 只在开发环境显示
    if (process.env.NODE_ENV === 'development') {
      setShowToolbar(true)
    }
  }, [])

  // 在生产环境或Vercel部署中不显示任何内容
  if (!showToolbar || process.env.VERCEL) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white px-3 py-1 rounded text-sm">
      🔧 Dev Mode
    </div>
  )
} 