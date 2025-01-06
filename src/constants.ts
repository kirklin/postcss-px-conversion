import type { Options } from "./types";

export const PLUGIN_NAME = "postcss-px-conversion";
export const IGNORE_PREV_COMMENT = "px-conversion-ignore-prev";
export const IGNORE_NEXT_COMMENT = "px-conversion-ignore-next";

/**
 * Constants for supported unit types.
 * 支持的单位类型常量。
 */
export const UNIT_TYPES = {
  PX: "px",
  EM: "em",
  REM: "rem",
} as const;

/**
 * Constants for supported viewport unit types.
 * 支持的视口单位类型常量。
 */
export const VIEWPORT_UNIT_TYPES = {
  VW: "vw",
  VH: "vh",
  VMIN: "vmin",
  VMAX: "vmax",
} as const;

/**
 * Constants for supported font viewport unit types.
 * 支持的字体视口单位类型常量。
 */
export const FONT_VIEWPORT_UNIT_TYPES = {
  VW: "vw",
  VH: "vh",
  VMIN: "vmin",
  VMAX: "vmax",
} as const;

export const DEFAULT_OPTIONS: Options = {
  unitType: UNIT_TYPES.PX,
  viewportWidth: 375,
  unitPrecision: 5,
  allowedProperties: ["*"],
  excludedProperties: [],
  viewportUnit: VIEWPORT_UNIT_TYPES.VW,
  fontViewportUnit: FONT_VIEWPORT_UNIT_TYPES.VW,
  selectorBlacklist: [],
  selectorWhitelist: [],
  minPixelValue: 1,
  allowMediaQuery: false,
  replaceRules: true,
  excludeFiles: [],
  includeFiles: [],
  enableLandscape: false,
  landscapeUnit: VIEWPORT_UNIT_TYPES.VW,
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
};
