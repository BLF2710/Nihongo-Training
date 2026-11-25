// The headless page the model scripts work in (model-page.html, three.js in Chrome), served with three.js and the
// downloaded asset packs (.asset-sources, git-ignored; see docs/ENGLISH.md).
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import type { Page } from "playwright";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const ASSET_SOURCES = join(ROOT, ".asset-sources");
const THREE = join(ROOT, "node_modules/three");
const PAGE = join(ROOT, "scripts/world-models/model-page.html");
/** The medieval pack's models name their texture as if it were beside them, but it lives in the pack's Textures folder. */
export const MEDIEVAL_TEXTURE = join(ASSET_SOURCES, "kaykit-medieval-hexagon/extracted/KayKit_Medieval_Hexagon_Pack_1.0_FREE/Textures/hexagons_medieval.png");

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html", ".js": "text/javascript", ".gltf": "model/gltf+json", ".glb": "model/gltf-binary", ".bin": "application/octet-stream", ".png": "image/png",
};

export class ModelPrepareError extends Error {
  constructor(message: string) { super(message); this.name = "ModelPrepareError"; }
}

/** The address a file under .asset-sources is served at. */
export const packUrl = (pathUnderAssetSources: string): string => `/packs/${pathUnderAssetSources}`;

/** The file under `base` that `path` names, or null if it would leave `base`. */
function fileWithin(base: string, path: string): string | null {
  const file = normalize(join(base, decodeURIComponent(path)));
  return file.startsWith(normalize(base)) ? file : null;
}

function serve(request: IncomingMessage, response: ServerResponse) {
  const path = new URL(request.url ?? "/", "http://localhost").pathname;
  const file = path === "/" ? PAGE
    : path.endsWith("/hexagons_medieval.png") ? MEDIEVAL_TEXTURE
    : path.startsWith("/three/") ? fileWithin(THREE, path.slice("/three/".length))
    : path.startsWith("/packs/") ? fileWithin(ASSET_SOURCES, path.slice("/packs/".length)) : null;
  if (!file || !existsSync(file)) { response.writeHead(404).end(); return; }
  response.writeHead(200, { "Content-Type": CONTENT_TYPES[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
}

/** Opens the model page and hands it to `work`, closing the browser and server after. */
export async function withModelPage(work: (page: Page) => Promise<void>): Promise<void> {
  const server = createServer(serve).listen(0);
  const address = server.address();
  if (!address || typeof address === "string") throw new ModelPrepareError("The local server did not start.");
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  try {
    const page = await browser.newPage();
    page.on("pageerror", error => console.error("page error:", error.message));
    await page.goto(`http://localhost:${address.port}/`);
    await page.waitForFunction(() => "pageReady" in window);
    await work(page);
  } finally {
    await browser.close();
    server.close();
  }
}

export const round = (value: number): number => Math.round(value * 1000) / 1000;
