import type { Example } from "./examples";
import type { OptionKey, PlaygroundOptions } from "./options";
import { EXAMPLES } from "./examples";
import { createOptions } from "./options";

export interface PlaygroundState {
  example: string;
  file: string;
  css: string;
  html: string;
  options: PlaygroundOptions;
}

export const SHARE_PREFIX = "#code/";

// What is wrong with a shared link. The page words each kind in its own language.
interface DamagedLink { kind: "damaged" }
interface EmptyLink { kind: "empty" }
interface WrongType { kind: "wrongType"; key: string }
interface UnknownExample { kind: "unknownExample"; id: string }

export type LinkProblem = DamagedLink | EmptyLink | WrongType | UnknownExample;

function describe(problem: LinkProblem): string {
  switch (problem.kind) {
    case "damaged":
      return "The link is incomplete or has been changed";
    case "empty":
      return "The link holds no playground code";
    case "wrongType":
      return `"${problem.key}" in the link has the wrong type`;
    case "unknownExample":
      return `There is no example called "${problem.id}"`;
  }
}

export class LinkError extends Error {
  readonly problem: LinkProblem;

  constructor(problem: LinkProblem, options?: ErrorOptions) {
    super(describe(problem), options);
    this.name = "LinkError";
    this.problem = problem;
  }
}

export function stateFromExample(example: Example): PlaygroundState {
  return {
    example: example.id,
    file: example.file,
    css: example.css,
    html: example.html,
    options: createOptions(example.options),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") {
    throw new LinkError({ kind: "wrongType", key });
  }
  return value;
}

function sameKind(value: unknown, reference: unknown): boolean {
  if (Array.isArray(reference)) {
    return Array.isArray(value) && value.every(entry => typeof entry === "string");
  }
  return typeof value === typeof reference && (typeof value !== "number" || Number.isFinite(value));
}

function readState(value: unknown): PlaygroundState {
  if (!isRecord(value) || !isRecord(value.options)) {
    throw new LinkError({ kind: "empty" });
  }
  const options = createOptions();
  for (const key of Object.keys(options) as OptionKey[]) {
    const entry = value.options[key];
    // Links made before an option existed leave it out
    if (entry === undefined) {
      continue;
    }
    if (!sameKind(entry, options[key])) {
      throw new LinkError({ kind: "wrongType", key });
    }
    (options as Record<OptionKey, unknown>)[key] = entry;
  }
  const example = readString(value, "example");
  if (!EXAMPLES.some(item => item.id === example)) {
    throw new LinkError({ kind: "unknownExample", id: example });
  }
  return {
    example,
    file: readString(value, "file"),
    css: readString(value, "css"),
    html: readString(value, "html"),
    options,
  };
}

async function transform(bytes: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream): Promise<Uint8Array<ArrayBuffer>> {
  const output = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(output).arrayBuffer());
}

export async function encodeState(state: PlaygroundState): Promise<string> {
  const json = JSON.stringify({ example: state.example, file: state.file, css: state.css, html: state.html, options: state.options });
  const bytes = await transform(new TextEncoder().encode(json), new CompressionStream("deflate-raw"));
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function readJson(text: string): Promise<unknown> {
  const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
  const bytes = await transform(Uint8Array.from(binary, char => char.charCodeAt(0)), new DecompressionStream("deflate-raw"));
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

export async function decodeState(text: string): Promise<PlaygroundState> {
  let json: unknown;
  try {
    json = await readJson(text);
  } catch (error) {
    // A cut or edited link fails in the browser's base64, inflate or JSON code, whose messages say nothing useful
    throw new LinkError({ kind: "damaged" }, { cause: error });
  }
  return readState(json);
}
