import { defineConfig } from "vite";
import path from "path";
import wasm from 'vite-plugin-wasm';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    mode === 'development' && wasm(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));