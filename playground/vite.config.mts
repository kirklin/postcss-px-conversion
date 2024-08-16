import { resolve } from "node:path";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import PostcssPXConversion from "../src/index";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "localhost",
    port: 8888,
    open: true,
    https: false,
    proxy: {},
  },
  plugins: [
    Vue(),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "vue-i18n",
        "vue/macros",
      ],
      dts: "types/auto-imports.d.ts",
      dirs: [
        "src/composables",
        "src/store",
      ],
      vueTemplate: true,
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      extensions: ["vue"],
      include: [/\.vue$/, /\.vue\?vue/],
      dts: "types/components.d.ts",
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
    }),
  ],
  resolve: {
    alias: {
      "~/": `${resolve(__dirname, "src")}/`,
    },
  },
  css: {
    postcss: {
      plugins: [
        PostcssPXConversion({
          unitType: "px",
          viewportWidth: 750,
          unitPrecision: 5,
          allowedProperties: ["*"],
          excludedProperties: [],
          viewportUnit: "vw",
          fontViewportUnit: "vw",
          selectorBlacklist: ["ignore-this"],
          minPixelValue: 1,
          allowMediaQuery: false,
          replaceRules: true,
          excludeFiles: [],
          includeFiles: [],
          enableLandscape: false,
          landscapeUnit: "vw",
          landscapeViewportWidth: 568,
          /**
           * Enable per-file viewport width configuration.
           * 启用每个文件的视口宽度配置。
           */
          enablePerFileConfig: true,

          /**
           * The comment used to specify viewport width in a file.
           * 用于在文件中指定视口宽度的注释。
           */
          viewportWidthComment: "viewport-width",
          // Other configuration options...
        }),
      ],
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
      @import "~/styles/variables.scss";
    `,
        javascriptEnabled: true,
      },
    },
  },
  // https://github.com/vitest-dev/vitest
  test: {
    environment: "jsdom",
  },
});
