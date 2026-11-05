import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({
        pages: "build",
        assets: "build",
        fallback: null,
        strict: true,
      }),
      compilerOptions: {
        runes: true,
      },
    }),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
});
