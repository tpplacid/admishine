import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'admishine CRM',
  description: 'Admissions Consultancy CRM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerifDisplay.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontSize: 13,
              maxWidth: 340,
              fontFamily: 'var(--font-dm-sans)',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            },
          }}
        />
      </body>
    </html>
  )
}
