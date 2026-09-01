export interface ListParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  q: string;
  sortBy: string | null;
  sortDir: "asc" | "desc";
  filter: string;
}

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseListParams(
  searchParams: RawSearchParams,
  opts: {
    sortableFields: readonly string[];
    pageSize?: number;
    queryKey?: string;
    sortKey?: string;
    dirKey?: string;
    pageKey?: string;
    filterKey?: string;
  }
): ListParams {
  const pageSize = opts.pageSize ?? 10;

  const pageRaw = parseInt(firstValue(searchParams[opts.pageKey ?? "page"]) || "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const q = (firstValue(searchParams[opts.queryKey ?? "q"]) || "").trim();

  const sortRaw = firstValue(searchParams[opts.sortKey ?? "sort"]);
  const sortBy = sortRaw && opts.sortableFields.includes(sortRaw) ? sortRaw : null;

  const dirRaw = firstValue(searchParams[opts.dirKey ?? "dir"]);
  const sortDir: "asc" | "desc" = dirRaw === "asc" ? "asc" : "desc";

  const filter = (firstValue(searchParams[opts.filterKey ?? "filter"]) || "").trim();

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize, q, sortBy, sortDir, filter };
}
