import type { AtRule, Node } from "postcss";
import type { ContainerWithChildren } from "postcss/lib/container";
import type { Options } from "../types";

export function shouldExcludeFile(options: Options, filePath: string): boolean {
  const isExcluded = options.excludeFiles.some(exclude =>
    (typeof exclude === "string" && filePath.includes(exclude))
    || (exclude instanceof RegExp && exclude.test(filePath)),
  );

  if (isExcluded) {
    return true;
  }

  if (options.includeFiles.length > 0) {
    return !options.includeFiles.some(include =>
      (typeof include === "string" && filePath.includes(include))
      || (include instanceof RegExp && include.test(filePath)),
    );
  }

  return false;
}

export function shouldExcludeSelector(options: Options, selector: string): boolean {
  const isInBlacklist = isListedSelector(selector, options.selectorBlacklist);

  if (isInBlacklist) {
    return true;
  }

  if (options.selectorWhitelist.length > 0) {
    return !isListedSelector(selector, options.selectorWhitelist);
  }

  return false;
}

export function isListedSelector(selector: string, list: (string | RegExp)[]): boolean {
  return list.some(item =>
    (typeof item === "string" && selector.includes(item))
    || (item instanceof RegExp && item.test(selector)),
  );
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

export function createUnitReplaceFunction(opts: Options, targetUnit: string | number, targetSize: number) {
  return (match: string, sign: string, pixelValue: string) => {
    if (!pixelValue) {
      return match;
    }

    const pixels = Number.parseFloat(pixelValue);
    if (pixels <= opts.minPixelValue!) {
      return match;
    }

    const convertedValue = roundNumberToPrecision((pixels / targetSize) * 100, opts.unitPrecision!);
    return convertedValue === 0 ? "0" : `${sign}${convertedValue}${targetUnit}`;
  };
}

export function doesDeclarationExist(declarations: ContainerWithChildren | undefined, property: string, value: string): boolean | undefined {
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  return declarations?.some(declaration => declaration?.prop === property && declaration?.value === value);
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
