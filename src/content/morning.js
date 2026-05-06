import { pickDaily, pickRun } from "../utils/date.js";

const hooks = [
  "Nobody tells you this about investing:",
  "This mistake is costing you lakhs:",
  "99% investors fail because of this:",
  "Your portfolio is not weak. Your patience is.",
  "The market punishes one habit brutally:"
];

const insights = [
  "Wealth is built in boring years, not exciting weeks.",
  "Your biggest edge is doing nothing at the right time.",
  "Greed buys tops. Fear sells bottoms. Patience owns wealth.",
  "The stock market transfers money from panic to patience.",
  "You do not need perfect timing. You need enough time."
];

const explanations = [
  "Checking prices daily feels productive. Holding quality assets actually is.",
  "Most losses start when emotion becomes a strategy.",
  "The investor who survives bad days gets paid on good years.",
  "Fast money looks exciting. Slow money usually wins.",
  "Your behavior compounds before your money does."
];

const closers = [
  "Save this before the next red day.",
  "Your future self will thank your boring self.",
  "The boring investor usually beats the busy one.",
  "Do less. Hold better. Think longer.",
  "Patience is a position too."
];

const hashtagSets = [
  ["#Investing", "#StockMarket", "#PersonalFinance", "#WealthCreation", "#MoneyMindset", "#LongTermInvesting"],
  ["#InvestingTips", "#FinancialFreedom", "#StockMarketIndia", "#Compounding", "#MutualFunds", "#Wealth"],
  ["#Money", "#Investing", "#Finance", "#Nifty", "#SIP", "#LongTerm"]
];

export function buildMorningPost() {
  const hook = pickDaily(hooks, "morning-hook");
  const insight = pickRun(insights, "morning-insight");
  const explanation = pickRun(explanations, "morning-explanation");
  const closer = pickRun(closers, "morning-closer");
  const hashtags = pickDaily(hashtagSets, "morning-hashtags");
  const post = `${hook}\n\n"${insight}"\n\n${explanation}\n\n${closer}`;

  return {
    slot: "morning",
    post,
    image: {
      title: hook.replace(":", ""),
      subtitle: insight,
      kind: "motivation"
    },
    hashtags
  };
}
