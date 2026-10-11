import type { Options } from "../src/types";
import postcss from "postcss";
import postcssPxConversion from "../src";

export const FROM = "/project/src/styles/main.css";

export function convert(css: string, options: Partial<Options> = {}, from: string | undefined = FROM): string {
  return postcss([postcssPxConversion(options)]).process(css, { from }).css;
}

/** Prints CSS with PostCSS's default formatting, so tests can compare structure without whitespace. */
export function normalize(css: string): string {
  const root = postcss.parse(css);
  root.cleanRaws();
  return root.toString();
}
