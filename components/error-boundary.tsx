'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 如果是stagewise相关错误，静默处理
    if (error.message?.includes('stagewise') || 
        error.message?.includes('Max reconnection attempts reached')) {
      console.warn('🔧 Stagewise error caught by boundary:', error.message)
      return { hasError: true, error }
    }
    
    // 其他错误正常处理
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 如果是stagewise错误，只在开发环境记录
    if (error.message?.includes('stagewise') || 
        error.message?.includes('Max reconnection attempts reached')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔧 Stagewise component error (non-critical):', error, errorInfo)
      }
      return
    }
    
    // 其他错误正常记录
    console.error('❌ Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // 如果是stagewise错误，不显示任何内容
      if (this.state.error?.message?.includes('stagewise') || 
          this.state.error?.message?.includes('Max reconnection attempts reached')) {
        return null
      }
      
      // 其他错误显示fallback UI
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">Something went wrong. Please refresh the page.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 