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
