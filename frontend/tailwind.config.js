/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                heading: ["'Lexend'", "system-ui", "sans-serif"],
                body:    ["'Lexend'", "system-ui", "sans-serif"],
                mono:    ["'JetBrains Mono'", "monospace"],
                sans:    ["'Lexend'", "system-ui", "sans-serif"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card:       { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
                popover:    { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
                primary:    { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
                secondary:  { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
                muted:      { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
                accent:     { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
                destructive:{ DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
                border: "hsl(var(--border))",
                brand: {
                    lt_green:  "#254f1a",
                    lt_lime:   "#d2e823",
                    lt_pink:   "#e9c0e9",
                    lt_purple: "#53256a",
                    lt_red:    "#502030",
                    lt_light:  "#f3f3f1",
                    primary:   "#9D00FF", // vibrant purple
                    secondary: "#DE811D", // custom orange
                    tertiary:  "#6BFF00", // lime green
                    quaternary:"#5B8040", // olive green
                    orange:    "#DE811D", // override orange with new one
                    orange_d:  "#c06b12", // darker shade
                    dark:      "#0f0f0f",
                    surface:   "#fef9f5",
                    muted:     "#6b7280",
                    // Legacy keys kept for any existing usage
                    sand:      "#F7F5F0",
                    ink:       "#1A1A1A",
                    vermilion: "#f97316",
                    cobalt:    "#8b5cf6",
                    yellow:    "#fbbf24",
                    pink:      "#ec4899",
                },
            },
            boxShadow: {
                orange:       "0 4px 14px rgba(249,115,22,0.4)",
                "orange-lg":  "0 20px 60px rgba(249,115,22,0.3)",
                card:         "0 4px 24px rgba(0,0,0,0.08)",
                heavy:        "0 20px 60px rgba(0,0,0,0.15)",
                // Legacy
                hard:           "4px 4px 0px 0px #1A1A1A",
                "hard-lg":      "6px 6px 0px 0px #1A1A1A",
                "hard-cobalt":  "4px 4px 0px 0px #8b5cf6",
                "hard-vermilion":"4px 4px 0px 0px #f97316",
            },
            keyframes: {
                "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
                "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
                marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
                fadeup:  { from: { opacity: 0, transform: "translateY(24px)" }, to: { opacity: 1, transform: "translateY(0)" } },
                float:   { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
                blob:    {
                    "0%,100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
                    "25%":     { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
                    "50%":     { borderRadius: "50% 60% 30% 70% / 30% 50% 60% 40%" },
                    "75%":     { borderRadius: "60% 40% 50% 30% / 60% 40% 70% 50%" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up":   "accordion-up 0.2s ease-out",
                marquee:          "marquee 35s linear infinite",
                fadeup:           "fadeup 0.7s ease-out both",
                float:            "float 5s ease-in-out infinite",
                blob:             "blob 8s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
