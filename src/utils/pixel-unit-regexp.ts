/**
 * Create a regular expression to match numeric values with a specific unit.
 * 创建一个正则表达式，用于匹配带有特定单位的数字值。
 *
 * @param {string} unit - The unit to match, e.g., 'px', 'em', 'vw', etc.
 * @returns {RegExp} - A regular expression to match numeric values with the specified unit.
 */
export function getUnitRegexp(unit: string): RegExp {
  // A number counts only as a whole token: digits inside names such as `--gap-10px` are left alone.
  // Group 1 is the sign, group 2 the number.
  return new RegExp(
    `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(?<![\\w.-])([+-]?)(\\d*\\.?\\d+)${unit}(?![\\w-])`,
    "g",
  );
}
