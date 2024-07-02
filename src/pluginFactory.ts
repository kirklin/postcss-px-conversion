import type { AtRule, Plugin, Result, Root, Rule } from "postcss";
import type { Options } from "./types";
import {
  createPropertiesListMatcher,
  createUnitReplaceFunction,
  doesDeclarationExist,
  getUnitFromOptions,
  getUnitRegexp,
  isBlacklistedSelector,
  shouldExclude,
  validateMediaQueryParams,
} from "./utils";
import { DEFAULT_OPTIONS, IGNORE_NEXT_COMMENT, IGNORE_PREV_COMMENT, PLUGIN_NAME } from "./constants";

/**
 * Create a PostCSS plugin for converting pixel units to viewport units.
 * 创建一个 PostCSS 插件，用于将像素单位转换为视口单位。
 *
 * @param customOptions - Custom options to override default options
 * @returns PostCSS plugin
 */
export function plugin(customOptions: Partial<Options> = {}): Plugin {
  // Merge default options with custom options
  // 将默认选项与自定义选项合并
  const options: Options = { ...DEFAULT_OPTIONS, ...customOptions };

  // Get the regular expression for matching the unit type
  // 获取用于匹配单位类型的正则表达式
  const unitRegexp = getUnitRegexp(options.unitType);

  // Create a matcher function for allowed properties
  // 创建一个用于匹配允许属性的函数
  const isAllowedProperty = createPropertiesListMatcher(options.allowedProperties);

  // Store landscape at-rules for later processing
  // 存储横向模式的 at-rules，以便后续处理
  const landscapeAtRules: AtRule[] = [];

  return {
    postcssPlugin: PLUGIN_NAME,

    Once(css: Root, { result }) {
      let fileViewportWidth: number | undefined;

      // 检查文件开头是否有视口宽度配置
      if (options.enablePerFileConfig) {
        css.walkComments((comment) => {
          if (comment.text.startsWith(options.viewportWidthComment)) {
            const widthMatch = comment.text.match(/(\d+)/);
            if (widthMatch) {
              fileViewportWidth = Number.parseInt(widthMatch[1], 10);
              // comment.remove(); // 移除配置注释
              return false; // 停止遍历
            }
          }
        });
      }
      css.walkAtRules("keyframes", (atRule) => {
        atRule.walkDecls((decl) => {
          if (decl.value.includes(options.unitType)) {
            const sourceFile = atRule.source?.input.file || "";
            const { targetUnit, targetSize } = getTargetUnitAndSize(atRule, decl, options, sourceFile, fileViewportWidth);

            if (targetSize) {
              decl.value = decl.value.replace(
                unitRegexp,
                createUnitReplaceFunction(options, targetUnit!, targetSize),
              );
            }
          }
        });
      });

      css.walkRules((rule) => {
        const sourceFile = rule.source?.input.file || "";

        // Check if the rule should be excluded based on file path or selector
        // 检查是否应该根据文件路径或选择器排除该规则
        if (shouldExclude(options, sourceFile) || isBlacklistedSelector(rule.selector, options.selectorBlacklist)) {
          return undefined;
        }

        // Handle landscape mode if enabled
        // 如果启用了横向模式，则处理横向模式
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-expect-error
        if (options.enableLandscape && !rule.parent?.params) {
          handleLandscapeMode(rule, options, sourceFile, landscapeAtRules, isAllowedProperty, unitRegexp, fileViewportWidth);
        }

        // Validate media query parameters
        // 验证媒体查询参数
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-expect-error
        if (!validateMediaQueryParams(rule.parent?.params, options.allowMediaQuery)) {
          return;
        }

        // Process declarations within the rule
        // 处理规则内的声明
        processDeclarations(rule, options, sourceFile, isAllowedProperty, unitRegexp, result, fileViewportWidth);
      });
    },

    OnceExit(css: Root) {
      // Add landscape media query if necessary
      // 如果需要，添加横向媒体查询
      if (landscapeAtRules.length > 0) {
        addLandscapeMediaQuery(css, landscapeAtRules);
      }
    },
  };
}

/**
 * Handle landscape mode for a given rule.
 * 处理给定规则的横向模式。
 */
