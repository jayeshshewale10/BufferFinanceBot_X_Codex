function normalize(text) {
  return String(text || "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, words) {
  const lower = text.toLowerCase();
  return words.some((word) => lower.includes(word));
}

function detectLane(post) {
  if (includesAny(post, ["iran", "israel", "russia", "ukraine", "war", "sanction", "red sea", "hormuz", "middle east"])) {
    return "geopolitics";
  }

  if (includesAny(post, ["oil", "crude", "brent", "gold", "dollar", "rupee", "inflation", "fed", "rate", "yield"])) {
    return "macro";
  }

  if (includesAny(post, ["nifty", "sensex", "stock", "market", "earnings", "valuation", "fii", "dii", "portfolio"])) {
    return "markets";
  }

  if (includesAny(post, ["sip", "mutual fund", "compounding", "long term", "investing", "wealth", "patience"])) {
    return "investing";
  }

  if (includesAny(post, ["salary", "saving", "debt", "credit card", "loan", "emi", "spending", "income"])) {
    return "personalFinance";
  }

  return "general";
}

function topic(post) {
  const lower = post.toLowerCase();
  const topics = [
    ["Strait of Hormuz", ["hormuz"]],
    ["crude oil", ["oil", "crude", "brent"]],
    ["gold", ["gold"]],
    ["the rupee", ["rupee", "inr", "usd/inr"]],
    ["inflation", ["inflation", "cpi"]],
    ["US rates", ["fed", "rate", "yield"]],
    ["China trade", ["china", "tariff", "trade war"]],
    ["Nifty", ["nifty"]],
    ["retail investors", ["retail", "investor"]],
    ["SIPs", ["sip"]],
    ["debt", ["debt", "loan", "emi", "credit card"]]
  ];

  for (const [label, keys] of topics) {
    if (keys.some((key) => lower.includes(key))) return label;
  }

  const words = post
    .replace(/[^a-zA-Z0-9₹$% ]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 4);

  return words.slice(0, 2).join(" ") || "this";
}

function keepShort(lines) {
  return lines
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 275);
}

export function buildContextReplies(rawPost) {
  const post = normalize(rawPost);
  const lane = detectLane(post);
  const keyTopic = topic(post);

  const byLane = {
    geopolitics: [
      keepShort([`The market angle is ${keyTopic}, not the headline.`, "Oil, shipping insurance and INR usually react before retail investors connect the dots."]),
      keepShort([`If ${keyTopic} escalates, India feels it through crude first.`, "That quietly hits inflation, margins and rate-cut hopes."]),
      keepShort(["Most people read this as politics.", `Markets read it as a supply-chain and commodity-risk signal.`])
    ],
    macro: [
      keepShort([`The key variable here is ${keyTopic}.`, "If it keeps moving, the second-order impact shows up in inflation, INR and sector margins."]),
      keepShort(["This is bigger than a one-day market move.", `${keyTopic} can change earnings assumptions before earnings actually change.`]),
      keepShort(["The headline tells you what happened.", `The trade is in what ${keyTopic} does next.`])
    ],
    markets: [
      keepShort([`The real question is not whether ${keyTopic} moved today.`, "It is whether the reason changes earnings, rates or liquidity."]),
      keepShort(["Price is the loud part.", "The quiet part is whether FIIs, rates and earnings start agreeing with it."]),
      keepShort(["A move without a reason fades fast.", `A move backed by liquidity and earnings can become a trend.`])
    ],
    investing: [
      keepShort(["True, but the hard part is not knowing this.", "The hard part is behaving this way during a 20% drawdown."]),
      keepShort([`This is why ${keyTopic} works only for people who can stay boring.`, "Most investors want compounding but hate the waiting room."]),
      keepShort(["The underrated edge is emotional stamina.", "Without it, even a good portfolio becomes a bad decision machine."])
    ],
    personalFinance: [
      keepShort(["The hidden point: money habits scale with income.", "If behavior is broken at 50k, it usually breaks harder at 5L."]),
      keepShort([`This is less about ${keyTopic} and more about control.`, "Freedom starts when your lifestyle stops chasing every raise."]),
      keepShort(["Most people optimize returns too early.", "First fix cashflow, debt and impulse spending. Then investing works better."])
    ],
    general: [
      keepShort(["The missing angle is the second-order effect.", "Who benefits, who pays, and what changes if this lasts 6 months?"]),
      keepShort(["The headline is useful.", "But the money is made by asking what this changes next."]),
      keepShort(["Most people stop at the news.", "Investors should map the chain reaction."])
    ]
  };

  return {
    lane,
    topic: keyTopic,
    replies: byLane[lane]
  };
}
