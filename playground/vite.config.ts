import { fileURLToPath, URL } from "node:url";
import Vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import packageJson from "../package.json";

export default defineConfig({
  server: {
    port: 8888,
    open: true,
  },
  plugins: [
    Vue(),
  ],
  define: {
    __PLUGIN_VERSION__: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      // A "~/" key only matches once Vite trims it to "~", which it skips on Windows where the folder path ends in "\"
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
