import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const PORT = process.env.PORT || 3000;
  
  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Live Torrent',
          short_name: 'Live Torrent',
          description: 'Search, explore and download torrent files online. Watch online YTS movies with subtitles.',
          theme_color: '#363e49',
          background_color: '#363e49',
          display: 'standalone',
          icons: [
            {
              src: 'img/icons/android-icon-36x36.png',
              sizes: '36x36',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'img/icons/android-icon-48x48.png',
              sizes: '48x48',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'img/icons/android-icon-72x72.png',
              sizes: '72x72',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'img/icons/android-icon-96x96.png',
              sizes: '96x96',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'img/icons/android-icon-144x144.png',
              sizes: '144x144',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'img/icons/android-icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/yts\..*\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'yts-api-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                }
              }
            }
          ]
        }
      })
    ],
    
    define: {
      'process.env': process.env
    },
    
    server: {
      port: 8080,
      proxy: {
        '/api': {
          target: `http://localhost:${PORT}`,
          changeOrigin: true,
        },
      },
    },
    
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia'],
            'vuetify': ['vuetify'],
            'axios': ['axios'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    
    optimizeDeps: {
      include: ['vuetify'],
    },
  };
});
