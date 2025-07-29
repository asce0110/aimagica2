/** @type {import('next').NextConfig} */
const nextConfig = {
  // 纯静态导出 - 不包含任何API路由
  output: 'export',
  
  // 基础配置
  trailingSlash: false,
  assetPrefix: '',
  basePath: '',
  
  // Next.js 14 静态导出配置
  
  // 完全禁用服务端功能
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 环境变量 - 指向 Workers API
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.aimagica.ai',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvrkbpnnlxjqyhmmovro.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build_placeholder_anon_key',
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://images.aimagica.ai',
    NEXT_PUBLIC_ENABLE_CDN: process.env.NEXT_PUBLIC_ENABLE_CDN || 'true',
    // 提供构建时环境变量默认值
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://aimagica.pages.dev',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'build_placeholder_secret',
  },
  
  // 构建优化
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 排除不需要的文件
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react'],
    optimizeFonts: true,
    esmExternals: false,
  },
  
  // Webpack 配置
  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
  
}

export default nextConfig