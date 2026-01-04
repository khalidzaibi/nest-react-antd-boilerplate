import type { RoleSeed } from "./roles.data";

export const toTitle = (s: string) =>
  String(s)
    .trim()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");

// "users.create" -> "Create Users"
export const labelFromKey = (key: string) => {
  const parts = key.split(".").filter(Boolean);
  if (parts.length < 2) return toTitle(key);
  const mod = toTitle(parts[0]);
  const act = toTitle(parts.slice(1).join(" "));
  return `${act} ${mod}`;
};

// normalize any RoleSeed → { name, keys[] }
export const toFlatKeys = (r: RoleSeed): { name: string; keys: string[] } => {
  const name = r.name.toLowerCase().trim();
  if ("keys" in r) {
    return {
      name,
      keys: Array.from(new Set(r.keys.map((k) => k.toLowerCase().trim()))),
    };
  }
  const keys: string[] = [];
  Object.entries(r.permissions || {}).forEach(([mod, acts]) => {
    (acts || []).forEach((a) => {
      if (a) keys.push(`${mod}.${a}`);
    });
  });
  return {
    name,
    keys: Array.from(new Set(keys.map((k) => k.toLowerCase().trim()))),
  };
};
