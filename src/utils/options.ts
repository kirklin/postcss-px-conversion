import type { Options } from "../types";
import { DEFAULT_OPTIONS } from "../constants";

/**
 * Merge custom options into the default options. An option set to undefined keeps its default.
 * 将自定义选项合并到默认选项里。设为 undefined 的选项保留默认值。
 */
export function resolveOptions(customOptions: Partial<Options>): Options {
  const options: Options = { ...DEFAULT_OPTIONS };
  for (const [key, value] of Object.entries(customOptions) as [keyof Options, unknown][]) {
    if (value !== undefined) {
      (options as Record<keyof Options, unknown>)[key] = value;
    }
  }
  return options;
}
