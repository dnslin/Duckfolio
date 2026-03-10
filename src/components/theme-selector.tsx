"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Palette } from "lucide-react"
import { themePresets } from "@/lib/themes"
import { useThemePresetContext } from "@/components/theme-provider"

export function ThemeSelector() {
    const { presetId, setPresetId } = useThemePresetContext()
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false)
                return
            }
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault()
                const idx = themePresets.findIndex((p) => p.id === presetId)
                const next = themePresets[(idx + 1) % themePresets.length]
                setPresetId(next.id)
            }
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault()
                const idx = themePresets.findIndex((p) => p.id === presetId)
                const prev =
                    themePresets[
                        (idx - 1 + themePresets.length) % themePresets.length
                    ]
                setPresetId(prev.id)
            }
        },
        [presetId, setPresetId],
    )

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-primary/20 shadow-lg hover:shadow-primary/20 hover:border-primary/40 hover:scale-105 transition-[transform,box-shadow,border-color] duration-300 ease-in-out"
                aria-label="选择主题配色"
                aria-expanded={isOpen}
            >
                <Palette className="h-[1.2rem] w-[1.2rem] text-primary" />
            </button>

            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 8 }}
                        transition={{
                            duration: 0.2,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        role="radiogroup"
                        aria-label="主题预设"
                        onKeyDown={handleKeyDown}
                        className="absolute bottom-full mb-2 right-0 flex gap-2 p-2.5 rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-md border border-[#121212]/5 dark:border-white/10 shadow-lg"
                    >
                        {themePresets.map((preset) => (
                            <button
                                key={preset.id}
                                role="radio"
                                aria-checked={presetId === preset.id}
                                onClick={() => {
                                    setPresetId(preset.id)
                                    setIsOpen(false)
                                }}
                                className={`w-6 h-6 rounded-full transition-[transform,box-shadow] duration-200 ${
                                    presetId === preset.id
                                        ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-[#121212]/50 dark:ring-white/50 scale-110"
                                        : "hover:scale-110"
                                }`}
                                style={{
                                    backgroundColor: preset.colors.primary,
                                }}
                                aria-label={`${preset.name}主题`}
                                title={preset.name}
                            />
                        ))}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}
