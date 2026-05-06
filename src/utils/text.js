import { POST_LIMIT } from "../config.js";

export function cleanText(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitThread(text, maxParts = 4) {
  if (text.length <= POST_LIMIT) return [text];

  const lines = text.split(/\n+/).filter(Boolean);
  const parts = [];
  let current = "";

  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line;
    if (next.length <= POST_LIMIT - 6) {
      current = next;
    } else {
      if (current) parts.push(current);
      current = line;
    }
  }

  if (current) parts.push(current);

  if (parts.length > maxParts) {
    return parts.slice(0, maxParts).map((part, index) => {
      if (index !== maxParts - 1) return part;
      return part.slice(0, POST_LIMIT - 20).trimEnd() + "...";
    });
  }

  return parts;
}

export function enforcePostLimit(post) {
  return post.length <= POST_LIMIT ? post : splitThread(post);
}

export function withHashtags(post, hashtags = []) {
  if (!hashtags.length) return post;

  const tagLine = hashtags.slice(0, 4).join(" ");
  const candidate = `${post}\n\n${tagLine}`;
  return candidate.length <= POST_LIMIT ? candidate : post;
}

export function withUniqueManualLine(post, slot, seed) {
  const lines = {
    morning: [
      "Today: calm money wins.",
      "Today: patience is alpha.",
      "Today: behavior beats timing.",
      "Today: boring can be profitable."
    ],
    evening: [
      "Today: watch second-order impact.",
      "Today: crude, INR, margins.",
      "Today: oil first, inflation next.",
      "Today: global risk becomes local prices."
    ]
  };

  const options = lines[slot] || lines.evening;
  const total = [...String(seed || Date.now())].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const line = options[total % options.length];
  const minute = new Date().toISOString().slice(11, 16);
  const candidate = `${post}\n\n${line} (${minute})`;
  if (candidate.length <= POST_LIMIT) return candidate;

  const shorter = `${post}\n\n${line}`;
  if (shorter.length <= POST_LIMIT) return shorter;

  const paragraphs = post.split(/\n\n+/);
  const trimmedPost = paragraphs.length > 2 ? paragraphs.slice(0, -1).join("\n\n") : post;
  const replacement = `${trimmedPost}\n\n${line} (${minute})`;

  return replacement.length <= POST_LIMIT ? replacement : replacement.slice(0, POST_LIMIT - 1).trimEnd();
}
