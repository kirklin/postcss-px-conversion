import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // The package test loads the built files.
    globalSetup: ["test/build.ts"],
  },
});
