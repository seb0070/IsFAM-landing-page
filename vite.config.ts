import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// "type": "module" 이라 __dirname 이 없다. 진입점은 URL 기준으로 푼다
const at = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      // input 을 지정하면 암묵적 루트 진입점이 사라진다. 한국어도 같이 적는다
      input: {
        main: at("index.html"),
        en: at("en/index.html"),
      },
    },
    // 두 페이지가 같은 CSS 17개를 쓴다. 쪼개면 같은 규칙이 두 벌로 나간다
    cssCodeSplit: false,
  },
});
