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

// Default tokens used when no school config is available (fizz purple)
const DEFAULT_TOKENS = {
    primary: "#7C3AED",
    primaryHover: "#6D28D9",
    primaryLight: "#EDE9FE",
    secondary: "#6D28D9",
    background: "#F8F9FB",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    text: "#0F172A",
    textMuted: "#64748B",
    border: "#E2E8F0",
    divider: "#F1F5F9",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
};

/**
 * useThemeTokens(schoolConfig)
 *
 * Given a school config object (from getSchoolConfig), returns the
 * resolved token set for the current theme (light or dark).
 *
 * Usage:
 *   const tokens = useThemeTokens(schoolConfig);
 *   // tokens.primary, tokens.background, tokens.surface, tokens.text, ...
 */
export function useThemeTokens(schoolConfig) {
    const { resolvedTheme } = useTheme();
    const mode = resolvedTheme === "dark" ? "dark" : "light";

    if (!schoolConfig) {
        return DEFAULT_TOKENS;
    }

    const resolved = schoolConfig[mode] || schoolConfig.light;

    // Backward compat: if consumer reads `bg`, give them `background`
    if (resolved && !resolved.bg && resolved.background) {
        resolved.bg = resolved.background;
    }

    return resolved || DEFAULT_TOKENS;
}

/**
 * Re-export useTheme so consumers don't need a separate import for toggling.
 */
export { useTheme };
