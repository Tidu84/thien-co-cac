import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    define: {
      'process.env.API_KEY': JSON.stringify('api-key-this-is-not-used-can-be-ignored!'),
    },
    server: {
      proxy: {
        '/api-proxy': 'http://localhost:5000',
        '/ws-proxy': { target: 'ws://localhost:5000', ws: true },
        '/tts-stream': {
          target: 'https://translate.google.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/tts-stream/, '/translate_tts'),
          headers: {
            'Referer': '',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        }
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      }
    },
    build: {
      chunkSizeWarningLimit: 900,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-firebase',
                test: /node_modules[\\/]@?firebase/,
              },
              {
                name: 'vendor-genai',
                test: /node_modules[\\/]@google[\\/]genai/,
              },
              {
                name: 'vendor-react',
                test: /node_modules[\\/](react|react-dom|scheduler)/,
              },
            ],
          },
        },
      },
    }
  };
});
