import { SafeRoleDto } from "../dto/roles.dto";

// if your Role.permissions are strings (keys), this keeps them as-is
// if they might be populated Permission docs, we pull `.key`
function normalizePermissions(perms: any[] | undefined): string[] {
  if (!Array.isArray(perms)) return [];
  return perms
    .map((p: any) => {
      if (typeof p === "string") return p;
      if (p && typeof p === "object") {
        // populated Permission doc or lean object
        if (p.key) return String(p.key);
        // ObjectId or something else — ignore gracefully
      }
      return String(p ?? "");
    })
    .filter(Boolean);
}

export function toSafeRoleDto(doc: any): SafeRoleDto {
  return {
    id: doc._id?.toString() ?? String(doc._id ?? ""),
    name: doc.name,
    label: toTitleCase(doc.name),
    value: doc._id?.toString() ?? String(doc._id ?? ""),
    permissions: normalizePermissions(doc.permissions),
    groupedPermissions: groupRoleKeysByModule(doc.permissions),
    createdAt: doc.createdAt?.toISOString?.() ?? String(doc.createdAt ?? ""),
    updatedAt: doc.updatedAt?.toISOString?.() ?? String(doc.updatedAt ?? ""),
    createdBy: doc.createdBy?.name ?? null,
    updatedBy: doc.updatedBy?.name ?? null,
  };
}

// src/rbac/mappers/roles.mapper.ts
type Grouped = Record<string, Array<{ key: string; label: string }>>;

function toTitleCase(s: string) {
  return String(s)
    .trim()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Accepts: string[] | string | populated Permission[] | anything -> string[] of keys */
function normalizeToKeyArray(input: any): string[] {
  if (Array.isArray(input)) {
    return input
      .map((v) => {
        if (typeof v === "string") return v;
        if (v && typeof v === "object") return v.key || ""; // populated Permission doc/lean object
        return "";
      })
      .filter(Boolean);
  }
  if (typeof input === "string") return [input];
  return [];
}

/** Group by first segment; label is the LAST segment ("Read", "Update", etc.) */
export function groupRoleKeysByModule(roleKeys: any): Grouped {
  const keys = normalizeToKeyArray(roleKeys); // <-- IMPORTANT
  const out: Grouped = {};

  for (const k of keys) {
    const parts = k.split(".").filter(Boolean);
    if (parts.length < 2) continue;
    const module = parts[0];
    const actionOnly = parts[parts.length - 1];
    const label = toTitleCase(actionOnly);

    (out[module] ||= []).push({ key: k, label });
  }

  // optional sort
  for (const m of Object.keys(out)) {
    out[m].sort((a, b) => a.label.localeCompare(b.label));
  }
  return out;
}
