import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production optimizations
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps in production for security
    minify: 'terser',
    cssMinify: true,
    
    // Terser options for better compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.* statements
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false, // Remove comments
      },
    },
    
    // Rollup options for code splitting and optimization
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Component libraries
          'radix-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-toast',
            '@radix-ui/react-switch',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-slider',
            '@radix-ui/react-progress'
          ],
          
          // Data visualization
          'charts-vendor': ['recharts', 'd3-array', 'd3-scale', 'd3-shape', 'd3-time', 'd3-color'],
          
          // Data fetching and state management
          'query-vendor': ['@tanstack/react-query'],
          
          // Backend services
          'supabase-vendor': ['@supabase/supabase-js'],
          
          // Icons and styling
          'icons-vendor': ['lucide-react'],
          
          // Document generation
          'pdf-vendor': ['jspdf', 'html2canvas', 'qrcode'],
          
          // Utilities
          'utils-vendor': [
            'date-fns', 
            'clsx', 
            'tailwind-merge', 
            'zod',
            'class-variance-authority'
          ],
          
          // Form handling
          'forms-vendor': ['react-hook-form', '@hookform/resolvers'],
          
          // UI Enhancement libraries
          'ui-vendor': [
            'sonner',
            'vaul',
            'cmdk',
            'react-day-picker',
            'react-dropzone',
            'embla-carousel-react',
            'input-otp'
          ]
        },
        
        // Asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|gif|svg|ico|webp|avif)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          if (ext === 'css') {
            return `assets/css/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
      
      // External dependencies (if using CDN)
      external: [
        // Uncomment if you want to load these from CDN
        // 'react',
        // 'react-dom'
      ],
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable/disable CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: true,
    
    // Emit manifest for deployment
    manifest: true,
  },
  
  // Production preview server configuration
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
  },
  
  // Environment variables handling
  envPrefix: 'VITE_',
  
  // Define global constants for production
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __PROD__: true,
    __DEV__: false,
  },
  
  // Experimental features
  experimental: {
    renderBuiltUrl(filename: string, { hostType }: { hostType: 'js' | 'css' | 'html' }) {
      // Custom URL handling for different hosting environments
      if (hostType === 'js') {
        return { js: `assets/js/${filename}` };
      }
      return { relative: true };
    },
  },
});
