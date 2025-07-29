// API 配置 - Cloudflare Pages + Workers 架构
export const API_CONFIG = {
  // Workers API基础URL
  // 前端(Pages) -> API(Workers) 架构
  
  // 基础URL配置 - 指向Workers API
  BASE_URL: 'https://aimagica-api.403153162.workers.dev',
  
  // API端点配置 - 连接到Workers API
  ENDPOINTS: {
    // ✅ 核心功能API
    GENERATE_IMAGE: '/api/generate/image',    // 图片生成
    KIE_FLUX: '/api/generate/kie-flux',       // KieFlux生成
    GENERATE_VIDEO: '/api/generate/video',    // 视频生成
    
    // ✅ 图片管理API  
    SAVE_IMAGE: '/api/images/save',           // 保存图片
    UPLOAD_BASE64: '/api/images/upload-base64', // Base64上传
    UPLOAD_TO_R2: '/api/images/upload-to-r2', // R2上传
    
    // ✅ 用户认证API
    USER_AUTH: '/api/auth/callback',          // 认证回调
    AUTH_LOGOUT: '/api/auth/logout',          // 登出
    
    // ✅ 样式和内容API
    STYLES: '/api/styles',                    // 样式管理
    STYLES_PUBLIC: '/api/styles-public',      // 公共样式
    FEATURED_IMAGES: '/api/featured-images',  // 精选图片
    
    // ✅ Gallery API
    GALLERY_PUBLIC: '/api/gallery/public',    // 公共画廊
    GALLERY_ITEM: '/api/gallery',             // 画廊项目
    
    // ✅ 管理员API
    ADMIN_CHECK: '/api/admin/check',          // 管理员检查
    ADMIN_STATS: '/api/admin/stats',          // 管理员统计
    ADMIN_USERS: '/api/admin/users',          // 用户管理
    ADMIN_IMAGES: '/api/admin/images',        // 图片管理
    
    // ✅ 支付API
    PAYMENT_CHECKOUT: '/api/payment/create-checkout', // 创建支付
    PAYPAL_VERIFY: '/api/payment/paypal/verify',      // PayPal验证
    
    // ✅ 魔法币API
    MAGIC_COINS_BALANCE: '/api/magic-coins/balance',     // 余额查询
    MAGIC_COINS_PACKAGES: '/api/magic-coins/packages',   // 套餐列表
    
    // ✅ 其他API
    RECOMMENDATIONS: '/api/recommendations',  // 推荐
    USER_PROMPTS: '/api/user-prompts',       // 用户提示词
    TEST: '/api/test',                       // 测试端点
  },
  
  // 功能状态标记
  FEATURES: {
    IMAGE_GENERATION: true,   // ✅ Workers API已部署
    USER_AUTH: true,          // ✅ Workers API已部署
    SAVE_IMAGES: true,        // ✅ Workers API已部署
    ADMIN_PANEL: true,        // ✅ Workers API已部署
    PAYMENTS: true,           // ✅ Workers API已部署
    
    // 静态功能保留
    GALLERY_VIEW: true,       // 静态展示
    STYLE_PREVIEW: true,      // 静态展示
    LANDING_PAGE: true,       // 静态页面
  }
}

// 检查功能是否可用
export function isFeatureEnabled(feature: keyof typeof API_CONFIG.FEATURES): boolean {
  return API_CONFIG.FEATURES[feature]
}

// 获取API端点（如果可用）
export function getApiEndpoint(endpoint: keyof typeof API_CONFIG.ENDPOINTS): string | null {
  // 检查端点是否存在
  if (!API_CONFIG.ENDPOINTS[endpoint]) {
    console.error(`❌ API endpoint '${endpoint}' not found in configuration`)
    return null
  }
  
  // 在客户端环境中，始终返回完整的API URL
  const fullUrl = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS[endpoint]
  console.log(`🔗 Generated API endpoint for '${endpoint}':`, fullUrl)
  
  return fullUrl
}

// API调用封装 - 支持Workers API
export async function callApi(endpoint: string, options?: RequestInit) {
  const url = getApiEndpoint(endpoint as any)
  if (!url) {
    throw new Error('API端点不可用')
  }
  
  // 默认配置CORS和超时
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  }
  
  try {
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }
    
    return response
  } catch (error) {
    console.error('API调用错误:', error)
    throw error
  }
} 