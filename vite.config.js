import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        puraXAiAwakening: fileURLToPath(
          new URL("./pura-x-ai-awakening/index.html", import.meta.url)
        ),
        dataCollection: fileURLToPath(new URL("./data-collection/index.html", import.meta.url)),
        voiceOrderDemo: fileURLToPath(new URL("./voice-order-demo/index.html", import.meta.url)),
      },
    },
  },
});
