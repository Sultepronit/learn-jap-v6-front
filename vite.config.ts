import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        VitePWA({
            registerType: "autoUpdate",
            // devOptions: { enabled: true },
            includeAssets: ["favicon.ico", "/fonts/*.ttf", "/fonts/*.otf"],
            manifest: {
                name: "Learn Japanese",
                short_name: "LearnJap",
                icons: [
                    {
                        src: "/pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any"
                    },
                    {
                        src: "/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any"
                    },
                    {
                        src: "/pwa-maskable-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "maskable"
                    },
                    {
                        src: "/pwa-maskable-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable"
                    }
                ],
                start_url: "/",
                display: "standalone",
                // background_color: "#bc002d",
                background_color: "#fff",
                theme_color: "#bc002d",
                description: "My app for learning Japanese vocabulary"
            },
            workbox: {
                runtimeCaching: [
                    {
                        // fonts
                        urlPattern: ({ request }) => request.destination === "font",
                        handler: "CacheFirst",
                        options: {
                            cacheName: "fonts"
                            // cacheableResponse: {
                            //   statuses: [0, 200]
                        }
                    },
                    {
                        // audio
                        urlPattern: ({ request }) => request.destination === "audio",
                        handler: "CacheFirst",
                        options: {
                            cacheName: "audio",
                            expiration: {
                                maxAgeSeconds: 60 * 60 * 24 * 365 * 2
                            }
                        }
                    }
                ]
            }
        })
    ]
})
