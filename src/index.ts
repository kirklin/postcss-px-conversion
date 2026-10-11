import type { Plugin } from "postcss";
import type { Options } from "./types";
import { plugin } from "./pluginFactory";

function postcssPlugin(opts: Partial<Options> = {}): Plugin {
  return plugin(opts);
}
// Tells PostCSS this is a plugin creator, so it also works when passed without being called.
// 告诉 PostCSS 这是插件创建函数，不调用直接传入也能用。
postcssPlugin.postcss = true as const;

export default postcssPlugin;
