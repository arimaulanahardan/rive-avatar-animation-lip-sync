import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Avatar Chat',
  description: 'Chatbot with Rive avatar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
