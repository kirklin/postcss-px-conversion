import type { Options } from "../types";
import { DEFAULT_OPTIONS, PLUGIN_NAME } from "../constants";

/**
 * Merge custom options into the default options. An option set to undefined keeps its default.
 * Then check that values in unitType can be converted to every target unit.
 * 将自定义选项合并到默认选项里。设为 undefined 的选项保留默认值。然后检查源单位能否换算成每个目标单位。
 */
export function resolveOptions(customOptions: Partial<Options>): Options {
  const options: Options = { ...DEFAULT_OPTIONS };
  for (const [key, value] of Object.entries(customOptions) as [keyof Options, unknown][]) {
    if (value !== undefined) {
      (options as Record<keyof Options, unknown>)[key] = value;
    }
  }

  checkTargetUnit(options, options.viewportUnit, "viewportUnit");
  checkTargetUnit(options, options.fontViewportUnit, "fontViewportUnit");
  if (options.enableLandscape) {
    checkTargetUnit(options, options.landscapeUnit, "landscapeUnit");
  }
  return options;
}

/**
 * Throw when values in unitType cannot be converted to targetUnit: px only comes from rem, and rem only from px.
 * 源单位无法换算成目标单位时抛出错误：px 只能由 rem 换算，rem 只能由 px 换算。
 */
export function checkTargetUnit(options: Options, targetUnit: string, optionName: string): void {
  const source = options.unitType.toLowerCase();
  const target = targetUnit.toLowerCase();
  if (source === target) {
    throw new TypeError(`[${PLUGIN_NAME}] ${optionName} is "${targetUnit}", the same unit as unitType`);
  }
  if (target === "px" && source !== "rem") {
    throw new TypeError(`[${PLUGIN_NAME}] ${optionName} "px" needs unitType "rem"; ${options.unitType} has no fixed size in px`);
  }
  if (target === "rem" && source !== "px") {
    throw new TypeError(`[${PLUGIN_NAME}] ${optionName} "rem" needs unitType "px"`);
  }
}
