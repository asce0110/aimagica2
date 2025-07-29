/**
 * 静态Gallery数据 - 使用轻量级图片确保极速加载
 * 优先使用SVG示例图片，确保在任何网络环境下都能快速加载
 */

export interface StaticGalleryImage {
  id: string | number
  url: string
  title: string
  author: string
  authorAvatar: string
  likes: number
  comments: number
  views: number
  downloads: number
  isPremium: boolean
  isFeatured: boolean
  isLiked: boolean
  createdAt: string
  prompt: string
  style: string
  tags: string[]
  size: 'small' | 'medium' | 'large' | 'vertical' | 'horizontal'
  rotation: number
}

/**
 * 生成静态Gallery数据 - 无需API，纯静态展示
 * 参考Pinterest、Dribbble等网站的做法，预先准备好展示内容
 */
export function getStaticGalleryData(): StaticGalleryImage[] {
  console.log('📋 静态Gallery数据: 返回精选作品，无需API调用')
  
  // 使用构建时确定的精选作品，展示AIMAGICA的能力
  // 🎯 使用项目中真实的Gallery图片，确保与原始设计一致
  return [
    {
      id: 'gallery-1',
      url: '/images/gallery/04033a15-7dfc-4b96-8999-91e6915ac926-34c9105b.png',
      title: 'Mystical Portrait',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1247,
      comments: 89,
      views: 5634,
      downloads: 234,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '2024-12-15',
      prompt: 'Beautiful mystical portrait with ethereal lighting',
      style: 'Portrait',
      tags: ['portrait', 'mystical', 'fantasy', 'art'],
      size: 'large',
      rotation: -1
    },
    {
      id: 'gallery-2',
      url: '/images/gallery/22ab8354-87e8-4a74-a37b-c3f08f1ced20-286738dd.png',
      title: 'Digital Dreams',
      author: 'AIMAGICA', 
      authorAvatar: '/images/aimagica-logo.png',
      likes: 892,
      comments: 67,
      views: 3421,
      downloads: 178,
      isPremium: false,
      isFeatured: true,
      isLiked: false,
      createdAt: '2024-12-14',
      prompt: 'Vibrant digital artwork with surreal elements',
      style: 'Digital Art',
      tags: ['digital', 'surreal', 'colorful', 'modern'],
      size: 'horizontal',
      rotation: 1
    },
    {
      id: 'gallery-3',
      url: '/images/gallery/294ff75d-8579-4d3d-87ee-811b69b15a99-5479e3c7.png',
      title: 'Nature Harmony',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 567,
      comments: 43,
      views: 2156,
      downloads: 98,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '2024-12-13',
      prompt: 'Serene natural landscape with magical elements',
      style: 'Landscape',
      tags: ['nature', 'landscape', 'peaceful', 'magical'],
      size: 'vertical',
      rotation: 0
    },
    {
      id: 'gallery-4',
      url: '/images/gallery/2afbdc00-d083-46bf-8167-28d81971226f-fb48974a.png',
      title: 'Urban Fantasy',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 734,
      comments: 56,
      views: 2789,
      downloads: 156,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '2024-12-12',
      prompt: 'Modern city meets fantasy in this unique composition',
      style: 'Urban Fantasy',
      tags: ['urban', 'fantasy', 'city', 'modern'],
      size: 'medium',
      rotation: -2
    },
    {
      id: 'gallery-5',
      url: '/images/gallery/341851d0-7c3b-4119-b503-102c0aee0d8f-b4209676.png',
      title: 'Abstract Visions',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 445,
      comments: 34,
      views: 1823,
      downloads: 87,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '2024-12-11',
      prompt: 'Bold abstract composition with dynamic forms',
      style: 'Abstract',
      tags: ['abstract', 'bold', 'dynamic', 'artistic'],
      size: 'large',
      rotation: 1
    },
    {
      id: 'gallery-6',
      url: '/images/gallery/386628e0-61b1-4966-8575-2c2f2f162e3a-f897c7ae.png',
      title: 'Cosmic Wanderer',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 923,
      comments: 78,
      views: 4156,
      downloads: 203,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '2024-12-10',
      prompt: 'Space explorer in a vast cosmic landscape',
      style: 'Sci-Fi',
      tags: ['space', 'explorer', 'cosmic', 'adventure'],
      size: 'horizontal',
      rotation: 0
    },
    {
      id: 'gallery-7',
      url: '/images/gallery/5abb0316-b1d9-4c3a-ac97-76fcbe63f52b-fbb64e00.png',
      title: 'Ethereal Beauty',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 1156,
      comments: 94,
      views: 5234,
      downloads: 267,
      isPremium: true,
      isFeatured: true,
      isLiked: false,
      createdAt: '2024-12-09',
      prompt: 'Delicate ethereal figure with flowing elements',
      style: 'Fantasy',
      tags: ['ethereal', 'beauty', 'flowing', 'delicate'],
      size: 'vertical',
      rotation: -1
    },
    {
      id: 'gallery-8',
      url: '/images/gallery/82db65f1-d54e-4f7f-a9c3-c3f5e902643b-d36a1d13.png',
      title: 'Mechanical Dreams',
      author: 'AIMAGICA',
      authorAvatar: '/images/aimagica-logo.png',
      likes: 678,
      comments: 52,
      views: 2567,
      downloads: 143,
      isPremium: false,
      isFeatured: false,
      isLiked: false,
      createdAt: '2024-12-08',
      prompt: 'Intricate mechanical design with steampunk elements',
      style: 'Steampunk',
      tags: ['mechanical', 'steampunk', 'intricate', 'design'],
      size: 'medium',
      rotation: 2
    }
  ]
}

export default getStaticGalleryData