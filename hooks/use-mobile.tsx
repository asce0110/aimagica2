"use client"

import { useState, useEffect } from "react"

export default function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape")

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 640)
      setIsTablet(width >= 640 && width < 1024)
      setIsDesktop(width >= 1024)
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape")
    }

    // 初始检查
    checkDevice()

    // 监听窗口大小变化
    window.addEventListener("resize", checkDevice)

    // 监听设备方向变化
    window.addEventListener("orientationchange", checkDevice)

    // 清理函数
    return () => {
      window.removeEventListener("resize", checkDevice)
      window.removeEventListener("orientationchange", checkDevice)
    }
  }, [])

  // 检测是否支持特定CSS功能
  const [supportsBackdropFilter, setSupportsBackdropFilter] = useState(true)

  useEffect(() => {
    // 检测是否支持backdrop-filter
    setSupportsBackdropFilter("backdropFilter" in document.documentElement.style)
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    supportsBackdropFilter,
    // 设备类型
    deviceType: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
  }
}
