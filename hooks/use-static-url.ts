import { useMemo } from 'react';

/**
 * Hook for getting optimized static asset URLs
 * Automatically switches between local files and CDN based on environment
 */
export function useStaticUrl(localPath: string): string {
  return useMemo(() => {
    const normalizedPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
    
    // 在生产环境下，确保路径正确处理
    if (typeof window !== 'undefined') {
      // 检查当前域名是否为Cloudflare Pages
      const isCloudflarePages = window.location.hostname.includes('.pages.dev') || 
                               window.location.hostname === 'aimagica.pages.dev';
      
      if (isCloudflarePages) {
        // 对于Cloudflare Pages，使用绝对路径
        return normalizedPath;
      }
    }
    
    // 服务端渲染或其他环境，返回相对路径
    return normalizedPath;
  }, [localPath]);
}

/**
 * 直接获取静态URL（优化版本）
 */
export function getStaticUrl(localPath: string): string {
  const normalizedPath = localPath.startsWith('/') ? localPath : `/${localPath}`;
  
  // 在浏览器环境下检查部署平台
  if (typeof window !== 'undefined') {
    const isCloudflarePages = window.location.hostname.includes('.pages.dev') || 
                             window.location.hostname === 'aimagica.pages.dev';
    
    if (isCloudflarePages) {
      return normalizedPath;
    }
  }
  
  return normalizedPath;
}

export default useStaticUrl; 