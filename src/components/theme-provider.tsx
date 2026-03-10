"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { useProfileStore } from "@/lib/store"
import { useDynamicTheme } from "@/lib/useDynamicTheme"
import {
    applyThemePreset,
    clearInlineThemeStyles,
    getSavedPresetId,
    savePresetId,
} from "@/lib/themes"

// --- Preset Context ---

interface ThemePresetContextValue {
    presetId: string
    setPresetId: (id: string) => void
}

const ThemePresetContext = React.createContext<ThemePresetContextValue>({
    presetId: "default",
    setPresetId: () => {},
})

export function useThemePresetContext() {
    return React.useContext(ThemePresetContext)
}

// --- Theme Colors Manager (inside NextThemesProvider) ---

function ThemeColorsManager({ children }: { children: React.ReactNode }) {
    const { avatar, theme: themeConfig } = useProfileStore()
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const [presetId, setPresetIdState] = React.useState<string>(() => {
        if (typeof window === "undefined") return "default"
        return getSavedPresetId() ?? themeConfig?.preset ?? "default"
    })

    const setPresetId = React.useCallback(
        (id: string) => {
            savePresetId(id)
            if (id === "default") {
                clearInlineThemeStyles()
            } else {
                applyThemePreset(id, themeConfig?.customColors)
            }
            setPresetIdState(id)
        },
        [themeConfig?.customColors],
    )

    // Re-apply preset when dark/light mode changes
    React.useEffect(() => {
        if (presetId === "default") return
        applyThemePreset(presetId, themeConfig?.customColors)
    }, [presetId, isDark, themeConfig?.customColors])

    // Avatar-based theming when preset is "default"
    useDynamicTheme(avatar, presetId, isDark)

    const contextValue = React.useMemo(
        () => ({ presetId, setPresetId }),
        [presetId, setPresetId],
    )

    return (
        <ThemePresetContext.Provider value={contextValue}>
            {children}
        </ThemePresetContext.Provider>
    )
}

// --- Public ThemeProvider ---

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            forcedTheme={props.forcedTheme}
            themes={["light", "dark"]}
            {...props}
        >
            <ThemeColorsManager>{children}</ThemeColorsManager>
        </NextThemesProvider>
    )
}
