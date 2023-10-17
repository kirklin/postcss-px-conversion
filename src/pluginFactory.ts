import type { Plugin } from "postcss";
import type { Options } from "./types";

const PLUGIN_NAME = "postcss-px-conversion";

export const plugin = (opts: Partial<Options> = {}): Plugin => {
  return {
    postcssPlugin: PLUGIN_NAME,
    OnceExit(css, { result }) {
    },
  };
};
