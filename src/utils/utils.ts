import type { ContainerWithChildren } from "postcss/lib/container";
import type { Options } from "../types";

export function shouldExclude(options: Options, filePath: string): boolean {
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

export function isBlacklistedSelector(selector: string, blacklist: (string | RegExp)[]): boolean {
  return blacklist.some(item =>
    (typeof item === "string" && selector.includes(item))
    || (item instanceof RegExp && item.test(selector)),
  );
}

export function getUnitFromOptions(prop: string | string[], opts: Options) {
  return Array.isArray(prop)
    ? opts.viewportUnit
    : (prop.includes("font") ? opts.fontViewportUnit : opts.viewportUnit);
}

export function roundNumberToPrecision(number: number, precision: number): number {
  // 四舍五入数字到指定的小数位数精度
  const multiplier = 10 ** precision;
  return Math.round(number * multiplier) / multiplier;
}

export function createUnitReplaceFunction(opts: Options, targetUnit: string | number, targetSize: number) {
  return (match: string, pixelValue: string) => {
    if (!pixelValue) {
      return match;
    }

    const pixels = Number.parseFloat(pixelValue);
    if (pixels <= opts.minPixelValue!) {
      return match;
    }

    const convertedValue = roundNumberToPrecision((pixels / targetSize) * 100, opts.unitPrecision!);
    return convertedValue === 0 ? "0" : `${convertedValue}${targetUnit}`;
  };
}

export function doesDeclarationExist(declarations: ContainerWithChildren | undefined, property: string, value: string) {
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  return declarations?.some(declaration => declaration?.prop === property && declaration?.value === value);
}

export function validateMediaQueryParams(params: string, requiresMediaQuery: boolean) {
  return !params || (params && requiresMediaQuery);
}
