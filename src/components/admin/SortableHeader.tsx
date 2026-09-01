"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface Props {
  field: string;
  label: string;
  sortKey?: string;
  dirKey?: string;
  pageKey?: string;
  defaultDir?: "asc" | "desc";
  className?: string;
}

export default function SortableHeader({
  field,
  label,
  sortKey = "sort",
  dirKey = "dir",
  pageKey = "page",
  defaultDir = "asc",
  className = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSort = searchParams.get(sortKey);
  const activeDir = searchParams.get(dirKey) === "asc" ? "asc" : "desc";
  const isActive = activeSort === field;

  const onClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(sortKey, field);
    params.set(dirKey, isActive ? (activeDir === "asc" ? "desc" : "asc") : defaultDir);
    params.delete(pageKey);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <th className={`text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider ${className}`}>
      <button type="button" onClick={onClick} className="flex items-center gap-1 hover:text-maroon transition-colors">
        {label}
        {isActive ? (
          activeDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </button>
    </th>
  );
}
