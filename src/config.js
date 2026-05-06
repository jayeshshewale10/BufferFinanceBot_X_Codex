import { loadEnv } from "./utils/env.js";

loadEnv();

export const POST_LIMIT = 280;

function envValue(name) {
  return process.env[name]?.trim();
}

export const config = {
  dryRun: process.argv.includes("--dry-run") || process.env.DRY_RUN === "true",
  fromPreview: process.argv.includes("--from-preview"),
  forceUniquePost: process.env.FORCE_UNIQUE_POST === "true",
  postVariationSeed: envValue("POST_VARIATION_SEED") || String(Date.now()),
  buffer: {
    apiKey: envValue("BUFFER_API_KEY"),
    channelId: envValue("BUFFER_CHANNEL_ID"),
    publicImageBaseUrl: envValue("BUFFER_PUBLIC_IMAGE_BASE_URL")
  },
  images: {
    enableFreeAi: process.env.ENABLE_FREE_AI_IMAGES !== "false",
    pollinationsBaseUrl: process.env.POLLINATIONS_IMAGE_BASE_URL || "https://gen.pollinations.ai/image"
  }
};

export function assertPostingConfig() {
  const missing = Object.entries(config.buffer)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing Buffer config: ${missing.join(", ")}. Use --dry-run to preview without posting.`);
  }
}
