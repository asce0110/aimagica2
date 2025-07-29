"use client"

import { useEffect } from 'react'

interface PerformanceMetrics {
  imageLoadTime: number
  totalImages: number
  failedImages: number
  cacheHitRate: number
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // 监控图片加载性能
    const imageObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        if (entry.entryType === 'resource' && entry.name.match(/\.(jpg|jpeg|png|webp|avif|svg)$/i)) {
          const loadTime = (entry as any).responseEnd - entry.startTime
          console.log(`📊 Image loaded: ${entry.name.split('/').pop()} in ${loadTime.toFixed(2)}ms`)
          
          // 记录到性能指标
          recordImageMetric(entry.name, loadTime)
        }
      })
    })

    // 监控LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      if (lastEntry) {
        console.log(`🎯 LCP: ${lastEntry.startTime.toFixed(2)}ms`)
        
        // 如果LCP超过2.5秒，记录警告
        if (lastEntry.startTime > 2500) {
          console.warn('⚠️ LCP is slower than recommended (>2.5s)')
        }
      }
    })

    // 监控CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      
      list.getEntries().forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      })
      
      if (clsValue > 0) {
        console.log(`📐 CLS: ${clsValue.toFixed(4)}`)
        
        // 如果CLS超过0.1，记录警告
        if (clsValue > 0.1) {
          console.warn('⚠️ CLS is higher than recommended (>0.1)')
        }
      }
    })

    // 启动观察器
    try {
      imageObserver.observe({ entryTypes: ['resource'] })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('Performance monitoring not supported:', error)
    }

    // 监控内存使用情况
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576)
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576)
        
        console.log(`💾 Memory: ${usedMB}MB / ${totalMB}MB (limit: ${limitMB}MB)`)
        
        // 如果内存使用超过80%，发出警告
        if (usedMB / limitMB > 0.8) {
          console.warn('⚠️ High memory usage detected')
        }
      }
    }

    // 每30秒检查一次内存使用情况
    const memoryInterval = setInterval(checkMemoryUsage, 30000)

    // 清理函数
    return () => {
      imageObserver.disconnect()
      lcpObserver.disconnect()
      clsObserver.disconnect()
      clearInterval(memoryInterval)
    }
  }, [])

  return null // 这是一个无UI的监控组件
}

// 记录图片加载指标
function recordImageMetric(imageName: string, loadTime: number) {
  const metrics = getPerformanceMetrics()
  
  metrics.totalImages++
  metrics.imageLoadTime = (metrics.imageLoadTime + loadTime) / 2 // 移动平均
  
  // 保存到localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('aimagica_performance_metrics', JSON.stringify(metrics))
  }
}

// 获取性能指标
function getPerformanceMetrics(): PerformanceMetrics {
  if (typeof window === 'undefined') {
    return { imageLoadTime: 0, totalImages: 0, failedImages: 0, cacheHitRate: 0 }
  }

  const stored = localStorage.getItem('aimagica_performance_metrics')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // 如果解析失败，返回默认值
    }
  }

  return { imageLoadTime: 0, totalImages: 0, failedImages: 0, cacheHitRate: 0 }
}

// 导出性能指标获取函数
export function getImagePerformanceReport(): PerformanceMetrics {
  return getPerformanceMetrics()
}

// 重置性能指标
export function resetPerformanceMetrics(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aimagica_performance_metrics')
  }
} 