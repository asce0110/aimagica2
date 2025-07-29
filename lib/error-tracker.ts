/**
 * 简单的错误追踪器 - 帮助定位问题
 */

let errorCount = 0

// 捕获所有未处理的错误
if (typeof window !== 'undefined') {
  // 捕获JavaScript错误
  window.addEventListener('error', (event) => {
    errorCount++
    console.error('🚨 JavaScript错误 #' + errorCount + ':', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    })
  })

  // 捕获Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    errorCount++
    console.error('🚨 未处理的Promise拒绝 #' + errorCount + ':', {
      reason: event.reason,
      promise: event.promise
    })
  })

  // 捕获资源加载错误
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      errorCount++
      console.error('🚨 资源加载错误 #' + errorCount + ':', {
        type: (event.target as any)?.tagName,
        src: (event.target as any)?.src,
        href: (event.target as any)?.href,
        target: event.target
      })
    }
  }, true)

  console.log('✅ 错误追踪器已启用')
}

export const getErrorCount = () => errorCount
export const resetErrorCount = () => { errorCount = 0 }