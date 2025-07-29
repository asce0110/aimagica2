import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Text to Image AI Generator | Create Art from Text with AIMAGICA',
  description: 'Transform your text descriptions into stunning AI-generated images. Free text-to-image generator with multiple art styles, instant results, and HD downloads.',
  keywords: 'text to image, AI image generator, text to art, AI art generator, free image generator, text prompt to image',
  openGraph: {
    title: 'Text to Image AI Generator | AIMAGICA',
    description: 'Create amazing images from text descriptions using advanced AI technology',
    type: 'website',
    images: ['/images/aimagica-logo.png'],
    url: 'https://your-domain.com/text-to-image',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text to Image AI Generator | AIMAGICA',
    description: 'Transform your words into stunning AI-generated artwork',
    images: ['/images/aimagica-logo.png'],
  },
  alternates: {
    canonical: '/text-to-image'
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TextToImageLayout({
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