// Lightweight natural-language helpers for the content generator.

export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ")
    .trim();
}

export function capitalize(input: string): string {
  const s = input.trim();
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** ["a","b","c"] -> "a, b and c" */
export function listToSentence(items: string[], conjunction = "and"): string {
  const clean = items.map((i) => i.trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} ${conjunction} ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")} ${conjunction} ${clean[clean.length - 1]}`;
}

/** Truncate to a max length on a word boundary, used for meta descriptions. */
export function clampText(input: string, max: number): string {
  const s = input.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\s]+$/, "") + "…";
}

/** Lowercase first letter unless the word looks like a proper noun/acronym. */
export function decap(input: string): string {
  const s = input.trim();
  if (!s) return s;
  if (s.length > 1 && s[0] === s[0].toUpperCase() && s[1] === s[1].toUpperCase()) return s; // acronym
  return s[0].toLowerCase() + s.slice(1);
}

export function domainOf(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}
