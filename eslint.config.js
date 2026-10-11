import kirklin from "@kirklin/eslint-config";

export default kirklin({
  type: "lib",
  typescript: true,
  vue: true,
  formatters: true,
  pnpm: true,
});
