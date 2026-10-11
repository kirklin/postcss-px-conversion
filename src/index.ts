import type { Plugin } from "postcss";
import type { Options } from "./types";
import { plugin } from "./pluginFactory";

const postcssPlugin = (opts: Partial<Options>): Plugin => plugin(opts);
export default postcssPlugin;
