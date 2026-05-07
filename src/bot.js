import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import { buildMorningPost } from "./content/morning.js";
import { buildEveningPost } from "./content/evening.js";
import { buildViralReplies } from "./content/replies.js";
import { renderImage } from "./images/renderImage.js";
import { postToBuffer } from "./buffer/post.js";
import { istDateKey } from "./utils/date.js";
import { splitThread, withHashtags, withUniqueManualLine } from "./utils/text.js";

const root = process.cwd();
const slot = process.argv[2] || "all";

function safeSeed() {
  return String(config.postVariationSeed || Date.now())
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 32);
}

function runFilename(filename, payloadSlot) {
  const extension = path.extname(filename);
  const base = path.basename(filename, extension);
  return `${base}-${safeSeed() || payloadSlot}${extension}`;
}

async function savePreview(payload, outDir) {
  await fs.mkdir(outDir, { recursive: true });
  const previewPath = path.join(outDir, `${payload.slot}.json`);
  await fs.writeFile(previewPath, JSON.stringify(payload, null, 2));
  return previewPath;
}

async function runOne(builder, filename) {
  const outDir = path.join(root, "public", "generated", istDateKey());
  const previewPath = path.join(outDir, `${filename.replace(".png", "")}.json`);
  const payload = config.fromPreview
    ? JSON.parse(await fs.readFile(previewPath, "utf8"))
    : await builder();
  const imagePath = config.fromPreview
    ? payload.imagePath
    : await renderImage(payload.image, outDir, runFilename(filename, payload.slot));
  const uniquePost = config.forceUniquePost
    ? withUniqueManualLine(payload.post, payload.slot, config.postVariationSeed)
    : payload.post;
  const postText = withHashtags(uniquePost, payload.hashtags);
  const parts = splitThread(postText);
  const preview = {
    ...payload,
    thread: parts,
    imagePath,
    viralReplies: buildViralReplies()
  };
  await savePreview(preview, outDir);

  console.log(`\n${payload.slot.toUpperCase()} POST`);
  console.log(parts.join("\n\n---\n\n"));
  console.log(`\nImage: ${imagePath}`);
  console.log(`Preview: ${previewPath}`);
  console.log(`Hashtags: ${payload.hashtags.join(" ")}`);

  if (config.dryRun) {
    console.log("Dry run enabled. Nothing posted to Buffer.");
    return;
  }

  const created = await postToBuffer(parts, imagePath);
  console.log(`Created Buffer post: ${created.id}`);
  if (created.imageUrl) console.log(`Image URL: ${created.imageUrl}`);
}

async function main() {
  if (!["morning", "evening", "all"].includes(slot)) {
    throw new Error("Usage: node src/bot.js [morning|evening|all] [--dry-run]");
  }

  if (slot === "morning" || slot === "all") {
    await runOne(buildMorningPost, "morning.png");
  }

  if (slot === "evening" || slot === "all") {
    await runOne(buildEveningPost, "evening.png");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
