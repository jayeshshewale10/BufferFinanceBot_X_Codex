import fs from "node:fs";
import path from "node:path";
import { POST_LIMIT } from "../config.js";

const generatedRoot = path.join(process.cwd(), "public", "generated");

function latestDir() {
  if (!fs.existsSync(generatedRoot)) {
    throw new Error("No generated output found. Run scripts/dry-all.ps1 first.");
  }

  const dirs = fs.readdirSync(generatedRoot)
    .filter((name) => fs.statSync(path.join(generatedRoot, name)).isDirectory())
    .sort();

  if (!dirs.length) throw new Error("No generated date folder found. Run scripts/dry-all.ps1 first.");
  return path.join(generatedRoot, dirs.at(-1));
}

function validateSlot(dir, slot) {
  const jsonPath = path.join(dir, `${slot}.json`);

  if (!fs.existsSync(jsonPath)) throw new Error(`Missing ${slot}.json`);

  const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const pngPath = payload.imagePath || path.join(dir, `${slot}.png`);

  if (!fs.existsSync(pngPath)) throw new Error(`Missing ${slot} image at ${pngPath}`);
  const pngSize = fs.statSync(pngPath).size;

  if (pngSize < 10_000) throw new Error(`${slot}.png looks too small: ${pngSize} bytes`);
  if (!Array.isArray(payload.thread) || !payload.thread.length) throw new Error(`${slot} has no thread array`);

  payload.thread.forEach((part, index) => {
    if (part.length > POST_LIMIT) {
      throw new Error(`${slot} part ${index + 1} is ${part.length} chars, above ${POST_LIMIT}`);
    }
  });

  console.log(`${slot}: OK (${payload.thread.length} post part(s), image ${(pngSize / 1024).toFixed(1)} KB)`);
}

const dir = latestDir();
console.log(`Validating ${dir}`);
validateSlot(dir, "morning");
validateSlot(dir, "evening");
console.log("All generated content passed validation.");
