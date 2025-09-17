import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /*
    he Vite proxy approach to avoid CORS issues entirely. 
    This is a clean solution - no CORS configuration needed on the backend 
    because the proxy makes all requests appear to come from the same origin.
    CORS is a browser security feature. The browser only cares about what domain 
    it thinks it's making the request to. Since the browser sees localhost:5173 
    (same as the current page), it doesn't trigger CORS checks.
    The actual forwarding to localhost:5000 happens on the server side (Vite dev server), 
    which doesn't have CORS restrictions.
    So the explanation is correct - from the browser's perspective, everything appears to be 
    happening on localhost:5173, which is why there are no CORS issues.
  */
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
      },
    },
  },
})
