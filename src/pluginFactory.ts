import type { AtRule, Declaration, Plugin, Result, Root, Rule } from "postcss";
import type { Options } from "./types";
import { DEFAULT_OPTIONS, IGNORE_NEXT_COMMENT, IGNORE_PREV_COMMENT, PLUGIN_NAME } from "./constants";
import {
  createPropertiesListMatcher,
  createUnitReplaceFunction,
  doesDeclarationExist,
  getClosestRule,
  getStyleRules,
  getUnitFromOptions,
  getUnitRegexp,
  hasUnit,
  isInsideMediaQuery,
  shouldExcludeFile,
  shouldExcludeSelector,
  shouldExcludeSelectors,
} from "./utils";

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

  // Create a matcher function for allowed properties. Excluded properties work like negated entries.
  // 创建一个用于匹配允许属性的函数。排除的属性按带 `!` 的条目处理。
  const isAllowedProperty = createPropertiesListMatcher([
    ...options.allowedProperties,
    ...options.excludedProperties.map(property => `!${property}`),
  ]);

  return {
    postcssPlugin: PLUGIN_NAME,

    Once(css: Root, { result, AtRule }) {
      // Store landscape at-rules for later processing. Every file starts with an empty list.
      // 存储横向模式的 at-rules，以便后续处理。每个文件都从空列表开始。
      const landscapeAtRules: AtRule[] = [];
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
      css.walkRules((rule) => {
        const sourceFile = rule.source?.input.file || "";

        // Check if the rule should be excluded based on file path or selector
        // 检查是否应该根据文件路径或选择器排除该规则
        if (shouldExcludeFile(options, sourceFile) || shouldExcludeSelector(options, rule.selector)) {
          return undefined;
        }

        // Handle landscape mode if enabled. A rule nested in another rule is not copied on its own: the copy would lose the selector around it.
        // 如果启用了横向模式，则处理横向模式。嵌套在别的规则里的规则不单独复制：复制出去会丢掉外层的选择器。
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-expect-error
        if (options.enableLandscape && rule.parent?.type !== "rule" && !rule.parent?.params) {
          handleLandscapeMode(rule, options, sourceFile, landscapeAtRules, isAllowedProperty, unitRegexp, fileViewportWidth);
        }
      });

      // Every declaration goes through the same checks, keyframes included. The landscape copies above are taken before this.
      // 每条声明都经过同样的检查，关键帧也一样。上面的横向副本在这之前复制。
      css.walkDecls((declaration) => {
        processDeclaration(declaration, options, isAllowedProperty, unitRegexp, result, fileViewportWidth);
      });

      // Add landscape media query if necessary
      // 如果需要，添加横向媒体查询
      if (landscapeAtRules.length > 0) {
        addLandscapeMediaQuery(css, landscapeAtRules, AtRule);
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
): void {
  const landscapeRule = rule.clone().removeAll();

  rule.walkDecls((declaration: any) => {
    if (!hasUnit(declaration.value, options.unitType) || !isAllowedProperty(declaration.prop)) {
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
 * Process one declaration.
 * 处理一条声明。
 */
function processDeclaration(
  declaration: Declaration,
  options: Options,
  isAllowedProperty: (prop: string) => boolean,
  unitRegexp: RegExp,
  result: Result,
  fileViewportWidth?: number,
): void {
  // Declarations outside rules, such as the descriptors of @font-face, @page and @property, are not converted
  // 不在规则里的声明（比如 @font-face、@page、@property 的描述符）不转换
  const rule = getClosestRule(declaration);
  if (!rule) {
    return;
  }

  // Check if the declaration should be excluded based on file path
  // 检查是否应该根据文件路径排除该声明
  const sourceFile = declaration.source?.input.file || "";
  if (shouldExcludeFile(options, sourceFile)) {
    return;
  }

  // The selector lists apply to all the style rules around the declaration.
  // Keyframe selectors such as `from` and `50%` are not checked.
  // 选择器名单作用于声明外面的所有样式规则。`from`、`50%` 这类关键帧选择器不参与检查。
  const selectors = getStyleRules(declaration).map(styleRule => styleRule.selector);
  if (selectors.length > 0 && shouldExcludeSelectors(options, selectors)) {
    return;
  }

  // Declarations inside @media or @container, also when nested in a rule, are converted only with allowMediaQuery
  // 位于 @media 或 @container 里的声明（包括嵌套在规则里的情况），只有开启 allowMediaQuery 时才转换
  if (!options.allowMediaQuery && isInsideMediaQuery(declaration)) {
    return;
  }

  if (!hasUnit(declaration.value, options.unitType) || !isAllowedProperty(declaration.prop)) {
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

  if (options.replaceRules) {
    declaration.value = modifiedValue;
  } else if (!doesDeclarationExist(declaration.parent, declaration.prop, modifiedValue)) {
    // Only an added declaration can duplicate one that is already there.
    declaration.cloneAfter({ value: modifiedValue });
  }
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
  rule: Rule | AtRule,
  declaration: any,
  options: Options,
  sourceFile: string,
  fileViewportWidth?: number,
): { targetUnit: string; targetSize: number | undefined } {
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
function addLandscapeMediaQuery(css: Root, landscapeAtRules: AtRule[], AtRuleNode: typeof AtRule): void {
  // The node classes come with the helpers PostCSS passes to the plugin; Root has no AtRule on it.
  const landscapeMediaRule = new AtRuleNode({
    params: "(orientation: landscape)",
    name: "media",
    nodes: landscapeAtRules,
  });
  css.append(landscapeMediaRule);
}
