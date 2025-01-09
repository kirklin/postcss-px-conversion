import { presetAttributify, presetIcons, presetUno, transformerDirectives, transformerVariantGroup } from "unocss";
import presetChinese from "unocss-preset-chinese";
import presetEase from "unocss-preset-ease";
import { defineConfig } from "unocss/vite";

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetChinese(),
    presetEase(),
    presetIcons({
      scale: 1.5,
      warn: true,
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
});
