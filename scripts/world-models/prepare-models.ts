// Copies the English island's models (catalogue.ts) from the downloaded packs into nihon-web/public/world/models,
// measures each one, and gathers the people's animation clips into one small file. Run from the repository root,
// after unpacking the packs into .asset-sources/ (git-ignored; see docs/ENGLISH.md):
//   node --experimental-strip-types scripts/world-models/prepare-models.ts
// Set BROWSER_EXECUTABLE to use an installed Chrome instead of Playwright's own.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { CLIPS, MODELS } from "./catalogue.ts";
import type { ModelSource } from "./catalogue.ts";
import { ASSET_SOURCES, MEDIEVAL_TEXTURE, ModelPrepareError, ROOT, packUrl, round, withModelPage } from "./modelPage.ts";

const OUTPUT = join(ROOT, "nihon-web/public/world/models");
const MANIFEST = join(ROOT, "nihon-web/src/data/world/modelSizes.json");
const ANIMATIONS_FILE = "animations.glb";

type GltfJson = { buffers?: { uri?: string }[]; images?: { uri?: string }[] };

/** The glTF's own JSON; only its buffers and images are rewritten, each guarded where used. */
function gltfJson(file: string): GltfJson {
  const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new ModelPrepareError(`${file} is not a glTF file.`);
  return parsed;
}

/** Copies a model as `<id>.gltf` with its buffer as `<id>.bin` (or as `<id>.glb`); a texture keeps its name, shared by
 *  every model of its pack. Returns the copied model's file name. */
function copyModel({ id, source }: ModelSource): string {
  const from = join(ASSET_SOURCES, source);
  if (extname(from) === ".glb") {
    copyFileSync(from, join(OUTPUT, `${id}.glb`));
    return `${id}.glb`;
  }
  const gltf = gltfJson(from);
  for (const buffer of gltf.buffers ?? []) {
    if (!buffer.uri) continue;
    copyFileSync(join(dirname(from), buffer.uri), join(OUTPUT, `${id}.bin`));
    buffer.uri = `${id}.bin`;
  }
  for (const image of gltf.images ?? []) {
    if (!image.uri) continue;
    const texture = image.uri === basename(MEDIEVAL_TEXTURE) ? MEDIEVAL_TEXTURE : join(dirname(from), image.uri);
    copyFileSync(texture, join(OUTPUT, image.uri));
  }
  writeFileSync(join(OUTPUT, `${id}.gltf`), JSON.stringify(gltf));
  return `${id}.gltf`;
}

type Measure = (url: string) => Promise<unknown>;
type Gather = (clips: unknown) => Promise<unknown>;

/** A measured size, checked. */
function asSize(value: unknown, id: string): { width: number; depth: number; height: number } {
  if (typeof value !== "object" || value === null || !("width" in value) || !("depth" in value) || !("height" in value)
    || typeof value.width !== "number" || typeof value.depth !== "number" || typeof value.height !== "number") {
    throw new ModelPrepareError(`The page could not measure "${id}".`);
  }
  return { width: value.width, depth: value.depth, height: value.height };
}

await withModelPage(async page => {
  mkdirSync(OUTPUT, { recursive: true });
  const manifest: Record<string, unknown> = {};
  for (const model of MODELS) {
    const file = copyModel(model);
    const size = asSize(await page.evaluate(url => (window as unknown as { measureModel: Measure }).measureModel(url), packUrl(model.source)), model.id);
    manifest[model.id] = { file, width: round(size.width), depth: round(size.depth), height: round(size.height) };
    console.log(`${model.id}: ${file}`);
  }
  const clips = Object.fromEntries(Object.entries(CLIPS).map(([name, { source, clip }]) => [name, { url: packUrl(source), clip }]));
  const animations = await page.evaluate(wanted => (window as unknown as { gatherClips: Gather }).gatherClips(wanted), clips);
  if (typeof animations !== "string") throw new ModelPrepareError("The page gathered no animations.");
  writeFileSync(join(OUTPUT, ANIMATIONS_FILE), Buffer.from(animations, "base64"));
  mkdirSync(dirname(MANIFEST), { recursive: true });
  writeFileSync(MANIFEST, `${JSON.stringify({ animations: ANIMATIONS_FILE, models: manifest }, null, 2)}\n`);
  console.log(`Prepared ${MODELS.length} models and ${Object.keys(CLIPS).length} animations in ${OUTPUT}.`);
});
