const targets = [
  {
    handle: "@deepakshenoy",
    name: "Deepak Shenoy",
    lane: "India investing, macro, market behavior",
    trigger: "Market selloff, crude oil, Nifty, long-term investing"
  },
  {
    handle: "@dmuthuk",
    name: "Muthukrishnan Dhandapani",
    lane: "Long-term investing psychology",
    trigger: "Patience, SIP, compounding, investor behavior"
  },
  {
    handle: "@warikoo",
    name: "Ankur Warikoo",
    lane: "Personal finance, money mindset, careers",
    trigger: "Saving, spending, discipline, beginner money lessons"
  },
  {
    handle: "@nithin0dha",
    name: "Nithin Kamath",
    lane: "Indian markets, brokerage, market structure, fintech",
    trigger: "Retail investing, market rules, risk, investor protection"
  },
  {
    handle: "@zerodha",
    name: "Zerodha",
    lane: "Investor education and market explainers",
    trigger: "Varsity-style explainers, market basics, risk education"
  },
  {
    handle: "@ianbremmer",
    name: "Ian Bremmer",
    lane: "Global geopolitics and political risk",
    trigger: "War, sanctions, US-China, Middle East, global risk"
  },
  {
    handle: "@business",
    name: "Bloomberg",
    lane: "Global markets and breaking business news",
    trigger: "Oil, dollar, Fed, commodities, market-moving headlines"
  },
  {
    handle: "@Reuters",
    name: "Reuters",
    lane: "Breaking global news",
    trigger: "Fresh geopolitical headline with market impact"
  },
  {
    handle: "@ReutersBiz",
    name: "Reuters Business",
    lane: "Business, markets, commodities",
    trigger: "Stocks, oil, currencies, gold, central banks"
  },
  {
    handle: "@unusual_whales",
    name: "Unusual Whales",
    lane: "Market flows and viral finance chatter",
    trigger: "Big market moves, options, political trades, risk-on/risk-off"
  }
];

const replies = {
  investing: [
    "The underrated risk is not volatility.\nIt is changing your plan every time volatility appears.",
    "Most investors do not lose because they picked the wrong asset.\nThey lose because they could not sit through the right one.",
    "Everyone wants alpha.\nVery few people want the boring behavior that allows alpha to survive."
  ],
  markets: [
    "The headline is only layer one.\nThe real move is in oil, INR, margins and inflation expectations.",
    "Markets do not wait for certainty.\nThey move when probabilities change.",
    "The crowd asks, 'Good news or bad news?'\nInvestors should ask, 'Who benefits if this continues?'"
  ],
  geopolitics: [
    "This is not just geopolitics.\nIt is a supply-chain, oil, inflation and currency story in disguise.",
    "The missing angle: markets price the second-order impact before the public understands the first.",
    "War risk rarely stays local.\nIt travels through oil, shipping, insurance and then your portfolio."
  ],
  personalFinance: [
    "Personal finance is not about looking rich.\nIt is about buying freedom before buying status.",
    "The real flex is not a higher income.\nIt is a lower dependence on the next paycheck.",
    "Most money problems start as behavior problems.\nThe spreadsheet only reveals them."
  ]
};

const schedule = [
  {
    time: "08:45-09:15 IST",
    action: "Reply to India finance creators before/after your morning post.",
    lanes: ["investing", "personalFinance"]
  },
  {
    time: "12:15-13:00 IST",
    action: "Reply to market chatter while Indian market narratives are forming.",
    lanes: ["markets", "investing"]
  },
  {
    time: "17:30-18:20 IST",
    action: "Reply to geopolitics and commodity headlines before/after your evening post.",
    lanes: ["geopolitics", "markets"]
  },
  {
    time: "Breaking news: within 5-10 minutes",
    action: "Reply only if you can add a market-impact angle.",
    lanes: ["geopolitics", "markets"]
  }
];

export function buildReplyPlan() {
  return { targets, replies, schedule };
}
