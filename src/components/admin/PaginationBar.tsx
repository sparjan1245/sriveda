"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  pageKey?: string;
}

export default function PaginationBar({ page, pageSize, total, pageKey = "page" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (total === 0) return null;

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(pageKey, String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gold/20 bg-cream/30 flex-wrap gap-3">
      <p className="text-xs text-foreground/50">
        Showing <span className="font-medium text-maroon">{start}–{end}</span> of{" "}
        <span className="font-medium text-maroon">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-gold/30 text-maroon/60 hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-foreground/60 px-2">Page {page} of {totalPages}</span>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-gold/30 text-maroon/60 hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
