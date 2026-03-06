import React, { createContext, useContext } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

/**
 * Wrap the app in <ThemeProvider> to enable dark mode toggling.
 * Uses next-themes under the hood – the "class" attribute strategy
 * adds/removes a "dark" class on <html>.
 */
export function ThemeProvider({ children }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
        </NextThemesProvider>
    );
}

/**
 * useThemeTokens(schoolConfig)
 *
 * Given a school config object (from getSchoolConfig), returns the
 * resolved token set for the current theme (light or dark).
 *
 * Usage:
 *   const tokens = useThemeTokens(schoolConfig);
 *   // tokens.primary, tokens.bg, tokens.surface, tokens.text, ...
 */
export function useThemeTokens(schoolConfig) {
    const { resolvedTheme } = useTheme();
    const mode = resolvedTheme === "dark" ? "dark" : "light";

    if (!schoolConfig) {
        return mode === "dark" ? {
            primary: "#6EA8FF",
            secondary: "#4FD2E6",
            bg: "#0B0F14",
            surface: "#121922",
            elevated: "#18212D",
            text: "#EAF0F7",
            textMuted: "#A8B3C2",
            textFaint: "#6F7C8F",
            border: "#223041",
            divider: "#1C2633",
            primaryLight: "rgba(110,168,255,0.14)",
        } : {
            primary: "#7C3AED",
            secondary: "#6D28D9",
            bg: "#F5F3FF",
            surface: "#FFFFFF",
            text: "#0F172A",
            textMuted: "#475569",
            border: "#E2E8F0",
            primaryLight: "#EDE9FE",
        };
    }

    return schoolConfig[mode] || schoolConfig.light;
}

/**
 * Re-export useTheme so consumers don't need a separate import for toggling.
 */
export { useTheme };