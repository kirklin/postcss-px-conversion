import type { AtRule, Comment, Container, Declaration, Plugin, Result, Root, Rule } from "postcss";
import type { ConversionContext, Options } from "./types";
import { IGNORE_NEXT_COMMENT, IGNORE_PREV_COMMENT, PLUGIN_NAME } from "./constants";
import {
  createPropertiesListMatcher,
  createUnitReplaceFunction,
  doesDeclarationExist,
  getAtRules,
  getClosestRule,
  getConversionContext,
  getStyleRules,
  getUnitFactor,
  getUnitFromOptions,
  getUnitRegexp,
  hasUnit,
  isInsideLandscapeMediaQuery,
  isInsideMediaQuery,
  isTopLevelRule,
  resolveOptions,
  shouldExcludeFile,
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
  // Merge default options with custom options. An option set to undefined keeps its default.
  // 将默认选项与自定义选项合并。设为 undefined 的选项保留默认值。
  const options: Options = resolveOptions(customOptions);

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
      // Store landscape copies by where they go: the stylesheet, or the @layer block their rule sits in. Every file starts with an empty list.
      // 按副本要放进的位置（样式表本身，或者规则所在的 @layer 块）存储横向副本。每个文件都从空列表开始。
      const landscapeAtRules = new Map<Container, Rule[]>();
      // Widths set by a `viewport-width: 1920` comment, by source file. The first comment of a file wins.
      // 由 `viewport-width: 1920` 这类注释设置的宽度，按源文件存储。每个文件以它的第一条注释为准。
      const fileViewportWidths = new Map<string, number>();

      // 检查文件开头是否有视口宽度配置
      if (options.enablePerFileConfig) {
        css.walkComments((comment) => {
          const sourceFile = comment.source?.input.file || "";
          if (comment.text.startsWith(options.viewportWidthComment) && !fileViewportWidths.has(sourceFile)) {
            // The width is the first number after the marker, decimals included
            // 宽度取标记文字后面的第一个数，可以带小数
            const widthMatch = comment.text.slice(options.viewportWidthComment.length).match(/\d*\.?\d+/);
            if (widthMatch) {
              fileViewportWidths.set(sourceFile, Number(widthMatch[0]));
              // comment.remove(); // 移除配置注释
            }
          }
        });
      }
      css.walkRules((rule) => {
        // Handle landscape mode if enabled. Only rules directly in the stylesheet or in @layer blocks are copied:
        // a rule nested in another rule or at-rule would lose the selector or condition around it.
        // 如果启用了横向模式，则处理横向模式。只复制直接写在样式表里或 @layer 块里的规则：
        // 嵌套在别的规则或 at-rule 里的规则，复制出去会丢掉外层的选择器或条件。
        if (options.enableLandscape && isTopLevelRule(rule)) {
          handleLandscapeMode(rule, options, landscapeAtRules, isAllowedProperty, unitRegexp, fileViewportWidths);
        }
      });

      // Every declaration goes through the same checks, keyframes included. The landscape copies above are taken before this.
      // 每条声明都经过同样的检查，关键帧也一样。上面的横向副本在这之前复制。
      css.walkDecls((declaration) => {
        processDeclaration(declaration, options, isAllowedProperty, unitRegexp, result, fileViewportWidths);
      });

      // Add a landscape media query at the end of every place that has copies, so the copies keep their cascade layer
      // 在每个有副本的位置末尾添加横向媒体查询，副本因此留在原来的层级里
      for (const [container, landscapeRules] of landscapeAtRules) {
        addLandscapeMediaQuery(container, landscapeRules, AtRule);
      }
    },
  };
}

/**
 * Handle landscape mode for a given rule. The copy keeps nested rules and at-rules in their place,
 * and its declarations go through the same checks as for conversion.
 * 处理给定规则的横向模式。副本里嵌套的规则和 at-rule 保持原来的位置，副本里的声明和转换时经过同样的检查。
 */
