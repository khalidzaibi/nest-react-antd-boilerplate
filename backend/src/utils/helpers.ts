import * as moment from "moment";
export const DEFAULT_PER_PAGE = 20;
export const DEFAULT_PAGE = 1;
export function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9&]+/g, "-") // replace any non-alphanumeric with "-"
    .replace(/^-+|-+$/g, ""); // trim starting and ending dashes
}
export function unslugify(slug: string): string {
  return slug
    .toString()
    .trim()
    .replace(/[-_]+/g, " ") // replace - and _ with spaces
    .replace(/\s+/g, " ") // collapse multiple spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
}

export function toTitleCase(s: string) {
  return s
    .trim()
    .replace(/[-_]+/g, " ") // kebab/underscore to space
    .replace(/\s+/g, " ") // collapse multiple spaces
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
export function buildLabelFromKey(key: string) {
  const raw = String(key).trim();
  const dot = raw.indexOf(".");
  if (dot === -1) {
    // no dot -> just title case the whole thing
    return toTitleCase(raw);
  }
  const moduleRaw = raw.slice(0, dot);
  const actionRaw = raw.slice(dot + 1); // everything after first dot (can contain spaces)
  const moduleTitle = toTitleCase(moduleRaw);
  const actionTitle = toTitleCase(actionRaw);
  return `${actionTitle} ${moduleTitle}`.trim();
}

export function formatDateValue(value: any): string | null {
  if (value === undefined || value === null || value === "") return null;
  const m = moment(value);
  return m.isValid() ? m.format("YYYY-MM-DD") : String(value);
}

export function toNumber(value: any): number | null {
  if (value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
