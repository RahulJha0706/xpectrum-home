import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'

// Same typefaces as the Xpectrum app: IBM Plex Sans for text, Space Grotesk
// for display numbers and labels (both self-hosted by next/font).
const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-xp-body',
  display: 'swap',
})
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-xp-workflow',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Xpectrum AI: AI agents for every call, text and email',
  description: 'Build, deploy and monitor AI agents. Design them on a visual canvas, ground them in your knowledge, and put them on your phone line, SMS, WhatsApp, email and website.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0826',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${body.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  )
}
