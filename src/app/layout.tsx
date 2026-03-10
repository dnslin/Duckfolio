import type React from "react"
import "../styles/globals.css"
import { getConfig } from "@/lib/config"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/toggle-theme"
import { ThemeSelector } from "@/components/theme-selector"
import { CustomCursor } from "@/components/custom-cursor"
import { MusicPlayer } from "@/components/music-player"

const inter = Inter({ subsets: ["latin"] })

export function generateMetadata(): Promise<Metadata> {
  const config = getConfig()

  return Promise.resolve({
    title: config.profile.name,
    description: config.profile.bio,
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
    },
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full bg-background text-foreground`}>
        <ThemeProvider>
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
            <ThemeSelector />
            <ModeToggle />
          </div>
          <CustomCursor />
          <MusicPlayer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
