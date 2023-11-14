import { plugin } from "./pluginFactory";
import type { Options } from "./types";

const postcssPlugin = (opts: Partial<Options>) => plugin(opts);
module.exports = postcssPlugin;
module.exports.postcss = true;
export default postcssPlugin;
