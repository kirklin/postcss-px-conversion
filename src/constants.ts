import type { Options } from "./types";

export const PLUGIN_NAME = "postcss-px-conversion";
export const IGNORE_PREV_COMMENT = "px-conversion-ignore-prev";
export const IGNORE_NEXT_COMMENT = "px-conversion-ignore-next";

export const DEFAULT_OPTIONS: Options = {
  unitType: 'px',
  viewportWidth: 375,
  unitPrecision: 5,
  allowedProperties: ["*"],
  excludedProperties: [],
  viewportUnit: 'vw',
  fontViewportUnit: 'vw',
  selectorBlacklist: [],
  minPixelValue: 1,
  allowMediaQuery: false,
  replaceRules: true,
  excludeFiles: [],
  includeFiles: [],
  enableLandscape: false,
  landscapeUnit: 'vw',
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
