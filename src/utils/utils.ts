import type { AtRule, Declaration, Node, Rule } from "postcss";
import type { ContainerWithChildren } from "postcss/lib/container";
import type { ConversionContext, Options } from "../types";

/**
 * Whether a string or regular expression from a list matches the text. A regular expression with the `g` or `y` flag
 * remembers where its last match ended, so it is tested from the start every time.
 * 列表里的字符串或正则表达式是否匹配这段文字。带 `g` 或 `y` 标志的正则表达式会记住上一次匹配结束的位置，所以每次都从头匹配。
 */
export function matchesPattern(text: string, pattern: string | RegExp): boolean {
  if (typeof pattern === "string") {
    return text.includes(pattern);
  }
  pattern.lastIndex = 0;
  return pattern.test(text);
}

export function shouldExcludeFile(options: Options, filePath: string): boolean {
  const isExcluded = options.excludeFiles.some(exclude => matchesPattern(filePath, exclude));

  if (isExcluded) {
    return true;
  }

  if (options.includeFiles.length > 0) {
    return !options.includeFiles.some(include => matchesPattern(filePath, include));
  }

  return false;
}

export function shouldExcludeSelector(options: Options, selector: string): boolean {
  return shouldExcludeSelectors(options, [selector]);
}

/**
 * Check the selectors of all the style rules around a declaration: one in the blacklist excludes it,
 * and with a whitelist, at least one of them has to be in it.
 * 检查声明外面所有样式规则的选择器：任何一个在黑名单里就排除；设置了白名单时，至少要有一个在白名单里。
 */
export function shouldExcludeSelectors(options: Options, selectors: string[]): boolean {
  const isInBlacklist = selectors.some(selector => isListedSelector(selector, options.selectorBlacklist));

  if (isInBlacklist) {
    return true;
  }

  if (options.selectorWhitelist.length > 0) {
    return !selectors.some(selector => isListedSelector(selector, options.selectorWhitelist));
  }

  return false;
}

export function isListedSelector(selector: string, list: (string | RegExp)[]): boolean {
  return list.some(item => matchesPattern(selector, item));
}

export function getUnitFromOptions(prop: string | string[], opts: Options): string {
  return Array.isArray(prop)
    ? opts.viewportUnit
    : (prop.includes("font") ? opts.fontViewportUnit : opts.viewportUnit);
}

export function roundNumberToPrecision(number: number, precision: number): number {
  // 四舍五入数字到指定的小数位数精度
  // The decimal point moves through the string form: 1.005 * 100 is 100.49999… in binary,
  // while "1.005e2" is exactly 100.5, so halves round up as written.
  const [mantissa, exponent = "0"] = String(Math.abs(number)).split("e");
  const shifted = Math.round(Number(`${mantissa}e${Number(exponent) + precision}`));
  const [shiftedMantissa, shiftedExponent = "0"] = String(shifted).split("e");
  const rounded = Number(`${shiftedMantissa}e${Number(shiftedExponent) - precision}`);
  return number < 0 ? -rounded : rounded;
}

export function createUnitReplaceFunction(opts: Options, targetUnit: string | number, factor: number) {
  return (match: string, sign: string, pixelValue: string) => {
    if (!pixelValue) {
      return match;
    }

    const pixels = Number.parseFloat(pixelValue);
    if (pixels <= opts.minPixelValue!) {
      return match;
    }

    const convertedValue = roundNumberToPrecision(pixels * factor, opts.unitPrecision!);
    return convertedValue === 0 ? "0" : `${sign}${convertedValue}${targetUnit}`;
  };
}

/**
 * The number a value in unitType is multiplied by to convert it to targetUnit. px and rem convert into each other
 * through rootValue; other units scale with the design width, which is read only for them: rpx divides it into
 * 750 parts, viewport units into 100. Undefined leaves the value as it is.
 * 源单位的数值换算成目标单位时要乘的系数。px 和 rem 之间按 rootValue 换算；其他单位按设计稿宽度换算，
 * 只有这时才读取宽度：rpx 把宽度分成 750 份，视口单位分成 100 份。返回 undefined 时数值保持不变。
 */
