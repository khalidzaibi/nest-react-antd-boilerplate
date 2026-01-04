import { SafePermissionDto } from "../dto/permissions.dto";
type GroupedPermissions = Record<
  string,
  Array<{ key: string; label: string; description?: string }>
>;
// ------- Mapper -------
export function toSafePermissionDto(doc: any): SafePermissionDto {
  const id = (doc._id ?? doc.id)?.toString();
  const createdBy = doc.createdBy?.name ?? null;
  const updatedBy = doc.updatedBy?.name ?? null;

  return {
    id,
    key: doc.key,
    label: doc.label,
    description: doc.description,
    createdAt: doc.createdAt?.toString?.() ?? doc.createdAt,
    updatedAt: doc.updatedAt?.toString?.() ?? doc.updatedAt,
    createdBy: createdBy,
    updatedBy: updatedBy,
  };
}

// helpers
const toActionLabel = (action: string) =>
  action
    .replace(/[._-]+/g, " ")
    .trim()
    .toLowerCase(); // e.g. "create" | "read" | "edit items"

export function groupPermissionsByModule(
  docs: Array<{ key: string; label?: string; description?: string }>
): GroupedPermissions {
  const grouped: GroupedPermissions = {};

  for (const p of docs) {
    if (!p?.key) continue;
    const parts = String(p.key).split(".").filter(Boolean);
    if (parts.length < 2) continue;

    const module = parts[0]; // "users", "orders"
    const actionRaw = parts.slice(1).join("."); // supports extra segments if any
    const label = (p.label && p.label.trim()) || toActionLabel(actionRaw);

    (grouped[module] ||= []).push({
      key: p.key,
      label,
      description: p.description,
    });
  }

  // sort modules alphabetically and actions by label or key (your choice)
  for (const mod of Object.keys(grouped)) {
    grouped[mod].sort((a, b) => a.label.localeCompare(b.label));
  }

  return grouped;
}
