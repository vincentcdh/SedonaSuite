import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

// ===========================================
// SECURITY HEADERS PLUGIN
// ===========================================
function securityHeadersPlugin(): Plugin {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        // Prevent clickjacking
        res.setHeader('X-Frame-Options', 'DENY')
        // Prevent MIME type sniffing
        res.setHeader('X-Content-Type-Options', 'nosniff')
        // XSS protection (legacy browsers)
        res.setHeader('X-XSS-Protection', '1; mode=block')
        // Referrer policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        // Permissions policy
        res.setHeader(
          'Permissions-Policy',
          'camera=(), microphone=(), geolocation=(), payment=()'
        )
        // Content Security Policy (relaxed for dev)
        res.setHeader(
          'Content-Security-Policy',
          [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Vite HMR
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' ws: wss: http://localhost:* http://127.0.0.1:* https://*.supabase.co",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; ')
        )
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    securityHeadersPlugin(),
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Load .env files from monorepo root
  envDir: path.resolve(__dirname, '../..'),
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    sourcemap: true,
  },
  // Pre-bundle Radix UI packages from workspace packages
  optimizeDeps: {
    include: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
  },
})
