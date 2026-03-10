"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { flushSync } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/packages/ui/button"

export function ModeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // 确保组件挂载后才渲染，避免水合不匹配
    useEffect(() => {
        setMounted(true)
    }, [])

    // 圆形扩散切换主题效果
    const toggleTheme = (event: React.MouseEvent) => {
        // 检查浏览器是否支持 View Transitions API
        // @ts-expect-error experimental API
        const isAppearanceTransition = document.startViewTransition
            && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (!isAppearanceTransition) {
            // 如果不支持，直接切换主题
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
            return
        }

        const isDark = resolvedTheme === "dark"
        const nextTheme = isDark ? "light" : "dark"
        const x = event.clientX
        const y = event.clientY
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y),
        )

        try {
            const transition = document.startViewTransition(() => {
                flushSync(() => {
                    setTheme(nextTheme)
                })
            })

            transition.ready
                .then(() => {
                    const clipPath = [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ]
                    document.documentElement.animate(
                        {
                            clipPath: isDark
                                ? [...clipPath].reverse()
                                : clipPath,
                        },
                        {
                            duration: 400,
                            easing: 'ease-out',
                            fill: 'both',
                            pseudoElement: isDark
                                ? '::view-transition-old(root)'
                                : '::view-transition-new(root)',
                        },
                    )
                })
                .catch(err => {
                    console.error("Theme transition error:", err)
                    // 错误发生时也没关系，主题已经成功切换
                })
        } catch (e) {
            console.error("Failed to start view transition:", e)
            // 发生错误时回退到普通切换
            setTheme(nextTheme)
        }
    }

    if (!mounted) {
        return null
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={resolvedTheme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
            className="rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-primary/20 hover:border-primary/40 hover:scale-105 transition-[transform,box-shadow,border-color] duration-300 ease-in-out overflow-hidden"
        >
            <AnimatePresence mode="wait" initial={false}>
                {resolvedTheme === "dark" ? (
                    <motion.div
                        key="sun"
                        initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] text-primary" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Moon className="h-[1.2rem] w-[1.2rem] text-primary" />
                    </motion.div>
                )}
            </AnimatePresence>
        </Button>
    )
}