function handleLandscapeMode(
  rule: Rule,
  options: Options,
  landscapeAtRules: Map<Container, Rule[]>,
  isAllowedProperty: (prop: string) => boolean,
  unitRegexp: RegExp,
  fileViewportWidths: Map<string, number>,
): void {
  const landscapeRule = rule.clone();
  // The copy has no parent, so width functions get the at-rules around the original rule from here
  // 副本没有父节点，宽度函数从这里拿到原规则外面的 at-rule
  const outerAtRules = getAtRules(rule);

  // Decide for every declaration before changing any, so ignore comments still sit next to their declarations
  // 先决定每条声明的去留再修改，这样忽略注释仍然紧挨着它们的声明
  const landscapeValues = new Map<Declaration, string>();
  landscapeRule.walkDecls((declaration) => {
    if (!shouldConvertDeclaration(declaration, options, isAllowedProperty)) {
      return;
    }

    if (getIgnoreComment(declaration)) {
      return;
    }

    const sourceFile = declaration.source?.input.file || "";
    const getContext = (): ConversionContext => getConversionContext(declaration, outerAtRules);
    const landscapeFactor = getUnitFactor(options, options.landscapeUnit, () => getLandscapeSize(options, sourceFile, getContext, fileViewportWidths.get(sourceFile)));
    if (landscapeFactor === undefined) {
      return;
    }

    const landscapeValue = declaration.value.replace(
      unitRegexp,
      createUnitReplaceFunction(options, options.landscapeUnit, landscapeFactor),
    );
    // A declaration whose value stays the same, such as `border: 1px solid`, is not copied
    // 值不变的声明（比如 `border: 1px solid`）不复制
    if (landscapeValue === declaration.value) {
      return;
    }

    landscapeValues.set(declaration, landscapeValue);
  });

  landscapeRule.walkDecls((declaration) => {
    const landscapeValue = landscapeValues.get(declaration);
    if (landscapeValue === undefined) {
      declaration.remove();
    } else {
      declaration.value = landscapeValue;
    }
  });
  // Comments, ignore comments included, are not copied
  // 注释（包括忽略注释）不复制
  landscapeRule.walkComments((comment) => {
    comment.remove();
  });
  removeEmptyContainers(landscapeRule);
  // Let PostCSS format the copy like the rest of the stylesheet
  // 让 PostCSS 按样式表其余部分的格式输出副本
  landscapeRule.cleanRaws();

  if (landscapeRule.nodes.length > 0) {
    const container = rule.parent as Container;
    landscapeAtRules.set(container, [...(landscapeAtRules.get(container) ?? []), landscapeRule]);
  }
}

/**
 * Remove rules and at-rules that have nothing left in them. At-rules without a block, such as `@apply`, go too.
 * 移除里面什么都不剩的规则和 at-rule。没有内容块的 at-rule（比如 `@apply`）也一并移除。
 */
function removeEmptyContainers(container: Container): void {
  container.each((node) => {
    if (node.type === "rule" || node.type === "atrule") {
      if (node.nodes) {
        removeEmptyContainers(node);
      }
      if (!node.nodes || node.nodes.length === 0) {
        node.remove();
      }
    }
  });
}

/**
 * Get the landscape size based on options.
 * 根据选项获取横向尺寸。
 */
function getLandscapeSize(options: Options, sourceFile: string, getContext: () => ConversionContext, fileViewportWidth?: number): number | undefined {
  if (fileViewportWidth) {
    return fileViewportWidth;
  }
  if (typeof options.landscapeViewportWidth === "function") {
    return options.landscapeViewportWidth(sourceFile, getContext());
  }
  return options.landscapeViewportWidth;
}

/**
 * Whether a declaration is one this plugin converts, before its ignore comments are checked.
 * Conversion and the landscape copy both ask this.
 * 一条声明是否属于本插件要转换的范围（忽略注释另外检查）。转换和横向副本都用它判断。
 */
function shouldConvertDeclaration(declaration: Declaration, options: Options, isAllowedProperty: (prop: string) => boolean): boolean {
  // Declarations outside rules, such as the descriptors of @font-face, @page and @property, are not converted.
  // `@position-try` holds ordinary declarations, so it is converted like a rule.
  // 不在规则里的声明（比如 @font-face、@page、@property 的描述符）不转换。`@position-try` 里是普通的声明，和规则一样转换。
  const parent = declaration.parent;
  const isInPositionTry = parent?.type === "atrule" && (parent as AtRule).name.toLowerCase() === "position-try";
  if (!getClosestRule(declaration) && !isInPositionTry) {
    return false;
  }

  // Check if the declaration should be excluded based on file path
  // 检查是否应该根据文件路径排除该声明
  if (shouldExcludeFile(options, declaration.source?.input.file || "")) {
    return false;
  }

  // The selector lists apply to all the style rules around the declaration.
  // Keyframe selectors such as `from` and `50%` are not checked.
  // 选择器名单作用于声明外面的所有样式规则。`from`、`50%` 这类关键帧选择器不参与检查。
  const selectors = getStyleRules(declaration).map(styleRule => styleRule.selector);
  if (selectors.length > 0 && shouldExcludeSelectors(options, selectors)) {
    return false;
  }

  // Declarations inside @media or @container, also when nested in a rule, are converted only with allowMediaQuery
  // 位于 @media 或 @container 里的声明（包括嵌套在规则里的情况），只有开启 allowMediaQuery 时才转换
  if (!options.allowMediaQuery && isInsideMediaQuery(declaration)) {
    return false;
  }

  return hasUnit(declaration.value, options.unitType) && isAllowedProperty(declaration.prop);
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
  fileViewportWidths: Map<string, number>,
): void {
  if (!shouldConvertDeclaration(declaration, options, isAllowedProperty)) {
    return;
  }

  if (shouldIgnoreDeclaration(declaration, result)) {
    return;
  }

  const sourceFile = declaration.source?.input.file || "";
  const { targetUnit, factor } = getTargetUnitAndFactor(declaration, options, sourceFile, fileViewportWidths.get(sourceFile));
  if (factor === undefined) {
    return;
  }

  const modifiedValue = declaration.value.replace(
    unitRegexp,
    createUnitReplaceFunction(options, targetUnit, factor),
  );

  if (options.replaceRules) {
    declaration.value = modifiedValue;
  } else if (!doesDeclarationExist(declaration.parent, declaration.prop, modifiedValue)) {
    // Only an added declaration can duplicate one that is already there.
    declaration.cloneAfter({ value: modifiedValue });
  }
}

