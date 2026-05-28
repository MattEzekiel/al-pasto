import type { Config } from "tailwindcss";

/**
 * Corta — Sin Filtro design tokens.
 *
 * Pulls the high-contrast palette and the editorial Inter-700 voice
 * directly from DESIGN.md. Touch every token here; never inline hex in
 * components.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#000000",
        surface: {
          card: "#121212",
          elevated: "#1C1C1E",
          deep: "#0a0a0a",
        },
        brand: {
          DEFAULT: "#494fdf",
          bright: "#4f55f1",
          deep: "#3a40c4",
        },
        ink: {
          DEFAULT: "#ffffff",
          mute: "#8E8E93",
          faint: "#5c5e60",
        },
        hairline: {
          DEFAULT: "#2A2A2A",
          strong: "#3A3A3A",
        },
        accent: {
          teal: "#00a87e",
          rose: "#e23b4a",
          amber: "#b09000",
        },
      },
      fontFamily: {
        sans: [
          "Inter Display",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        // display ladder — Inter 700, tight tracking
        "display-xxl": ["80px", { lineHeight: "1.0", letterSpacing: "-1.6px", fontWeight: "700" }],
        "display-xl": ["56px", { lineHeight: "1.05", letterSpacing: "-1.5px", fontWeight: "700" }],
        "display-lg": ["40px", { lineHeight: "1.1", letterSpacing: "-1.2px", fontWeight: "700" }],
        "display-md": ["32px", { lineHeight: "1.15", letterSpacing: "-1px", fontWeight: "700" }],
        "display-sm": ["24px", { lineHeight: "1.2", letterSpacing: "-0.6px", fontWeight: "700" }],
        // card type — the line on a white card
        "card-lg": ["28px", { lineHeight: "1.15", letterSpacing: "-1.5px", fontWeight: "700" }],
        "card-md": ["22px", { lineHeight: "1.2", letterSpacing: "-1px", fontWeight: "700" }],
        // body + UI labels — Inter, positive tracking
        body: ["16px", { lineHeight: "1.5", letterSpacing: "0.2px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.45", letterSpacing: "0.2px", fontWeight: "400" }],
        label: ["13px", { lineHeight: "1.3", letterSpacing: "0.4px", fontWeight: "600" }],
        button: ["15px", { lineHeight: "1.0", letterSpacing: "0.2px", fontWeight: "600" }],
      },
      borderRadius: {
        // signature shapes
        chip: "9999px",
        pill: "9999px",
        card: "16px",
        sheet: "24px",
      },
      spacing: {
        touch: "48px", // minimum tap target
        gutter: "20px",
        rail: "24px",
      },
      boxShadow: {
        // depth comes from color-blocking. The "shadow" tokens are zero —
        // declared so a misuse trips a lint warning rather than silently
        // adding a soft shadow.
        none: "none",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
