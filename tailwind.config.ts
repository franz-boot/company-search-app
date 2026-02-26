import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Neon palette
                neon: {
                    purple: "#a855f7",
                    cyan: "#06b6d4",
                    pink: "#ec4899",
                    "purple-dark": "#7c3aed",
                    "cyan-dark": "#0891b2",
                },
                glass: {
                    bg: "rgba(15,20,40,0.6)",
                    border: "rgba(168,85,247,0.2)",
                },
                // Legacy brand kept for compatibility
                brand: {
                    50: "#faf5ff",
                    100: "#f3e8ff",
                    200: "#e9d5ff",
                    300: "#d8b4fe",
                    400: "#c084fc",
                    500: "#a855f7",
                    600: "#9333ea",
                    700: "#7c3aed",
                    800: "#6d28d9",
                    900: "#5b21b6",
                },
                surface: {
                    light: "#0f1428",
                    dark: "#080b14",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "neon-gradient": "linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)",
                "neon-gradient-inv": "linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)",
                "card-gradient": "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(6,182,212,0.05) 100%)",
            },
            animation: {
                "fade-in": "fadeIn 0.4s ease-out both",
                "slide-up": "slideUp 0.5s ease-out both",
                "glow-pulse": "glowPulse 3s ease-in-out infinite",
                "shimmer": "shimmer 2s linear infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                glowPulse: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(168,85,247,0.3)" },
                    "50%": { boxShadow: "0 0 40px rgba(168,85,247,0.6), 0 0 80px rgba(6,182,212,0.2)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
            boxShadow: {
                "neon-sm": "0 0 10px rgba(168,85,247,0.3)",
                "neon-md": "0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(6,182,212,0.1)",
                "neon-lg": "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(6,182,212,0.2)",
                "glass": "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                "card": "0 4px 24px rgba(0,0,0,0.3)",
                "card-hover": "0 12px 48px rgba(0,0,0,0.4), 0 0 30px rgba(168,85,247,0.15)",
            },
            borderColor: {
                glass: "rgba(168,85,247,0.2)",
                "glass-hover": "rgba(168,85,247,0.5)",
            },
            backdropBlur: {
                glass: "20px",
            },
        },
    },
    plugins: [],
};

export default config;
