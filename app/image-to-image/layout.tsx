import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image to Image AI Generator | Transform Photos with AIMAGICA',
  description: 'Upload your photos and transform them into stunning AI artworks. Advanced image-to-image AI technology with multiple art styles. Transform any photo into art in seconds!',
  keywords: 'image to image, photo transformer, AI photo editor, image enhancement AI, photo to art converter, AI image enhancement',
  openGraph: {
    title: 'Image to Image AI Generator | AIMAGICA',
    description: 'Transform your photos into stunning AI artworks with advanced image-to-image technology',
    type: 'website',
    images: ['/images/aimagica-logo.png'],
    url: 'https://your-domain.com/image-to-image',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image to Image AI Generator | AIMAGICA',
    description: 'Upload and transform your photos into stunning AI art',
    images: ['/images/aimagica-logo.png'],
  },
  alternates: {
    canonical: '/image-to-image'
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ImageToImageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
} 