export function getUnitFactor(opts: Options, targetUnit: string, getWidth: () => number | undefined): number | undefined {
  const unit = targetUnit.toLowerCase();
  if (unit === "px") {
    return opts.rootValue;
  }
  if (unit === "rem") {
    return 1 / opts.rootValue;
  }
  const width = getWidth();
  return width ? (unit === "rpx" ? 750 : 100) / width : undefined;
}

export function doesDeclarationExist(declarations: ContainerWithChildren | undefined, property: string, value: string): boolean | undefined {
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  return declarations?.some(declaration => declaration?.prop === property && declaration?.value === value);
}

/**
 * The closest rule around a node, keyframe selectors included.
 * 节点外面最近的一层规则，关键帧选择器也算。
 */
export function getClosestRule(node: Node): Rule | undefined {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "rule") {
      return parent as Rule;
    }
  }
  return undefined;
}

/**
 * The at-rules around a node, innermost first.
 * 节点外面的所有 at-rule，从内到外。
 */
export function getAtRules(node: Node): AtRule[] {
  const atRules: AtRule[] = [];
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "atrule") {
      atRules.push(parent as AtRule);
    }
  }
  return atRules;
}

/**
 * Where a declaration sits, for width functions. A landscape copy is not in the stylesheet yet,
 * so the at-rules around the rule it was copied from are passed in.
 * 声明所在的位置，传给宽度函数。横向副本还没有放进样式表，所以要传入被复制的规则外面的 at-rule。
 */
export function getConversionContext(declaration: Declaration, outerAtRules: AtRule[] = []): ConversionContext {
  return {
    property: declaration.prop,
    selector: getClosestRule(declaration)?.selector,
    atRules: [...getAtRules(declaration), ...outerAtRules].reverse().map(({ name, params }) => ({ name, params })),
  };
}

/**
 * The style rules around a node, innermost first. Keyframe selectors are not style rules.
 * 节点外面的所有样式规则，从内到外。关键帧选择器不算样式规则。
 */
export function getStyleRules(node: Node): Rule[] {
  const rules: Rule[] = [];
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "rule" && !isKeyframeRule(parent as Rule)) {
      rules.push(parent as Rule);
    }
  }
  return rules;
}

/**
 * Whether a rule is a keyframe selector such as `from` or `50%`.
 * 规则是否是 `from`、`50%` 这类关键帧选择器。
 */
export function isKeyframeRule(rule: Rule): boolean {
  return rule.parent?.type === "atrule" && /keyframes$/i.test((rule.parent as AtRule).name);
}

/**
 * Whether a rule sits directly in the stylesheet, or in `@layer` blocks only.
 * 规则是否直接写在样式表里，或者只包在 `@layer` 块里。
 */
export function isTopLevelRule(rule: Rule): boolean {
  for (let parent = rule.parent; parent && parent.type !== "root"; parent = parent.parent) {
    if (parent.type !== "atrule" || (parent as AtRule).name.toLowerCase() !== "layer") {
      return false;
    }
  }
  return true;
}

/**
 * Whether a node sits inside `@media` or `@container`, at any depth.
 * 节点是否位于 `@media` 或 `@container` 里，不论嵌套多深。
 */
export function isInsideMediaQuery(node: Node): boolean {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "atrule" && /^(?:media|container)$/i.test((parent as AtRule).name)) {
      return true;
    }
  }
  return false;
}

/**
 * Whether a node sits inside a `@media` query for landscape, at any depth.
 * 节点是否位于横屏的 `@media` 查询里，不论嵌套多深。
 */
export function isInsideLandscapeMediaQuery(node: Node): boolean {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === "atrule" && (parent as AtRule).name.toLowerCase() === "media" && (parent as AtRule).params.includes("landscape")) {
      return true;
    }
  }
  return false;
}
