/**
 * Enum for supported unit types.
 * 支持的单位类型的枚举。
 */
export enum UnitType {
  PX = "px",
  // You can add more unit types here
}

/**
 * Enum for supported viewport unit types.
 * 支持的视口单位类型的枚举。
 */
export enum ViewportUnitType {
  VW = "vw",
  VH = "vh",
  VMIN = "vmin",
  VMAX = "vmax",
  // You can add more viewport unit types here
}

/**
 * Enum for supported font viewport unit types.
 * 支持的字体视口单位类型的枚举。
 */
export enum FontViewportUnitType {
  VW = "vw",
  VH = "vh",
  VMIN = "vmin",
  VMAX = "vmax",
  // You can add more font viewport unit types here
}

/**
 * Configuration options for the pixel to viewport unit conversion.
 * 像素到视口单位转换的配置选项。
 */
export interface Options {
  /**
   * The unit to convert to, default is 'px'.
   * 要转换的单位，默认为'px'。
   */
  unitType: UnitType;

  /**
   * The width of the viewport.
   * 视口的宽度。
   */
  viewportWidth: number | ((filePath: string) => number | undefined);

  /**
   * The number of decimal places allowed for vw units.
   * 允许vw单位的最小精度。
   */
  unitPrecision: number;

  /**
   * List of properties that can be converted to vw.
   * 可以转化为vw的属性列表。
   */
  allowedProperties: string[];

  /**
   * List of properties to exclude from conversion.
   * 不希望转换的属性列表。
   */
  excludedProperties: string[];

  /**
   * Expected viewport unit.
   * 期望的视口单位。
   */
  viewportUnit: ViewportUnitType;

  /**
   * Expected font unit.
   * 字体的期望单位。
   */
  fontViewportUnit: FontViewportUnitType;

  /**
   * Selectors to ignore, can include strings or regular expressions.
   * 要忽略的选择器，可以包含字符串或正则表达式。
   */
  selectorBlacklist: (string | RegExp)[];

  /**
   * Minimum pixel value to replace.
   * 设置最小的像素值以进行替换。
   */
  minPixelValue: number;

  /**
   * Allow px to vw conversion in media queries.
   * 允许在媒体查询中进行px到vw的转换。
   */
  allowMediaQuery: boolean;

  /**
   * Replace rules containing vw instead of adding fallbacks.
   * 替换包含vw的规则而不是添加回退。
   */
  replaceRules: boolean;

  /**
   * Files to ignore as an array of regular expressions.
   * 要忽略的文件，作为正则表达式的数组。
   */
  excludeFiles: (string | RegExp)[];

  /**
   * Only convert matching files as an array of regular expressions.
   * 仅转换匹配的文件，作为正则表达式的数组。
   */
  includeFiles: (string | RegExp)[];

  /**
   * Add @media (orientation: landscape) to convert values obtained through landscapeWidth.
   * 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
   */
  enableLandscape: boolean;

  /**
   * Expected unit for landscape mode.
   * 横向模式下的期望单位。
   */
  landscapeUnit: ViewportUnitType;

  /**
   * Viewport width for landscape orientation.
   * 横向模式下的视口宽度。
   */
  landscapeViewportWidth: number | ((filePath: string) => number | undefined);

  /**
   * Enable per-file viewport width configuration.
   * 启用每个文件的视口宽度配置。
   */
  enablePerFileConfig: boolean;

  /**
   * The comment used to specify viewport width in a file.
   * 用于在文件中指定视口宽度的注释。
   */
  viewportWidthComment: string;
}
