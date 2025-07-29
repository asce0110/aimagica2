"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Wand2 } from "lucide-react"

export interface WaterfallItem {
  id: string | number
  url: string
  title: string
  height?: number
  aspectRatio?: number
  [key: string]: any
}

interface VirtualWaterfallProps {
  items: WaterfallItem[]
  columns?: number
  gap?: number
  itemMinWidth?: number
  renderItem: (item: WaterfallItem, index: number) => React.ReactNode
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  className?: string
  // SEO优化：首屏渲染数量
  initialRenderCount?: number
  // 虚拟滚动优化
  overscan?: number
}

/**
 * 高性能虚拟瀑布流组件
 * 
 * 特性：
 * 1. 虚拟滚动 - 只渲染可见区域的元素
 * 2. 懒加载 - 图片进入视口才开始加载
 * 3. 动态列数 - 响应式布局
 * 4. SEO友好 - 首屏内容直接渲染
 * 5. 分页加载 - Load More机制
 */
export default function VirtualWaterfall({
  items,
  columns = 4,
  gap = 16,
  itemMinWidth = 250,
  renderItem,
  onLoadMore,
  hasMore = false,
  loading = false,
  className = "",
  initialRenderCount = 12,
  overscan = 5
}: VirtualWaterfallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [itemHeights, setItemHeights] = useState<Map<string | number, number>>(new Map())
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: initialRenderCount })
  const [isInitialRender, setIsInitialRender] = useState(true)

  // 响应式列数计算 - 优先使用传入的columns设置
  const actualColumns = useMemo(() => {
    if (!containerWidth) return columns
    
    // 如果是明确的移动端设置（2列），直接使用
    if (columns <= 2) return columns
    
    // 桌面端才进行动态计算
    const maxColumns = Math.floor(containerWidth / (itemMinWidth + gap))
    return Math.max(1, Math.min(columns, maxColumns))
  }, [containerWidth, columns, itemMinWidth, gap])

  // 计算列布局
  const columnLayout = useMemo(() => {
    const columnWidth = (containerWidth - gap * (actualColumns - 1)) / actualColumns
    const columnHeights = new Array(actualColumns).fill(0)
    const positions: Array<{ left: number; top: number; width: number; height: number; column: number }> = []

    items.forEach((item, index) => {
      // 找到最短的列
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
      
      // 获取缓存的高度或使用默认值
      const itemHeight = itemHeights.get(item.id) || (item.height || 300)
      
      positions.push({
        left: shortestColumnIndex * (columnWidth + gap),
        top: columnHeights[shortestColumnIndex],
        width: columnWidth,
        height: itemHeight,
        column: shortestColumnIndex
      })

      columnHeights[shortestColumnIndex] += itemHeight + gap
    })

    const totalHeight = Math.max(...columnHeights)

    return {
      positions,
      totalHeight,
      columnWidth
    }
  }, [items, actualColumns, containerWidth, gap, itemHeights])

  // 计算可见范围
  useEffect(() => {
    if (!columnLayout.positions.length || isInitialRender) return

    const viewportTop = scrollTop
    const viewportBottom = scrollTop + containerHeight

    let start = columnLayout.positions.length
    let end = 0

    columnLayout.positions.forEach((pos, index) => {
      const itemTop = pos.top
      const itemBottom = pos.top + pos.height

      if (itemBottom >= viewportTop - overscan * pos.height && itemTop <= viewportBottom + overscan * pos.height) {
        start = Math.min(start, index)
        end = Math.max(end, index + 1)
      }
    })

    // 确保至少渲染一些项目
    start = Math.max(0, start)
    end = Math.min(items.length, Math.max(end, start + 1))

    setVisibleRange({ start, end })
  }, [scrollTop, containerHeight, columnLayout.positions, overscan, isInitialRender])

  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerWidth(entry.contentRect.width)
        setContainerHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollTop(window.scrollY)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 项目高度更新回调 - 实时更新布局
  const updateItemHeight = useCallback((itemId: string | number, height: number) => {
    setItemHeights(prev => {
      const newMap = new Map(prev)
      const oldHeight = prev.get(itemId)
      
      // 只有高度真正变化时才更新
      if (oldHeight !== height && height > 0) {
        newMap.set(itemId, height)
        return newMap
      }
      return prev
    })
  }, [])

  // 初始渲染完成后启用虚拟滚动
  useEffect(() => {
    if (isInitialRender && items.length > 0) {
      const timer = setTimeout(() => {
        setIsInitialRender(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [items.length, isInitialRender])

  // 无限滚动检测
  useEffect(() => {
    if (!onLoadMore || !hasMore || loading) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      
      // 当滚动到底部附近时加载更多
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        onLoadMore()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onLoadMore, hasMore, loading])

  // 渲染的项目
  const renderItems = useMemo(() => {
    const { start, end } = isInitialRender ? { start: 0, end: Math.min(initialRenderCount, items.length) } : visibleRange
    
    return items.slice(start, end).map((item, relativeIndex) => {
      const actualIndex = start + relativeIndex
      const position = columnLayout.positions[actualIndex]
      
      if (!position) return null

      return (
        <motion.div
          key={item.id}
          className="absolute"
          style={{
            left: position.left,
            top: position.top,
            width: position.width,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: (relativeIndex % actualColumns) * 0.1 }}
        >
          <ItemWrapper
            item={item}
            index={actualIndex}
            onHeightChange={updateItemHeight}
            renderItem={renderItem}
          />
        </motion.div>
      )
    })
  }, [items, visibleRange, columnLayout.positions, renderItem, updateItemHeight, actualColumns, isInitialRender, initialRenderCount])

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* 占位容器 - 维持总高度 */}
      <div style={{ height: columnLayout.totalHeight }} />
      
      {/* 渲染的项目 */}
      <div className="absolute inset-0">
        {renderItems}
      </div>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="flex justify-center mt-8 relative z-10">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {loading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Loading Magic...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Load More Magic ✨
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// 项目包装器组件 - 处理高度测量
interface ItemWrapperProps {
  item: WaterfallItem
  index: number
  onHeightChange: (itemId: string | number, height: number) => void
  renderItem: (item: WaterfallItem, index: number) => React.ReactNode
}

function ItemWrapper({ item, index, onHeightChange, renderItem }: ItemWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // 使用ResizeObserver检测高度变化
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const height = entry.contentRect.height
        if (height > 0) {
          onHeightChange(item.id, height)
        }
      }
    })

    resizeObserver.observe(element)

    // 初始高度检测
    const initialHeight = element.offsetHeight
    if (initialHeight > 0) {
      onHeightChange(item.id, initialHeight)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [item.id, onHeightChange])

  return (
    <div ref={ref} className="w-full">
      {renderItem(item, index)}
    </div>
  )
}