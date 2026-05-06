import { cleanText } from "../utils/text.js";

const feeds = [
  "https://news.google.com/rss/search?q=geopolitics%20markets%20oil%20gold%20India%20when:1d&hl=en-IN&gl=IN&ceid=IN:en",
  "https://news.google.com/rss/search?q=war%20sanctions%20oil%20markets%20when:1d&hl=en-IN&gl=IN&ceid=IN:en",
  "https://news.google.com/rss/search?q=US%20China%20Russia%20Middle%20East%20markets%20when:1d&hl=en-IN&gl=IN&ceid=IN:en"
];

const marketKeywords = [
  "oil",
  "gold",
  "sanction",
  "war",
  "tariff",
  "china",
  "russia",
  "iran",
  "middle east",
  "red sea",
  "dollar",
  "crude",
  "supply",
  "trade"
];

function tagValue(item, tag) {
  const cdata = item.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdata) return cdata[1];

  return item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1] || "";
}

export async function getTrendingGeopoliticsNews() {
  const stories = [];

  for (const feed of feeds) {
    try {
      const response = await fetch(feed, {
        headers: { "user-agent": "x-finance-geopolitics-bot/1.0" }
      });
      if (!response.ok) continue;
      const xml = await response.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);

      for (const item of items.slice(0, 8)) {
        const title = cleanText(tagValue(item, "title"));
        const link = cleanText(tagValue(item, "link"));
        const pubDate = cleanText(tagValue(item, "pubDate"));
        const score = marketKeywords.reduce((sum, keyword) => {
          return sum + (title.toLowerCase().includes(keyword) ? 2 : 0);
        }, 0);
        stories.push({ title, link, pubDate, score });
      }
    } catch {
      // A single feed failure should not stop the scheduled post.
    }
  }

  stories.sort((a, b) => b.score - a.score);

  return stories[0] || {
    title: "Global uncertainty keeps oil, gold and currencies in focus",
    link: "",
    pubDate: new Date().toUTCString(),
    score: 0
  };
}
