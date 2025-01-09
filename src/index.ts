import type { Options } from "./types";
import { plugin } from "./pluginFactory";

const postcssPlugin = (opts: Partial<Options>) => plugin(opts);
export default postcssPlugin;
