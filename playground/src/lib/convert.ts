import type { Declaration } from "postcss";
import type { Options } from "../../../src/types";
import postcss from "postcss";
import postcssPxConversion from "../../../src/index";

export interface ConvertedValue {
  from: number;
  to: number;
  before: string;
  after: string;
}

export interface Conversion {
  css: string;
  converted: ConvertedValue[];
  warnings: string[];
  // The design width a viewport-width comment sets for the file
  fileWidth?: number;
}

// A number with an optional unit. Converted and original values are compared token by token.
const NUMBER = /(?<![\w.])[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?(?:%|[a-z]+)?/gi;

function offsetOf(declaration: Declaration): number | undefined {
  return declaration.source?.start?.offset;
}

function changedNumbers(before: string, after: string, start: number): ConvertedValue[] {
  const beforeNumbers = [...before.matchAll(NUMBER)];
  const afterNumbers = [...after.matchAll(NUMBER)];
  if (beforeNumbers.length !== afterNumbers.length) {
    return [{ from: start, to: start + after.length, before, after }];
  }
  return afterNumbers.flatMap((number, index) => {
    const original = beforeNumbers[index][0];
    if (number[0] === original) {
      return [];
    }
    const from = start + number.index;
    return [{ from, to: from + number[0].length, before: original, after: number[0] }];
  });
}

/**
 * Run the plugin on a stylesheet and find where each converted number sits in the output.
 * Declarations keep their source position when the plugin changes or copies them,
 * so each output declaration is compared with the input declaration it came from.
 */
export function convert(input: string, options: Options, file: string): Conversion {
  const original = postcss.parse(input, { from: file });
  const originalValues = new Map<number, string>();
  original.walkDecls((declaration) => {
    const offset = offsetOf(declaration);
    if (offset !== undefined) {
      originalValues.set(offset, declaration.value);
    }
  });

  // The plugin takes the width from the first comment of the file that starts with viewportWidthComment
  let fileWidth: number | undefined;
  if (options.enablePerFileConfig) {
    original.walkComments((comment) => {
      if (fileWidth === undefined && comment.text.startsWith(options.viewportWidthComment)) {
        const match = comment.text.slice(options.viewportWidthComment.length).match(/\d*\.?\d+/);
        fileWidth = match ? Number(match[0]) : undefined;
      }
    });
  }

  const result = postcss([postcssPxConversion(options)]).process(input, { from: file });
  const converted: ConvertedValue[] = [];
  let css = "";
  postcss.stringify(result.root, (part, node) => {
    if (node?.type === "decl") {
      const offset = offsetOf(node);
      const before = offset === undefined ? undefined : originalValues.get(offset);
      if (before !== undefined && before !== node.value) {
        const valueStart = part.indexOf(node.value, node.prop.length);
        if (valueStart === -1) {
          throw new Error(`Could not find the value of ${node.prop} in the output`);
        }
        converted.push(...changedNumbers(before, node.value, css.length + valueStart));
      }
    }
    css += part;
  });
  return { css, converted, warnings: result.warnings().map(warning => warning.text), fileWidth };
}
