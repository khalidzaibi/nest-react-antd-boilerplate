export function buildDynamicPipeline({
  searchableFields = [],
  filters,
  sorting,
  populates,
  page = null,
  perPage = null,
}: {
  searchableFields?: string[];
  filters?: Record<string, any>;
  sorting?: Record<string, any>;
  populates: {
    path: string;
    collectionName: string;
    select?: string;
    localField?: string;
    foreignField?: string;
    isArray?: boolean;
  }[];
  page?: number | null;
  perPage?: number | null;
}) {
  const pipeline: any[] = [];
  const lookupStages: any[] = [];

  // --- 1. Apply filters (split into base vs populated to move matches before lookups) ---
  const preLookupMatch: Record<string, any> = {};
  const postLookupMatch: Record<string, any> = {};
  const baseSearchConditions: any[] = [];
  const populatedSearchConditions: any[] = [];

  // Soft-delete handling (Laravel-style flags)
  let trashMode: "with" | "without" | "only" = "without";
  if (filters) {
    if (filters.onlyTrash) trashMode = "only";
    else if (filters.withTrash) trashMode = "with";
    else if (filters.withoutTrash) trashMode = "without";
    delete (filters as any).onlyTrash;
    delete (filters as any).withTrash;
    delete (filters as any).withoutTrash;
  }

  // Enforce soft-delete default unless explicitly overridden
  // if (!filters || filters.deletedAt === undefined) {
  //   if (trashMode === "without") {
  //     preLookupMatch.deletedAt = { $exists: false };
  //   } else if (trashMode === "only") {
  //     preLookupMatch.deletedAt = { $exists: true };
  //   }
  // }

  if (filters && Object.keys(filters).length > 0) {
    for (const [key, rawValue] of Object.entries(filters)) {
      if (
        key === "search" &&
        typeof rawValue === "string" &&
        rawValue.trim() !== ""
      ) {
        // Base fields search
        if (Array.isArray(searchableFields)) {
          searchableFields.forEach((field) => {
            baseSearchConditions.push({
              [field]: { $regex: rawValue, $options: "i" },
            });
          });
        }
        // Populated fields search
        populates.forEach(({ path, select }) => {
          if (select) {
            select.split(" ").forEach((field) => {
              populatedSearchConditions.push({
                [`${path}.${field}`]: { $regex: rawValue, $options: "i" },
              });
            });
          }
        });
        continue;
      }

      const value =
        typeof rawValue === "string"
          ? { $regex: rawValue, $options: "i" }
          : rawValue;

      if (key.includes(".")) {
        postLookupMatch[key] = value;
      } else {
        preLookupMatch[key] = value;
      }
    }
  }

  const buildMatchStage = (
    matches: Record<string, any>,
    search: any[]
  ): any | null => {
    if (Object.keys(matches).length === 0 && search.length === 0) return null;
    const clauses: any[] = [];
    if (Object.keys(matches).length > 0) clauses.push(matches);
    if (search.length > 0) clauses.push({ $or: search });
    if (clauses.length === 1) return { $match: clauses[0] };
    return { $match: { $and: clauses } };
  };

  const applyBaseSearchPre = populatedSearchConditions.length === 0;

  const preLookupMatchStage = buildMatchStage(
    preLookupMatch,
    applyBaseSearchPre ? baseSearchConditions : []
  );
  if (preLookupMatchStage) {
    pipeline.push(preLookupMatchStage);
  }

  // --- 2. Dynamically create $lookups for all populates ---
  populates.forEach(
    ({ path, collectionName, localField, foreignField, isArray }) => {
      lookupStages.push({
        $lookup: {
          from: collectionName,
          localField: localField || path,
          foreignField: foreignField || "_id",
          as: path,
        },
      });

      // Only unwind if it's *not* an array relationship
      if (!isArray) {
        lookupStages.push({
          $unwind: {
            path: `$${path}`,
            preserveNullAndEmptyArrays: true,
          },
        });
      }
    }
  );

  const postLookupMatchStage = buildMatchStage(postLookupMatch, [
    ...(applyBaseSearchPre ? [] : baseSearchConditions),
    ...populatedSearchConditions,
  ]);

  // --- 3. Apply global search (optional) ---
  //   if (search) {
  //     const searchConditions: any[] = [];

  //     // 1️⃣ Search in top-level fields
  //     if (Array.isArray(searchableFields)) {
  //       searchableFields.forEach((field) => {
  //         searchConditions.push({ [field]: { $regex: search, $options: "i" } });
  //       });
  //     }

  //     // 2️⃣ Search in populated fields automatically
  //     populates.forEach(({ path, select }) => {
  //       if (select) {
  //         select.split(" ").forEach((field) => {
  //           searchConditions.push({
  //             [`${path}.${field}`]: { $regex: search, $options: "i" },
  //           });
  //         });
  //       }
  //     });

  //     if (searchConditions.length > 0) {
  //       pipeline.push({ $match: { $or: searchConditions } });
  //     }
  //   }

  // --- 4. Sorting ---
  if (sorting && Object.keys(sorting).length > 0) {
    var sortStage: Record<string, 1 | -1> | null = {};
    var addFieldsStage: Record<string, any> | null = {};

    for (const [key, value] of Object.entries(sorting)) {
      const direction = value === "asc" || value === 1 ? 1 : -1;

      if (key.includes(".")) {
        // Handle nested lookup sorting like "account.deliveryName"
        const [, field] = key.split("."); // Only take "deliveryName"
        addFieldsStage[field] = `$${key}`; // Flatten into top-level field
        sortStage[field] = direction;
      } else {
        sortStage[key] = direction;
      }
    }

    if (addFieldsStage && Object.keys(addFieldsStage).length === 0) {
      addFieldsStage = null;
    }
    if (sortStage && Object.keys(sortStage).length === 0) {
      sortStage = null;
    }
  } else {
    var sortStage: Record<string, 1 | -1> | null = { createdAt: -1 };
    var addFieldsStage: Record<string, any> | null = null;
  }

  const hasNestedSort =
    sorting &&
    Object.keys(sorting).some((key) => key.includes(".") || key.includes("$"));
  const hasPopulatedFilters = Boolean(postLookupMatchStage);
  const hasPopulatedSearch = populatedSearchConditions.length > 0;
  const canDeferLookups =
    !hasNestedSort && !hasPopulatedFilters && !hasPopulatedSearch;

  const pushSort = () => {
    if (addFieldsStage) pipeline.push({ $addFields: addFieldsStage });
    if (sortStage) pipeline.push({ $sort: sortStage });
  };

  const pushPagination = () => {
    if (!page || !perPage) return;
    const skip = (Number(page) - 1) * Number(perPage);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(perPage) });
  };

  if (canDeferLookups) {
    pushSort();
    pushPagination();
    pipeline.push(...lookupStages);
  } else {
    pipeline.push(...lookupStages);
    if (postLookupMatchStage) {
      pipeline.push(postLookupMatchStage);
    }
    pushSort();
    pushPagination();
  }

  return pipeline;
}
