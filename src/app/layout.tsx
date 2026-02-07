import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bricks & Balls - Beautiful Breakout Experience',
  description: 'A beautifully designed breakout game with smooth animations and intuitive controls. Perfect for mobile and desktop.',
  keywords: ['game', 'bricks', 'balls', 'breakout', 'beautiful', 'apple design', 'mobile'],
  authors: [{ name: 'Saga Team' }],
  creator: 'Saga',
  publisher: 'Saga',
  robots: 'index, follow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bricks & Balls',
  },
  openGraph: {
    type: 'website',
    url: 'https://bricks-and-balls.vercel.app',
    title: 'Bricks & Balls - Beautiful Breakout Experience',
    description: 'A beautifully designed breakout game with smooth animations and intuitive controls.',
    siteName: 'Bricks & Balls',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bricks & Balls - Beautiful Breakout Experience',
    description: 'A beautifully designed breakout game with smooth animations and intuitive controls.',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f8f9fa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        fontFeatureSettings: '"rlig" 1, "calt" 1'
      }}>
        {children}
      </body>
    </html>
  )
}