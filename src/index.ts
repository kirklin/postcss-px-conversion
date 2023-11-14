import { plugin } from "./pluginFactory";
import type { Options } from "./types";

const postcssPlugin = (opts: Partial<Options>) => plugin(opts);
// eslint-disable-next-line kirklin/no-cjs-exports
module.exports = postcssPlugin;
// eslint-disable-next-line kirklin/no-cjs-exports
module.exports.postcss = true;
export default postcssPlugin;
