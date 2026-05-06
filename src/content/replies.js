import { pickDaily } from "../utils/date.js";

const replySets = [
  [
    "Everyone is watching the headline.\nThe real money is in the second-order impact.",
    "Bad news does not always mean bad markets.\nMarkets price surprise, not emotions.",
    "The missing angle: inflation reacts before retail investors do.\nThat is where the trade starts."
  ],
  [
    "This is not just geopolitics.\nIt is oil, INR, margins and market mood in one headline.",
    "Most people ask, 'Is this good or bad?'\nInvestors should ask, 'Who benefits if this lasts?'",
    "The market rarely waits for confirmation.\nIt starts moving when probability changes."
  ],
  [
    "One headline can hit four assets at once:\noil, gold, currency and equities.",
    "The crowd sees panic.\nSmart money maps the chain reaction.",
    "If crude moves, India does not ignore it.\nInflation, rupee and sectors all feel it."
  ]
];

export function buildViralReplies() {
  return pickDaily(replySets, "viral-replies");
}
