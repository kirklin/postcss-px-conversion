import type { Plugin } from "postcss";
import type { ConversionContext, FontViewportUnitType, Options, UnitType, ViewportUnitType } from "./types";
import { plugin } from "./pluginFactory";

function postcssPlugin(opts: Partial<Options> = {}): Plugin {
  return plugin(opts);
}
// Tells PostCSS this is a plugin creator, so it also works when passed without being called.
// 告诉 PostCSS 这是插件创建函数，不调用直接传入也能用。
postcssPlugin.postcss = true as const;

// The CommonJS build exports the function itself, so its types travel on it as a namespace. The namespace
// refers to them through these aliases: written directly, `type Options = Options` would point at itself.
// CommonJS 产物导出的是函数本身，所以类型挂在函数上，以命名空间的形式提供。命名空间通过这些别名引用它们：
// 直接写成 `type Options = Options` 会指向自己。
type PluginOptions = Options;
type PluginUnitType = UnitType;
type PluginViewportUnitType = ViewportUnitType;
type PluginFontViewportUnitType = FontViewportUnitType;
type PluginConversionContext = ConversionContext;

// eslint-disable-next-line ts/no-namespace
declare namespace postcssPlugin {
  export type Options = PluginOptions;
  export type UnitType = PluginUnitType;
  export type ViewportUnitType = PluginViewportUnitType;
  export type FontViewportUnitType = PluginFontViewportUnitType;
  export type ConversionContext = PluginConversionContext;
}

export default postcssPlugin;
