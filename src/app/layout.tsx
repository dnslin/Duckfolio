import type React from "react"
import "../styles/globals.css"
import { getConfig } from "@/lib/config"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/toggle-theme"
import { ThemeSelector } from "@/components/theme-selector"
import { CustomCursor } from "@/components/custom-cursor"
import { MusicPlayer } from "@/components/music-player"

const config = getConfig()

const SYSTEM_FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'

function buildGoogleFontsUrl(fonts: {
  heading?: string
  body?: string
}): string | null {
  const families = new Set<string>()
  if (fonts.heading) families.add(fonts.heading)
  if (fonts.body) families.add(fonts.body)
  if (families.size === 0) return null
  const params = Array.from(families)
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join("&")
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}

function buildFontFamily(fontName: string | undefined): string {
  return fontName ? `"${fontName}", ${SYSTEM_FONT_STACK}` : SYSTEM_FONT_STACK
}

const fonts = config.theme?.fonts
const googleFontsUrl = fonts ? buildGoogleFontsUrl(fonts) : null
const headingFontFamily = buildFontFamily(fonts?.heading)
const bodyFontFamily = buildFontFamily(fonts?.body)

export function generateMetadata(): Promise<Metadata> {
  return Promise.resolve({
    title: config.profile.name,
    description: config.profile.bio,
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
    },
  })
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <head>
        {googleFontsUrl ? (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link rel="stylesheet" href={googleFontsUrl} />
          </>
        ) : null}
      </head>
      <body
        className="h-full bg-background text-foreground"
        style={
          {
            "--font-heading": headingFontFamily,
            "--font-body": bodyFontFamily,
          } as React.CSSProperties
        }
      >
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
