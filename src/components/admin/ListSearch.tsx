"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface Props {
  placeholder?: string;
  queryKey?: string;
  pageKey?: string;
  className?: string;
}

export default function ListSearch({ placeholder = "Search…", queryKey = "q", pageKey = "page", className = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(queryKey) || "";
  const [value, setValue] = useState(urlValue);
  const [syncedFrom, setSyncedFrom] = useState(urlValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (urlValue !== syncedFrom) {
    setSyncedFrom(urlValue);
    setValue(urlValue);
  }

  const push = (v: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (v) params.set(queryKey, v); else params.delete(queryKey);
    params.delete(pageKey);
    router.push(`${pathname}?${params.toString()}`);
  };

  const onChange = (v: string) => {
    setValue(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push(v), 350);
  };

  return (
    <div className={`relative ${className || "w-full sm:w-72"}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron bg-white"
      />
      {value && (
        <button
          type="button"
          onClick={() => { setValue(""); push(""); }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
