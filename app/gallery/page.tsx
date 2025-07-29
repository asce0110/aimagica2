import type { Metadata } from 'next'
import StaticGalleryClient from './static-gallery-client'
import DebugGallery from './debug-gallery'

export const metadata: Metadata = {
  title: 'AI Gallery - AIMAGICA | High-Performance AI Art Gallery',
  description: 'Explore our high-performance AI art gallery with virtual waterfall layout, lazy loading, and seamless browsing. Discover thousands of AI-generated artworks with lightning-fast performance.',
  keywords: 'AI art gallery, high performance gallery, virtual scrolling, lazy loading, AI generated images, digital art, artificial intelligence art, AI artwork showcase, fast gallery, responsive design',
  authors: [{ name: 'AIMAGICA' }],
  creator: 'AIMAGICA',
  publisher: 'AIMAGICA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'AI Gallery - AIMAGICA | High-Performance AI Art Gallery',
    description: 'Explore our high-performance AI art gallery with virtual waterfall layout and lazy loading',
    url: 'https://aimagica.ai/gallery',
    siteName: 'AIMAGICA',
    images: [
      {
        url: 'https://aimagica.ai/images/aimagica-logo.png',
        width: 1200,
        height: 630,
        alt: 'AIMAGICA Gallery - High-Performance AI Art Gallery',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Gallery - AIMAGICA | High-Performance AI Art Gallery',
    description: 'Explore our high-performance AI art gallery with virtual waterfall layout and lazy loading',
    images: ['https://aimagica.ai/images/aimagica-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function GalleryPage() {
  return <StaticGalleryClient />
}