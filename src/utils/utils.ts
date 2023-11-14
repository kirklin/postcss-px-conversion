import type { Options } from "../types";

export function shouldExclude(options: Options, filePath: string): boolean {
  // 检查是否包含在要排除的文件列表中
  for (const exclude of options.excludeFiles) {
    if (typeof exclude === "string" && filePath.includes(exclude)) {
      return true;
    }
    if (exclude instanceof RegExp && exclude.test(filePath)) {
      return true;
    }
  }

  // 检查是否应该只包括某些文件
  if (options.includeFiles.length > 0) {
    let included = false;
    for (const include of options.includeFiles) {
      if (typeof include === "string" && filePath.includes(include)) {
        included = true;
        break;
      }
      if (include instanceof RegExp && include.test(filePath)) {
        included = true;
        break;
      }
    }
    return !included;
  }

  return false;
}
export function isBlacklistedSelector(selector: string, blacklist: (string | RegExp)[]): boolean {
  for (const item of blacklist) {
    if (typeof item === "string" && selector.includes(item)) {
      return true;
    } else if (item instanceof RegExp && item.test(selector)) {
      return true;
    }
  }
  return false;
}

export function getUnitFromOptions(prop: string | string[], opts: Options) {
  // 根据属性类型获取相应的单位选项
  return !Array.isArray(prop) ? (prop.includes("font") ? opts.fontViewportUnit : opts.viewportUnit) : opts.viewportUnit;
}

export function roundNumberToPrecision(number: number, precision: number) {
  // 四舍五入数字到指定的小数位数精度
  const multiplier = 10 ** precision;
  const roundedNumber = Math.round(number * multiplier) / multiplier;
  return roundedNumber;
}

export function createUnitReplaceFunction(opts: Options, targetUnit: string | number, targetSize: number) {
  return function (match: string, pixelValue: string) {
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

export function doesDeclarationExist(declarations: any, property: string, value: string) {
  return declarations?.some((declaration: any) => {
    return declaration.prop === property && declaration.value === value;
  });
}

export function validateMediaQueryParams(params: string, requiresMediaQuery: boolean) {
  // 验证媒体查询参数是否符合要求
  return !params || (params && requiresMediaQuery);
}