/**
 * Check if a declaration should be ignored based on comments. The comment is removed.
 * 根据注释检查是否应忽略声明。注释会被移除。
 */
function shouldIgnoreDeclaration(declaration: Declaration, result: Result): boolean {
  const ignoreComment = getIgnoreComment(declaration, result);
  ignoreComment?.remove();
  return ignoreComment !== undefined;
}

/**
 * Find the comment that turns off conversion for a declaration: `px-conversion-ignore-next` right before it,
 * or `px-conversion-ignore-prev` right after it on the same line.
 * 查找关闭某条声明转换的注释：紧挨在声明前面的 `px-conversion-ignore-next`，或者同一行紧跟在声明后面的 `px-conversion-ignore-prev`。
 */
function getIgnoreComment(declaration: Declaration, result?: Result): Comment | undefined {
  const prevComment = declaration.prev();
  if (prevComment && prevComment.type === "comment" && prevComment.text === IGNORE_NEXT_COMMENT) {
    return prevComment;
  }

  const nextComment = declaration.next();
  if (nextComment && nextComment.type === "comment" && nextComment.text === IGNORE_PREV_COMMENT) {
    if (/\n/.test(nextComment.raws.before!)) {
      result?.warn(
        `Unexpected comment /* ${IGNORE_PREV_COMMENT} */ must be after declaration at the same line.`,
        { node: nextComment },
      );
    } else {
      return nextComment;
    }
  }

  return undefined;
}

/**
 * Get the unit to convert to and the factor to multiply by.
 * 获取要转换成的单位，以及换算时要乘的系数。
 */
function getTargetUnitAndFactor(
  declaration: Declaration,
  options: Options,
  sourceFile: string,
  fileViewportWidth?: number,
): { targetUnit: string; factor: number | undefined } {
  const getContext = (): ConversionContext => getConversionContext(declaration);
  if (options.enableLandscape && isInsideLandscapeMediaQuery(declaration)) {
    return {
      targetUnit: options.landscapeUnit,
      factor: getUnitFactor(options, options.landscapeUnit, () => getLandscapeSize(options, sourceFile, getContext, fileViewportWidth)),
    };
  } else {
    const targetUnit = getUnitFromOptions(declaration.prop, options);
    return {
      targetUnit,
      factor: getUnitFactor(options, targetUnit, () => getViewportSize(options, sourceFile, getContext, fileViewportWidth)),
    };
  }
}

/**
 * Get the viewport size based on options.
 * 根据选项获取视口尺寸。
 */
function getViewportSize(options: Options, sourceFile: string, getContext: () => ConversionContext, fileViewportWidth?: number): number | undefined {
  if (fileViewportWidth) {
    return fileViewportWidth;
  }
  if (typeof options.viewportWidth === "function") {
    return options.viewportWidth(sourceFile, getContext());
  }
  return options.viewportWidth;
}

/**
 * Add landscape media query to the end of a container: the stylesheet, or an @layer block.
 * 向样式表或 @layer 块的末尾添加横向媒体查询。
 */
function addLandscapeMediaQuery(container: Container, landscapeRules: Rule[], AtRuleNode: typeof AtRule): void {
  // The node classes come with the helpers PostCSS passes to the plugin; Root has no AtRule on it.
  const landscapeMediaRule = new AtRuleNode({
    params: "(orientation: landscape)",
    name: "media",
    nodes: landscapeRules,
  });
  container.append(landscapeMediaRule);
}
