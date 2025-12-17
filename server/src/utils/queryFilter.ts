import mongoose from "mongoose";

/**
 * Generic query filter builder
 * @param query req.query
 * @param options config cho từng model
 */
export interface QueryFilterOptions {
  searchableFields?: string[];   // text search
  exactFields?: string[];        // filter exact
  populateSearch?: {
    model: string;
    field: string;               // ref field
    searchField: string;         // name/email
  };
  defaultFilter?: Record<string, any>;
}

export const queryFilter = async (
  query: any,
  options: QueryFilterOptions = {}
) => {
  const filter: any = { ...(options.defaultFilter || {}) };

  /* ================= EXACT FILTER ================= */
  if (options.exactFields) {
    for (const field of options.exactFields) {
      if (query[field] !== undefined) {
        filter[field] = query[field];
      }
    }
  }

  /* ================= SEARCH ================= */
  if (query.q && options.searchableFields?.length) {
    const regex = new RegExp(query.q, "i");
    const or: any[] = [];

    // text fields
    for (const field of options.searchableFields) {
      or.push({ [field]: regex });
    }

    // populate search (teacher name, user name…)
    if (options.populateSearch) {
      const ids = await mongoose
        .model(options.populateSearch.model)
        .find({ [options.populateSearch.searchField]: regex })
        .distinct("_id");

      or.push({ [options.populateSearch.field]: { $in: ids } });
    }

    filter.$or = or;
  }

  return filter;
};
