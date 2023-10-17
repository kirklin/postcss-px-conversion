import { plugin } from "./pluginFactory";
import type { Options } from "./types";

module.exports = (opts: Partial<Options>) => plugin(opts);
module.exports.postcss = true;
export const postcss = true;
