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

    // Overriding background and surface to force neutral white/gray theme for "Echo"
    const base = schoolConfig ? (schoolConfig[mode] || schoolConfig.light) : {
        primary: "#7C3AED",
        secondary: "#6D28D9",
        bg: "#FAFAFA",
        surface: "#FFFFFF",
        text: "#0F172A",
        textMuted: "#475569",
        border: "#E2E8F0",
        primaryLight: "#EDE9FE",
    };

    return {
        ...base,
        bg: "#FAFAFA",
        surface: "#FFFFFF"
    };
}

/**
 * Re-export useTheme so consumers don't need a separate import for toggling.
 */
export { useTheme };