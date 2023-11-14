import { plugin } from "./pluginFactory";
import type { Options } from "./types";

const postcssPlugin = (opts: Partial<Options>) => plugin(opts);
export default postcssPlugin;
