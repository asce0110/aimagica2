/**
 * 处理Google头像URL的工具函数
 */

/**
 * 将Google头像URL转换为代理URL以解决CORS问题
 */
export function getProxiedAvatarUrl(originalUrl: string | null | undefined): string {
  if (!originalUrl) {
    return '/images/aimagica-logo.png'
  }

  // 检查是否是Google头像URL
  if (originalUrl.includes('googleusercontent.com')) {
    // 编码原始URL并通过我们的代理服务
    const encodedUrl = encodeURIComponent(originalUrl)
    return `/api/proxy/avatar?url=${encodedUrl}`
  }

  // 如果不是Google头像，直接返回原URL
  return originalUrl
}

/**
 * 为用户名生成备用头像URL
 */
export function getFallbackAvatarUrl(userName: string | null | undefined): string {
  const initial = userName?.charAt(0)?.toUpperCase() || 'U'
  return `/placeholder.svg?height=40&width=40&text=${initial}`
}

/**
 * 检查URL是否为Google头像
 */
export function isGoogleAvatarUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return url.includes('googleusercontent.com')
} 