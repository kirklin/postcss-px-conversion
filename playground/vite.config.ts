import { fileURLToPath, URL } from "node:url";
import Vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import PostcssPXConversion from "../src/index";

export default defineConfig({
  server: {
    port: 8888,
    open: true,
  },
  plugins: [
    Vue(),
  ],
  resolve: {
    alias: {
      "~/": fileURLToPath(new URL("./src/", import.meta.url)),
    },
  },
  css: {
    postcss: {
      plugins: [
        PostcssPXConversion({
          viewportWidth: 750,
          selectorBlacklist: ["ignore-this"],
        }),
      ],
    },
  },
});
