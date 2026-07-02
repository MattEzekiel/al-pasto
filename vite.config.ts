import path from "node:path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Prerendered marketing routes and static files (robots.txt,
        // sitemap.xml, llms.txt, ...) must not be hijacked by the SPA
        // navigate fallback once the service worker is installed.
        navigateFallbackDenylist: [
          /^\/juego/,
          /^\/game/,
          /^\/como-jugar/,
          /^\/how-to-play/,
          /\.[a-z0-9]+$/i,
        ],
      },
      manifest: {
        lang: "es-AR",
        name: "Al pasto — el juego de cartas extraoficial",
        short_name: "Al pasto",
        description:
          "Juego de cartas multijugador, sin base de datos, alojado entre pares. Mobile-first.",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
