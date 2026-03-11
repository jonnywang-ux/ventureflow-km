import type { Metadata } from "next"
import { Instrument_Serif, Syne, Geist_Mono } from "next/font/google"
import "./globals.css"

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
})

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "VentureFlow KM",
  description: "Team knowledge management and sharing platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${instrumentSerif.variable} ${syne.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
