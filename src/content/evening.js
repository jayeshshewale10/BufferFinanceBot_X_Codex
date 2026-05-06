import { getTrendingGeopoliticsNews } from "../news/rss.js";
import { pickRun } from "../utils/date.js";

function inferImpact(title) {
  const lower = title.toLowerCase();

  if (lower.includes("oil") || lower.includes("crude") || lower.includes("iran") || lower.includes("middle east")) {
    return {
      topic: "Oil Shock Watch",
      happened: title,
      matters: "India imports most of its crude. Expensive oil can hurt inflation, rupee and company margins.",
      impact: "Watch: oil, INR, OMCs, airlines, paints, gold."
    };
  }

  if (lower.includes("tariff") || lower.includes("trade") || lower.includes("china")) {
    return {
      topic: "Trade War Watch",
      happened: title,
      matters: "Trade tension changes supply chains. That can move exporters, metals, tech and currencies fast.",
      impact: "Watch: IT, metals, pharma, INR, global indices."
    };
  }

  if (lower.includes("gold") || lower.includes("dollar") || lower.includes("fed")) {
    return {
      topic: "Dollar-Gold Watch",
      happened: title,
      matters: "When fear rises, money often moves to the dollar and gold before stocks react.",
      impact: "Watch: gold, USD-INR, Nifty, banks, import-heavy stocks."
    };
  }

  if (lower.includes("war") || lower.includes("russia") || lower.includes("ukraine") || lower.includes("sanction")) {
    return {
      topic: "War Risk Watch",
      happened: title,
      matters: "War risk can hit energy, food prices and investor mood even before earnings change.",
      impact: "Watch: oil, gas, gold, defence, FMCG margins."
    };
  }

  return {
    topic: "Global Risk Watch",
    happened: title,
    matters: "Big geopolitical news can move money before the full impact is clear.",
    impact: "Watch: crude, gold, INR, Nifty, global cues."
  };
}

function cleanHeadline(title) {
  const withoutSource = title.replace(/\s+-\s+[^-]+$/, "");
  return withoutSource.length <= 88 ? withoutSource : `${withoutSource.slice(0, 85).trimEnd()}...`;
}

function posterTitle(headline) {
  const lower = headline.toLowerCase();
  if (lower.includes("oil") || lower.includes("iran") || lower.includes("middle east")) return "GLOBAL OIL SHOCK";
  if (lower.includes("tariff") || lower.includes("trade") || lower.includes("china")) return "TRADE WAR RISK";
  if (lower.includes("gold") || lower.includes("dollar")) return "SAFE HAVEN RUSH";
  if (lower.includes("war") || lower.includes("russia") || lower.includes("ukraine")) return "WAR RISK RISES";
  return "GLOBAL MARKET RISK";
}

function impactChain(headline) {
  const lower = headline.toLowerCase();
  if (lower.includes("oil") || lower.includes("iran") || lower.includes("middle east")) {
    return "War Risk -> Oil Up -> Inflation Up -> Markets Volatile";
  }
  if (lower.includes("tariff") || lower.includes("trade") || lower.includes("china")) {
    return "Tariffs -> Costs Up -> Margins Down -> Stocks Volatile";
  }
  if (lower.includes("gold") || lower.includes("dollar")) {
    return "Fear -> Dollar Up -> Gold Up -> Stocks Nervous";
  }
  return "Conflict -> Commodities Move -> INR Reacts -> Stocks Volatile";
}

export async function buildEveningPost() {
  const story = await getTrendingGeopoliticsNews();
  const headline = cleanHeadline(story.title);
  const impact = inferImpact(headline);
  const angle = pickRun([
    "India lens: crude decides inflation mood.",
    "Missing angle: INR and margins react fast.",
    "Watch the second-order impact, not just the headline.",
    "For India, oil risk is market risk."
  ], "evening-angle");

  const post = `This news can affect Indian investors:\n\n${headline}\n\nWhy it matters:\nOil risk can hit inflation, rupee and margins fast.\n\n${angle}`;

  return {
    slot: "evening",
    post,
    source: story.link,
    image: {
      title: posterTitle(headline),
      topic: headline,
      subtext: impactChain(headline),
      bullets: [
        "WAR RISK",
        "OIL UP",
        "INFLATION",
        "MARKETS"
      ],
      kind: "geopolitics"
    },
    hashtags: ["#Geopolitics", "#IndianMarkets", "#StockMarket", "#OilPrices", "#Gold", "#Nifty"]
  };
}
