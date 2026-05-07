export function istDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function istDateKey(date = new Date()) {
  const parts = istDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function pickDaily(items, salt = "") {
  const key = `${istDateKey()}-${salt}`;
  const total = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return items[total % items.length];
}

export function pickRun(items, salt = "") {
  const bucket = Math.floor(Date.now() / (1000 * 60 * 15));
  const seed = process.env.POST_VARIATION_SEED || "";
  const key = `${istDateKey()}-${bucket}-${seed}-${salt}`;
  const total = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return items[total % items.length];
}
