import type { Options } from "./types";
import { FontViewportUnitType, UnitType, ViewportUnitType } from "./types";

export const PLUGIN_NAME = "postcss-px-conversion";
export const IGNORE_PREV_COMMENT = "px-conversion-ignore-prev";
export const IGNORE_NEXT_COMMENT = "px-conversion-ignore-next";

export const DEFAULT_OPTIONS: Options = {
  unitType: UnitType.PX,
  viewportWidth: 320,
  unitPrecision: 5,
  allowedProperties: ["*"],
  excludedProperties: [],
  viewportUnit: ViewportUnitType.VW,
  fontViewportUnit: FontViewportUnitType.VW,
  selectorBlacklist: [],
  minPixelValue: 1,
  allowMediaQuery: false,
  replaceRules: true,
  excludeFiles: [],
  includeFiles: [],
  enableLandscape: false,
  landscapeUnit: ViewportUnitType.VW,
  landscapeViewportWidth: 568,
};