function handleLandscapeMode(
  rule: Rule,
  options: Options,
  sourceFile: string,
  landscapeAtRules: AtRule[],
  isAllowedProperty: (prop: string) => boolean,
  unitRegexp: RegExp,
  fileViewportWidth?: number,
) {
  const landscapeRule = rule.clone().removeAll();

  rule.walkDecls((declaration: any) => {
    if (!declaration.value.includes(options.unitType) || !isAllowedProperty(declaration.prop)) {
      return;
    }

    const landscapeSize = getLandscapeSize(options, sourceFile, fileViewportWidth);
    if (!landscapeSize) {
      return;
    }

    landscapeRule.append(
      declaration.clone({
        value: declaration.value.replace(
          unitRegexp,
          createUnitReplaceFunction(options, options.landscapeUnit, landscapeSize),
        ),
      }),
    );
  });

  if (landscapeRule.nodes.length > 0) {
    landscapeAtRules.push(landscapeRule as unknown as AtRule);
  }
}

/**
 * Get the landscape size based on options.
 * 根据选项获取横向尺寸。
 */
function getLandscapeSize(options: Options, sourceFile: string, fileViewportWidth?: number): number | undefined {
  if (fileViewportWidth) {
    return fileViewportWidth;
  }
  if (typeof options.landscapeViewportWidth === "function") {
    return options.landscapeViewportWidth(sourceFile);
  }
  return options.landscapeViewportWidth;
}

/**
 * Process declarations within a rule.
 * 处理规则内的声明。
 */
function processDeclarations(
  rule: Rule,
  options: Options,
  sourceFile: string,
  isAllowedProperty: (prop: string) => boolean,
  unitRegexp: RegExp,
  result: Result,
  fileViewportWidth?: number,
) {
  rule.walkDecls((declaration, index: number) => {
    if (!declaration.value.includes(options.unitType) || !isAllowedProperty(declaration.prop)) {
      return;
    }

    if (shouldIgnoreDeclaration(declaration, result)) {
      return;
    }

    const { targetUnit, targetSize } = getTargetUnitAndSize(rule, declaration, options, sourceFile, fileViewportWidth);
    if (!targetSize) {
      return;
    }

    const modifiedValue = declaration.value.replace(
      unitRegexp,
      createUnitReplaceFunction(options, targetUnit!, targetSize),
    );

    if (doesDeclarationExist(declaration.parent, declaration.prop, modifiedValue)) {
      return;
    }

    if (options.replaceRules) {
      declaration.value = modifiedValue;
    } else {
      declaration.parent?.insertAfter(index, declaration.clone({ value: modifiedValue }));
    }
  });
}

/**
 * Check if a declaration should be ignored based on comments.
 * 根据注释检查是否应忽略声明。
 */
function shouldIgnoreDeclaration(declaration: any, result: any): boolean {
  const prevComment = declaration.prev();
  if (prevComment && prevComment.type === "comment" && prevComment.text === IGNORE_NEXT_COMMENT) {
    prevComment.remove();
    return true;
  }

  const nextComment = declaration.next();
  if (nextComment && nextComment.type === "comment" && nextComment.text === IGNORE_PREV_COMMENT) {
    if (/\n/.test(nextComment.raws.before!)) {
      result.warn(
          `Unexpected comment /* ${IGNORE_PREV_COMMENT} */ must be after declaration at the same line.`,
          { node: nextComment },
      );
    } else {
      nextComment.remove();
      return true;
    }
  }

  return false;
}

function getTargetUnitAndSize(
  rule: Rule,
  declaration: any,
  options: Options,
  sourceFile: string,
  fileViewportWidth?: number,
) {
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  const parentParams = rule.parent?.params;

  if (options.enableLandscape && parentParams && parentParams.includes("landscape")) {
    return {
      targetUnit: options.landscapeUnit,
      targetSize: getLandscapeSize(options, sourceFile, fileViewportWidth),
    };
  } else {
    return {
      targetUnit: getUnitFromOptions(declaration.prop, options),
      targetSize: getViewportSize(options, sourceFile, fileViewportWidth),
    };
  }
}

/**
 * Get the viewport size based on options.
 * 根据选项获取视口尺寸。
 */
function getViewportSize(options: Options, sourceFile: string, fileViewportWidth?: number): number | undefined {
  if (fileViewportWidth) {
    return fileViewportWidth;
  }
  if (typeof options.viewportWidth === "function") {
    return options.viewportWidth(sourceFile);
  }
  return options.viewportWidth;
}

/**
 * Add landscape media query to the CSS.
 * 向 CSS 添加横向媒体查询。
 */
function addLandscapeMediaQuery(css: Root, landscapeAtRules: AtRule[]) {
  const landscapeMediaRule = new (css.constructor as any).AtRule({
    params: "(orientation: landscape)",
    name: "media",
    nodes: landscapeAtRules,
  });
  css.append(landscapeMediaRule);
}
