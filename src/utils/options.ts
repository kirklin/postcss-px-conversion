import type { Options } from "../types";
import { DEFAULT_OPTIONS, PLUGIN_NAME } from "../constants";

/**
 * Merge custom options into the default options. An option set to undefined keeps its default.
 * Then check every option, and that values in unitType can be converted to every target unit.
 * 将自定义选项合并到默认选项里。设为 undefined 的选项保留默认值。然后检查每个选项，以及源单位能否换算成每个目标单位。
 */
export function resolveOptions(customOptions: Partial<Options>): Options {
  const options: Options = { ...DEFAULT_OPTIONS };
  for (const [key, value] of Object.entries(customOptions) as [keyof Options, unknown][]) {
    if (value !== undefined) {
      (options as Record<keyof Options, unknown>)[key] = value;
    }
  }

  checkUnit(options.unitType, "unitType");
  checkWidth(options.viewportWidth, "viewportWidth");
  checkPositiveNumber(options.rootValue, "rootValue");
  if (!Number.isInteger(options.unitPrecision) || options.unitPrecision < 0) {
    fail(`unitPrecision must be a whole number of 0 or more, received ${String(options.unitPrecision)}`);
  }
  checkStrings(options.allowedProperties, "allowedProperties");
  checkStrings(options.excludedProperties, "excludedProperties");
  checkUnit(options.viewportUnit, "viewportUnit");
  checkUnit(options.fontViewportUnit, "fontViewportUnit");
  checkPatterns(options.selectorBlacklist, "selectorBlacklist");
  checkPatterns(options.selectorWhitelist, "selectorWhitelist");
  if (typeof options.minPixelValue !== "number" || Number.isNaN(options.minPixelValue)) {
    fail(`minPixelValue must be a number, received ${String(options.minPixelValue)}`);
  }
  checkBoolean(options.allowMediaQuery, "allowMediaQuery");
  checkBoolean(options.replaceRules, "replaceRules");
  checkPatterns(options.excludeFiles, "excludeFiles");
  checkPatterns(options.includeFiles, "includeFiles");
  checkBoolean(options.enableLandscape, "enableLandscape");
  if (options.enableLandscape) {
    checkUnit(options.landscapeUnit, "landscapeUnit");
    checkWidth(options.landscapeViewportWidth, "landscapeViewportWidth");
  }
  checkBoolean(options.enablePerFileConfig, "enablePerFileConfig");
  if (typeof options.viewportWidthComment !== "string" || options.viewportWidthComment.length === 0) {
    fail("viewportWidthComment must be a non-empty string");
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
    fail(`${optionName} is "${targetUnit}", the same unit as unitType`);
  }
  if (target === "px" && source !== "rem") {
    fail(`${optionName} "px" needs unitType "rem"; ${options.unitType} has no fixed size in px`);
  }
  if (target === "rem" && source !== "px") {
    fail(`${optionName} "rem" needs unitType "px"`);
  }
}

function fail(message: string): never {
  throw new TypeError(`[${PLUGIN_NAME}] ${message}`);
}

function checkPositiveNumber(value: unknown, name: string): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    fail(`${name} must be a number greater than 0, received ${String(value)}`);
  }
}

/**
 * A width is a number greater than 0, or a function that returns one.
 * 宽度是大于 0 的数，或者返回这样一个数的函数。
 */
function checkWidth(value: unknown, name: string): void {
  if (typeof value !== "function") {
    checkPositiveNumber(value, name);
  }
}

function checkUnit(value: unknown, name: string): void {
  if (typeof value !== "string" || !/^[a-z]+$/i.test(value)) {
    fail(`${name} must be a CSS unit such as "px" or "vw", received ${String(value)}`);
  }
}

function checkBoolean(value: unknown, name: string): void {
  if (typeof value !== "boolean") {
    fail(`${name} must be true or false, received ${String(value)}`);
  }
}

function checkStrings(value: unknown, name: string): void {
  if (!Array.isArray(value) || !value.every(item => typeof item === "string")) {
    fail(`${name} must be an array of strings`);
  }
}

function checkPatterns(value: unknown, name: string): void {
  if (!Array.isArray(value) || !value.every(item => typeof item === "string" || item instanceof RegExp)) {
    fail(`${name} must be an array of strings and regular expressions`);
  }
}
