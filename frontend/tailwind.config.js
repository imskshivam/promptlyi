/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                heading: ["'Cabinet Grotesk'", "'Archivo'", "system-ui", "sans-serif"],
                body: ["'Satoshi'", "'Inter'", "system-ui", "sans-serif"],
                mono: ["'JetBrains Mono'", "monospace"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
                popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
                primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
                secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
                muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
                accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
                destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                brand: {
                    sand: "#F7F5F0",
                    ink: "#1A1A1A",
                    vermilion: "#FF4F00",
                    cobalt: "#0047FF",
                    yellow: "#FFD600",
                    pink: "#FF3399",
                    surface: "#EFEBE1",
                    line: "#D8D4C9",
                    muted: "#66635D",
                },
            },
            boxShadow: {
                hard: "4px 4px 0px 0px #1A1A1A",
                "hard-lg": "6px 6px 0px 0px #1A1A1A",
                "hard-cobalt": "4px 4px 0px 0px #0047FF",
                "hard-vermilion": "4px 4px 0px 0px #FF4F00",
            },
            keyframes: {
                "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
                "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
                marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
                fadeup: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                marquee: "marquee 40s linear infinite",
                fadeup: "fadeup 0.6s ease-out both",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
