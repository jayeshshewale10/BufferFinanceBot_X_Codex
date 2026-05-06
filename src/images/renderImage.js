import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { config } from "../config.js";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapWords(text, maxChars, maxLines) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function textBlock(lines, x, y, size, weight = 800, color = "#f8fafc", gap = 1.2) {
  return lines.map((line, index) => {
    const dy = y + index * size * gap;
    return `<text x="${x}" y="${dy}" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(line)}</text>`;
  }).join("");
}

function motivationSvg(data) {
  const title = wrapWords(data.title, 18, 3);
  const subtitle = wrapWords(data.subtitle, 24, 3);

  return `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#07111f"/>
        <stop offset="0.55" stop-color="#111827"/>
        <stop offset="1" stop-color="#06070d"/>
      </linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="1080" height="1350" fill="url(#bg)"/>
    <path d="M90 980 C210 820 310 890 430 760 S670 620 810 430 S920 310 1000 250" fill="none" stroke="#22c55e" stroke-width="12" filter="url(#glow)"/>
    <path d="M90 1030 C260 1040 330 910 470 930 S690 870 820 760 S910 690 1000 710" fill="none" stroke="#ef4444" stroke-width="7" opacity="0.75"/>
    <circle cx="790" cy="330" r="78" fill="#0f172a" stroke="#22d3ee" stroke-width="5"/>
    <text x="760" y="358" font-size="76" font-weight="900" fill="#22d3ee">₹</text>
    <g font-family="Inter, Arial, sans-serif">
      ${textBlock(title, 76, 178, 82, 900, "#f8fafc", 1.08)}
      <rect x="76" y="650" width="928" height="4" fill="#22c55e"/>
      ${textBlock(subtitle, 76, 760, 56, 800, "#a7f3d0", 1.18)}
      <text x="76" y="1200" font-size="34" font-weight="700" fill="#94a3b8">Built for patience. Shared by winners.</text>
    </g>
  </svg>`;
}

function infographicSvg(data) {
  const title = wrapWords(data.title, 20, 2);
  const bullets = data.bullets || [];

  return `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#020617"/>
        <stop offset="0.6" stop-color="#111827"/>
        <stop offset="1" stop-color="#0a0f1f"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1350" fill="url(#bg)"/>
    <g font-family="Inter, Arial, sans-serif">
      <text x="70" y="92" font-size="34" font-weight="800" fill="#22d3ee">GEOPOLITICS → MARKETS</text>
      ${textBlock(title, 70, 210, 88, 900, "#f8fafc", 1.08)}
      <rect x="70" y="430" width="940" height="3" fill="#22c55e"/>
      <g transform="translate(80 540)">
        <circle cx="72" cy="72" r="58" fill="#172554" stroke="#38bdf8" stroke-width="4"/>
        <text x="42" y="98" font-size="78" font-weight="900" fill="#38bdf8">🛢</text>
        <circle cx="402" cy="72" r="58" fill="#1f2937" stroke="#fbbf24" stroke-width="4"/>
        <text x="370" y="98" font-size="72" font-weight="900" fill="#fbbf24">₹</text>
        <circle cx="732" cy="72" r="58" fill="#052e16" stroke="#22c55e" stroke-width="4"/>
        <text x="695" y="98" font-size="70" font-weight="900" fill="#22c55e">↗</text>
      </g>
      ${bullets.map((bullet, index) => {
        const y = 760 + index * 108;
        return `<g>
          <rect x="80" y="${y - 58}" width="920" height="80" rx="8" fill="#0f172a" stroke="#243244"/>
          <circle cx="130" cy="${y - 18}" r="15" fill="#22c55e"/>
          <text x="168" y="${y - 3}" font-size="42" font-weight="800" fill="#e5e7eb">${escapeXml(bullet)}</text>
        </g>`;
      }).join("")}
      <text x="80" y="1240" font-size="34" font-weight="700" fill="#94a3b8">Fast signal for Indian investors</text>
    </g>
  </svg>`;
}

function geopoliticsPrompt(data) {
  return [
    "cinematic high impact geopolitical news poster for social media",
    "ultra realistic dramatic lighting dark theme orange red highlights movie poster feel",
    "large scale conflict and economic tension, warships, fighter jets, oil tanker, oil rigs, smoke, explosions, stock market chart hologram",
    "one strong central subject: oil tanker in rough sea near conflict zone, glowing map lines, currency pressure",
    "mobile friendly center focused clean composition, high contrast, sharp 4k, scroll stopping",
    `topic: ${data.topic || data.title}`,
    "no text, no letters, no watermark"
  ].join(", ");
}

