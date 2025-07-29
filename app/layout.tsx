import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/session-provider'
import StagewiseWrapper from '@/components/stagewise-wrapper'
import FloatingGenerationTips from '@/components/floating-generation-tips'
import '@/lib/error-tracker' // 导入错误追踪器
import { Orbitron, Space_Grotesk, Exo_2, Fredoka_One } from 'next/font/google'

// 配置Google Fonts
const fredokaOne = Fredoka_One({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-magic',
  display: 'swap',
})

const orbitron = Orbitron({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const exo2 = Exo_2({
  weight: ['300', '400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://aimagica.ai'),
  title: 'Image to Image AI Generator | Transform Images with AIMAGICA',
  description: 'Upload your images and transform them into stunning AI artworks. Advanced image-to-image AI technology with multiple art styles. Transform any photo into art in 30 seconds!',
  keywords: 'image to image, AI image transformer, photo to art converter, image enhancement AI, AI art from photos',
  generator: 'AIMAGICA',
  openGraph: {
    title: 'Image to Image AI Generator | AIMAGICA',
    description: 'Transform your images into stunning AI artworks with advanced image-to-image technology',
    type: 'website',
    images: ['https://images.aimagica.ai/web-app-manifest-512x512.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image to Image AI Generator | AIMAGICA',
    description: 'Upload and transform your images into stunning AI art',
    images: ['https://images.aimagica.ai/web-app-manifest-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&display=swap" 
          as="style" 
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link 
            rel="stylesheet" 
            href="https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&display=swap"
          />
        </noscript>
      </head>
      <body 
        className={`bg-background text-foreground ${fredokaOne.variable} ${orbitron.variable} ${spaceGrotesk.variable} ${exo2.variable}`}
      >
        <Providers>
          {children}
          {/* Stagewise toolbar with error handling wrapper */}
          <StagewiseWrapper />
          {/* 全局浮动生图提示组件 */}
          <FloatingGenerationTips />
        </Providers>
      </body>
    </html>
  )
}
