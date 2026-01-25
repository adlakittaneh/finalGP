import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    https: {
      key: fs.readFileSync("./local.easyaqar.org-key.pem"),
      cert: fs.readFileSync("./local.easyaqar.org.pem"),
    },
    host: "local.easyaqar.org", // بدل "::"
    port: 8081,
    cors: true,
    proxy: {
    '/api': {
      target: 'http://easyaqar.org', // أو أي رابط الـ API HTTP
      changeOrigin: true,
      secure: false,
    }
  },
    allowedHosts: ["local.easyaqar.org","easyaqar.org"],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

