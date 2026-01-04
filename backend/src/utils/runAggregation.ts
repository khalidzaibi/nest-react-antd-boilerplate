import { Model } from "mongoose";
// import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "utils/helpers";

/**
 * Runs a paginated aggregation query dynamically
 * with total count and pagination metadata.
 */
export async function runAggregation<T>(
  model: Model<any>, // <-- ensures TypeScript knows it's a Mongoose model
  pipeline: any[],
  toDto: (doc: any) => any,
  page?: number,
  perPage?: number
): Promise<{ data: any[]; pagination?: any }> {
  const pageNum = Number(page);
  const perPageNum = Number(perPage);

  const applyPagination = Boolean(pageNum && perPageNum);
  const hasPaginationStages = pipeline.some(
    (stage) => "$skip" in stage || "$limit" in stage
  );
  const dataPipeline = [...pipeline];

  if (applyPagination && !hasPaginationStages) {
    dataPipeline.push({ $skip: (pageNum - 1) * perPageNum });
    dataPipeline.push({ $limit: perPageNum });
  }

  // No pagination → return full results
  if (!applyPagination) {
    const result = await model.aggregate(dataPipeline).exec();
    return { data: result.map(toDto) };
  }

  // Pagination → apply skip/limit & total count
  const [data, totalCountArr] = await Promise.all([
    model.aggregate(dataPipeline).exec(),
    model.aggregate(buildCountPipeline(pipeline)),
  ]);

  const total = totalCountArr?.[0]?.total || 0;
  const totalPages = Math.ceil(total / perPageNum);

  return {
    data: data.map(toDto),
    pagination: {
      page: pageNum,
      perPage: perPageNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
  };
}

function buildCountPipeline(pipeline: any[]) {
  const needsLookups = pipelineRequiresLookups(pipeline);

  const filteredStages = pipeline.filter((stage) => {
    if ("$skip" in stage || "$limit" in stage || "$sort" in stage) return false;
    if ("$addFields" in stage) return false;
    if (!needsLookups && ("$lookup" in stage || "$unwind" in stage)) {
      return false;
    }
    return true;
  });

  return [...filteredStages, { $count: "total" }];
}

function pipelineRequiresLookups(pipeline: any[]) {
  return pipeline.some((stage) => {
    if (!("$match" in stage)) return false;
    const clause = stage.$match;
    const collectKeys = (node: any): string[] => {
      if (!node || typeof node !== "object") return [];
      if (Array.isArray(node)) return node.flatMap((item) => collectKeys(item));
      return Object.entries(node).flatMap(([key, value]) => {
        if (key === "$and" || key === "$or") return collectKeys(value);
        return [key];
      });
    };
    return collectKeys(clause).some((key) => key.includes("."));
  });
}
