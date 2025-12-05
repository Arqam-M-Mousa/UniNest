import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite config using Tailwind Vite plugin (no separate PostCSS config needed)
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
