import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [VitePWA({

        registerType: 'autoUpdate', // SW updates automatically
        workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
            clientsClaim: true,
            skipWaiting: true,
            maximumFileSizeToCacheInBytes: 4000000,

            // Keep SPA fallback for root-only (or non-HTML paths), not for MPA HTML files
            navigateFallback: '/index.html',
            // Only use the fallback for "/" and “directory-like” routes without .html
            navigateFallbackAllowlist: [
                /^\/$/,                 // root
                /^\/(?!.*\.html$).*/    // anything that's not an explicit .html file
            ],

            // Ensure query params don’t break precache matches
            ignoreURLParametersMatching: [
                /^utm_/,
                /^fbclid$/,
                /^storyId$/,
                /^step$/
            ],
        },
        manifest: {
            name: 'AI Teacher Tool: Story Generator',
            short_name: 'Story Gen',
            start_url: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#ffffff',
            icons: [
                // {
                //     src: '/pwa-192x192.png',
                //     sizes: '192x192',
                //     type: 'image/png'
                // },
                // {
                //     src: '/pwa-512x512.png',
                //     sizes: '512x512',
                //     type: 'image/png'
                // }
            ]
        },
        devOptions: {
            enabled: true // so you can test SW in dev mode
        }
    })],
    build: {
        target: 'es2022',
        rollupOptions: {
            input: {
                main: 'index.html',
                print: 'print.html',
                dashboard: 'dashboard.html',
                wizard: 'wizard.html',
            }
        }
    },

    optimizeDeps: {
        include: ['dexie','rxjs','marked','lit'],
        force: true
    },
    esbuild: {
        target: 'es2022'
    }
});