async function fetchFreeAiBackground(data) {
  if (!config.images.enableFreeAi) return null;

  const prompt = encodeURIComponent(geopoliticsPrompt(data));
  const url = `${config.images.pollinationsBaseUrl}/${prompt}?width=1080&height=1350&model=flux&nologo=true&private=true&seed=${encodeURIComponent(data.topic || data.title || "geopolitics")}`;

  try {
    const response = await fetch(url, {
      headers: { "user-agent": "x-finance-geopolitics-bot/1.0" }
    });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("image")) return null;

    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

function geopoliticsOverlaySvg(data) {
  const title = wrapWords(data.title, 12, 3);
  const topic = wrapWords(data.topic || "", 36, 2);
  const subtext = wrapWords(data.subtext || "Conflict -> Oil -> Inflation -> Markets", 38, 2);
  const bullets = data.bullets || ["WAR", "OIL", "INFLATION", "MARKETS"];

  return `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000000" stop-opacity="0.18"/>
        <stop offset="0.42" stop-color="#000000" stop-opacity="0.08"/>
        <stop offset="0.72" stop-color="#000000" stop-opacity="0.70"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.96"/>
      </linearGradient>
      <filter id="hotGlow"><feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="1080" height="1350" fill="url(#shade)"/>
    <rect x="38" y="36" width="1004" height="1278" fill="none" stroke="#fb3b14" stroke-width="3" opacity="0.55"/>
    <g font-family="Impact, Anton, Arial Black, Arial, sans-serif" text-anchor="middle">
      <rect x="0" y="625" width="1080" height="360" fill="#020202" opacity="0.55"/>
      ${title.map((line, index) => {
        const y = 735 + index * 118;
        const fill = index === title.length - 1 ? "#ff3b12" : "#f8fafc";
        return `<text x="540" y="${y}" font-size="116" font-weight="900" fill="${fill}" stroke="#260500" stroke-width="3" filter="url(#hotGlow)">${escapeXml(line)}</text>`;
      }).join("")}
      ${topic.map((line, index) => `<text x="540" y="${118 + index * 42}" font-size="34" font-weight="800" fill="#dbeafe" opacity="0.92">${escapeXml(line)}</text>`).join("")}
      ${subtext.map((line, index) => `<text x="540" y="${1018 + index * 42}" font-size="37" font-weight="900" fill="#ffedd5">${escapeXml(line)}</text>`).join("")}
    </g>
    <g font-family="Arial, sans-serif" text-anchor="middle">
      ${bullets.map((bullet, index) => {
        const x = 165 + index * 250;
        const icon = index === 0 ? "!" : index === 1 ? "OIL" : index === 2 ? "₹" : "↯";
        const arrow = index < bullets.length - 1 ? `<text x="${x + 125}" y="1164" font-size="58" font-weight="900" fill="#ff6b1a" filter="url(#hotGlow)">→</text>` : "";
        return `<g>
          <circle cx="${x}" cy="1138" r="70" fill="#130404" stroke="#ff2d12" stroke-width="5" filter="url(#hotGlow)"/>
          <text x="${x}" y="1160" font-size="${icon === "OIL" ? 34 : 58}" font-weight="900" fill="#ffb020">${escapeXml(icon)}</text>
          <text x="${x}" y="1248" font-size="30" font-weight="900" fill="#f8fafc">${escapeXml(bullet)}</text>
          ${arrow}
        </g>`;
      }).join("")}
    </g>
  </svg>`;
}

function splitPosterTitle(title) {
  const words = String(title || "GLOBAL MARKET RISK").split(/\s+/);
  if (title.length <= 17) return [title];

  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > 13 && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function geopoliticsPosterSvg(data) {
  const titleLines = splitPosterTitle(data.title);
  const topicLines = wrapWords(data.topic || "Global market risk is rising", 44, 2);
  const subtext = data.subtext || "War Risk -> Oil Up -> Inflation Up -> Markets Volatile";
  const flow = [
    { icon: "!", label: "WAR RISK" },
    { icon: "OIL", label: "OIL UP" },
    { icon: "₹", label: "INFLATION" },
    { icon: "↯", label: "MARKETS" }
  ];

  return `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#030712"/>
        <stop offset="0.48" stop-color="#111827"/>
        <stop offset="0.75" stop-color="#1b0b08"/>
        <stop offset="1" stop-color="#020202"/>
      </linearGradient>
      <radialGradient id="fire" cx="78%" cy="40%" r="42%">
        <stop offset="0" stop-color="#ff7a18" stop-opacity="0.9"/>
        <stop offset="0.35" stop-color="#ef2917" stop-opacity="0.45"/>
        <stop offset="1" stop-color="#020202" stop-opacity="0"/>
      </radialGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="soft"><feGaussianBlur stdDeviation="16"/></filter>
    </defs>

    <rect width="1080" height="1350" fill="url(#sky)"/>
    <rect width="1080" height="760" fill="url(#fire)"/>
    <rect x="38" y="36" width="1004" height="1278" fill="none" stroke="#fb3b14" stroke-width="3" opacity="0.62"/>

    <g opacity="0.9">
      <circle cx="840" cy="420" r="150" fill="#ff3b12" opacity="0.18" filter="url(#soft)"/>
      <path d="M680 455 C760 330 830 380 900 265 C940 340 900 410 970 500 C845 470 785 540 680 455Z" fill="#0b0f19" opacity="0.84"/>
      <path d="M745 410 C820 315 860 365 925 280" stroke="#ff6b1a" stroke-width="8" fill="none" filter="url(#glow)"/>
    </g>

    <g opacity="0.88">
      <path d="M120 505 C260 455 385 478 505 520 C650 570 790 552 980 492" fill="none" stroke="#1f2937" stroke-width="16"/>
      <path d="M205 548 L835 548 L780 625 L270 625 Z" fill="#05070d" stroke="#f97316" stroke-width="3"/>
      <rect x="415" y="470" width="260" height="80" rx="8" fill="#080b12" stroke="#fbbf24" stroke-width="3"/>
      <rect x="485" y="405" width="120" height="66" rx="10" fill="#101827" stroke="#f59e0b" stroke-width="3"/>
      <circle cx="540" cy="545" r="14" fill="#f97316" filter="url(#glow)"/>
    </g>

    <g opacity="0.85" stroke="#fb923c" stroke-width="3" fill="none">
      <path d="M170 250 C300 185 415 215 540 160 C665 215 770 190 910 240"/>
      <path d="M540 160 L585 250 L690 280"/>
      <circle cx="540" cy="160" r="9" fill="#fb923c" filter="url(#glow)"/>
    </g>

    <g fill="#d1d5db" opacity="0.95">
      <path d="M155 225 L330 270 L185 292 Z"/>
      <path d="M790 205 L970 250 L825 275 Z"/>
    </g>

    <rect x="0" y="650" width="1080" height="700" fill="#020202" opacity="0.68"/>
    <rect x="0" y="590" width="1080" height="180" fill="#020202" opacity="0.35"/>

    <g font-family="Arial Black, Impact, Arial, sans-serif" text-anchor="middle">
      ${topicLines.map((line, index) => `<text x="540" y="${100 + index * 44}" font-size="34" font-weight="900" fill="#cbd5e1">${escapeXml(line)}</text>`).join("")}
      ${titleLines.map((line, index) => {
        const y = titleLines.length === 1 ? 790 : 738 + index * 112;
        const fill = index === titleLines.length - 1 ? "#ff3b12" : "#f8fafc";
        return `<text x="540" y="${y}" font-size="100" font-weight="900" fill="${fill}" stroke="#260500" stroke-width="3" filter="url(#glow)">${escapeXml(line)}</text>`;
      }).join("")}
      <text x="540" y="925" font-size="38" font-weight="900" fill="#ffedd5">${escapeXml(subtext)}</text>
    </g>

    <g font-family="Arial Black, Arial, sans-serif" text-anchor="middle">
      ${flow.map((item, index) => {
        const x = 165 + index * 250;
        const arrow = index < flow.length - 1 ? `<text x="${x + 126}" y="1117" font-size="56" font-weight="900" fill="#ff6b1a" filter="url(#glow)">→</text>` : "";
        return `<g>
          <circle cx="${x}" cy="1100" r="70" fill="#130404" stroke="#ff3b1f" stroke-width="5" filter="url(#glow)"/>
          <text x="${x}" y="${item.icon === "OIL" ? 1115 : 1122}" font-size="${item.icon === "OIL" ? 34 : 58}" font-weight="900" fill="#fbbf24">${escapeXml(item.icon)}</text>
          <text x="${x}" y="1218" font-size="30" font-weight="900" fill="#f8fafc">${escapeXml(item.label)}</text>
          ${arrow}
        </g>`;
      }).join("")}
    </g>

    <rect x="78" y="1268" width="924" height="54" rx="8" fill="#120504" stroke="#ff3b1f" stroke-width="3" filter="url(#glow)"/>
    <text x="540" y="1305" font-family="Arial Black, Arial, sans-serif" text-anchor="middle" font-size="28" font-weight="900" fill="#f8fafc">WHAT HAPPENS GLOBALLY CAN MOVE YOUR MONEY</text>
  </svg>`;
}

async function geopoliticsImage(data) {
  return sharp(Buffer.from(geopoliticsPosterSvg(data))).png();
}

export async function renderImage(imageData, outDir, filename) {
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, filename);

  if (imageData.kind === "geopolitics") {
    await (await geopoliticsImage(imageData)).toFile(outPath);
    return outPath;
  }

  const svg = imageData.kind === "infographic" ? infographicSvg(imageData) : motivationSvg(imageData);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  return outPath;
}
