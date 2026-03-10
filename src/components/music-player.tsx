"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Music, X } from "lucide-react"
import { useProfileStore } from "@/lib/store"

// 允许嵌入的域名白名单
const ALLOWED_DOMAINS = ["music.163.com", "open.spotify.com"]

// iframe 尺寸配置
const PLAYER_SIZE: Record<string, { width: number; height: number }> = {
  netease: { width: 320, height: 380 },
  spotify: { width: 320, height: 152 },
}

// 动画配置（模块级常量，避免渲染时重建）
const expandTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 26,
}

const pulseKeyframes = {
  scale: [1, 1.15, 1],
  opacity: [0.6, 0, 0.6],
}

const pulseTransition = {
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut" as const,
}

/**
 * 校验 playlistUrl 是否属于白名单域名
 * 无效 URL 或非白名单域名返回 null
 */
function validateUrl(raw: string): string | null {
  try {
    const url = new URL(raw)
    if (ALLOWED_DOMAINS.some((d) => url.hostname.endsWith(d))) {
      return url.toString()
    }
  } catch {
    // 无效 URL，静默返回 null
  }
  return null
}

export function MusicPlayer() {
  const musicPlayer = useProfileStore((s) => s.musicPlayer)
  const [isExpanded, setIsExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // 校验 URL（useMemo 避免每次渲染重复解析）
  const validatedSrc = useMemo(
    () => (musicPlayer?.playlistUrl ? validateUrl(musicPlayer.playlistUrl) : null),
    [musicPlayer?.playlistUrl]
  )

  // 未启用或配置无效时不渲染
  if (!musicPlayer?.enabled || !validatedSrc) return null

  const position = musicPlayer.position ?? "bottom-right"
  const isLeft = position === "bottom-left"
  const size = PLAYER_SIZE[musicPlayer.provider] ?? PLAYER_SIZE.netease

  // 位置样式：bottom-right 时上移避免与主题切换按钮重叠
  const positionClass = isLeft
    ? "fixed bottom-6 left-6"
    : "fixed bottom-18 right-4"

  return (
    <div className={`${positionClass} z-50`}>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="player-expanded"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.6 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.6 }
            }
            transition={expandTransition}
            style={{
              transformOrigin: isLeft ? "bottom left" : "bottom right",
              width: "min(calc(100vw - 48px), " + size.width + "px)",
            }}
            className="rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
          >
            {/* 关闭按钮 */}
            <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 select-none">
                {musicPlayer.provider === "spotify" ? "Spotify" : "网易云音乐"}
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                aria-label="收起播放器"
              >
                <X size={16} />
              </button>
            </div>

            {/* iframe 嵌入 */}
            <iframe
              src={validatedSrc}
              width="100%"
              height={size.height}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups"
              allow="autoplay; encrypted-media"
              title={
                musicPlayer.provider === "spotify"
                  ? "Spotify 播放器"
                  : "网易云音乐播放器"
              }
              className="block border-0"
            />
          </motion.div>
        ) : (
          <motion.button
            key="player-collapsed"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.5 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.5 }
            }
            transition={expandTransition}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            aria-label="展开音乐播放器"
            className="relative size-12 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 shadow-lg flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-secondary)] transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {/* 脉冲动画环 */}
            {!prefersReducedMotion ? (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-[var(--theme-primary)] dark:border-[var(--theme-secondary)]"
                animate={pulseKeyframes}
                transition={pulseTransition}
                aria-hidden="true"
              />
            ) : null}
            <Music size={20} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
