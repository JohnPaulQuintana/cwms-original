import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   host: true, // allows access from external IPs / tunnels
  //   port: 5173, // or your custom port
  //   allowedHosts: [
  //     'localhost',
  //     '192.168.1.110',
  //     '.trycloudflare.com', // allow Cloudflare Tunnel
  //   ],
  // },
})
