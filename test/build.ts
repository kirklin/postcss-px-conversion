import { fileURLToPath } from "node:url";
import { build } from "unbuild";

export default async function setup(): Promise<void> {
  await build(fileURLToPath(new URL("..", import.meta.url)), false);
}
