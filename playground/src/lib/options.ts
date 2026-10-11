import type { Options } from "../../../src/types";
import { DEFAULT_OPTIONS } from "../../../src/constants";

// Every plugin option the playground can set. Width functions have no form here, so widths are plain numbers.
export interface PlaygroundOptions {
  unitType: string;
  viewportWidth: number;
  rootValue: number;
  unitPrecision: number;
  allowedProperties: string[];
  excludedProperties: string[];
  viewportUnit: string;
  fontViewportUnit: string;
  selectorBlacklist: string[];
  selectorWhitelist: string[];
  minPixelValue: number;
  allowMediaQuery: boolean;
  replaceRules: boolean;
  excludeFiles: string[];
  includeFiles: string[];
  enableLandscape: boolean;
  landscapeUnit: string;
  landscapeViewportWidth: number;
  enablePerFileConfig: boolean;
  viewportWidthComment: string;
}

export type OptionKey = keyof PlaygroundOptions;

type KeysWith<T> = { [K in OptionKey]: PlaygroundOptions[K] extends T ? K : never }[OptionKey];
export type NumberKey = KeysWith<number>;
export type BooleanKey = KeysWith<boolean>;
export type ListKey = KeysWith<string[]>;
export type StringKey = KeysWith<string>;

export const UNIT_CHOICES = ["vw", "vh", "vmin", "vmax", "rem", "rpx", "px"] as const;
export const SOURCE_UNITS = ["px", "rem"] as const;
export const DEFAULT_FILE = "src/style.css";

// Lists whose entries written as `/pattern/flags` are regular expressions
const PATTERN_KEYS = new Set<OptionKey>(["selectorBlacklist", "selectorWhitelist", "excludeFiles", "includeFiles"]);
const REGEXP_ENTRY = /^\/(.+)\/([dgimsuvy]*)$/;

function numberDefault(value: Options["viewportWidth"]): number {
  if (typeof value !== "number") {
    throw new TypeError("The playground needs number defaults for the widths");
  }
  return value;
}

function listDefault(list: (string | RegExp)[]): string[] {
  return list.map(entry => typeof entry === "string" ? entry : String(entry));
}

export const DEFAULT_PLAYGROUND_OPTIONS: Readonly<PlaygroundOptions> = Object.freeze({
  unitType: DEFAULT_OPTIONS.unitType,
  viewportWidth: numberDefault(DEFAULT_OPTIONS.viewportWidth),
  rootValue: DEFAULT_OPTIONS.rootValue,
  unitPrecision: DEFAULT_OPTIONS.unitPrecision,
  allowedProperties: [...DEFAULT_OPTIONS.allowedProperties],
  excludedProperties: [...DEFAULT_OPTIONS.excludedProperties],
  viewportUnit: DEFAULT_OPTIONS.viewportUnit,
  fontViewportUnit: DEFAULT_OPTIONS.fontViewportUnit,
  selectorBlacklist: listDefault(DEFAULT_OPTIONS.selectorBlacklist),
  selectorWhitelist: listDefault(DEFAULT_OPTIONS.selectorWhitelist),
  minPixelValue: DEFAULT_OPTIONS.minPixelValue,
  allowMediaQuery: DEFAULT_OPTIONS.allowMediaQuery,
  replaceRules: DEFAULT_OPTIONS.replaceRules,
  excludeFiles: listDefault(DEFAULT_OPTIONS.excludeFiles),
  includeFiles: listDefault(DEFAULT_OPTIONS.includeFiles),
  enableLandscape: DEFAULT_OPTIONS.enableLandscape,
  landscapeUnit: DEFAULT_OPTIONS.landscapeUnit,
  landscapeViewportWidth: numberDefault(DEFAULT_OPTIONS.landscapeViewportWidth),
  enablePerFileConfig: DEFAULT_OPTIONS.enablePerFileConfig,
  viewportWidthComment: DEFAULT_OPTIONS.viewportWidthComment,
});

export function createOptions(overrides: Partial<PlaygroundOptions> = {}): PlaygroundOptions {
  return structuredClone({ ...DEFAULT_PLAYGROUND_OPTIONS, ...overrides });
}

export function isRegExpEntry(entry: string): boolean {
  return REGEXP_ENTRY.test(entry);
}

export function isPatternList(key: OptionKey): boolean {
  return PATTERN_KEYS.has(key);
}

export function toPattern(entry: string): string | RegExp {
  const match = REGEXP_ENTRY.exec(entry);
  return match ? new RegExp(match[1], match[2]) : entry;
}

export function toPluginOptions(options: PlaygroundOptions): Options {
  return {
    ...options,
    selectorBlacklist: options.selectorBlacklist.map(toPattern),
    selectorWhitelist: options.selectorWhitelist.map(toPattern),
    excludeFiles: options.excludeFiles.map(toPattern),
    includeFiles: options.includeFiles.map(toPattern),
  };
}

export function isDefault<K extends OptionKey>(key: K, value: PlaygroundOptions[K]): boolean {
  return JSON.stringify(value) === JSON.stringify(DEFAULT_PLAYGROUND_OPTIONS[key]);
}

export function formatValue<K extends OptionKey>(key: K, value: PlaygroundOptions[K]): string {
  if (Array.isArray(value)) {
    const entries = value.map(entry => isPatternList(key) && isRegExpEntry(entry) ? entry : JSON.stringify(entry));
    return `[${entries.join(", ")}]`;
  }
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

// The PostCSS config for the current options, listing only the options that differ from the defaults
export function configSnippet(options: PlaygroundOptions): string {
  const entries = (Object.keys(DEFAULT_PLAYGROUND_OPTIONS) as OptionKey[])
    .filter(key => !isDefault(key, options[key]))
    .map(key => `      ${key}: ${formatValue(key, options[key])},`);
  const call = entries.length === 0
    ? "postcssPxConversion()"
    : `postcssPxConversion({\n${entries.join("\n")}\n    })`;
  return [
    "// postcss.config.mjs",
    "import postcssPxConversion from \"postcss-px-conversion\";",
    "",
    "export default {",
    "  plugins: [",
    `    ${call},`,
    "  ],",
    "};",
    "",
  ].join("\n");
}

// The plugin converts px only from rem and rem only from px, so the other pairs are offered as disabled
export function unsupportedTarget(unitType: string, target: string): "px" | "rem" | "same" | undefined {
  if (unitType === target) {
    return "same";
  }
  if (target === "px" && unitType !== "rem") {
    return "px";
  }
  if (target === "rem" && unitType !== "px") {
    return "rem";
  }
  return undefined;
}
