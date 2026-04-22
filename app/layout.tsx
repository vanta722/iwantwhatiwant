import type { Metadata, Viewport } from 'next'
import { ServiceWorkerRegistration } from './sw-register'
import './globals.css'

export const metadata: Metadata = {
  title: 'IWantWhatIWant — Learn. Play. Level Up.',
  description: 'The epic educational gaming world for kids ages 4–12. Learn math, reading, and science through AI-powered adventures.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IWWIW',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}
