import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This is the key! It makes Vite listen on 0.0.0.0 (all interfaces)
    port: 5173, // Ensure this matches your desired port
    // You might also need hmr: { host: '192.168.1.68', port: 5173 } for Hot Module Replacement,
    // but the host: true should resolve basic connectivity.
  },
});
