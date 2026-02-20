import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, "public", "case-studies");
const OUTPUT_DIR = path.join(INPUT_DIR, "previews");

const TARGETS = [
  {
    input: "detailflow-1.png",
    outputBase: "detailflow-1-home",
  },
  {
    input: "inkbot-1.png",
    outputBase: "inkbot-1-home",
  },
];

const MAX_WIDTH = 960;
const AVIF_QUALITY = 50;
const WEBP_QUALITY = 72;

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function optimizeTarget({ input, outputBase }) {
  const sourcePath = path.join(INPUT_DIR, input);
  const avifPath = path.join(OUTPUT_DIR, `${outputBase}.avif`);
  const webpPath = path.join(OUTPUT_DIR, `${outputBase}.webp`);

  const image = sharp(sourcePath).resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
  });

  await image.clone().avif({ quality: AVIF_QUALITY }).toFile(avifPath);
  await image.clone().webp({ quality: WEBP_QUALITY }).toFile(webpPath);

  return { sourcePath, avifPath, webpPath };
}

async function run() {
  await ensureOutputDir();

  for (const target of TARGETS) {
    const result = await optimizeTarget(target);
    // eslint-disable-next-line no-console
    console.log(`Optimized ${path.basename(result.sourcePath)} -> ${path.relative(ROOT, result.avifPath)} / ${path.relative(ROOT, result.webpPath)}`);
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
