"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Option {
  value: string;
  label: string;
}

interface Props {
  paramKey: string;
  options: Option[];
  allLabel?: string;
  pageKey?: string;
  className?: string;
}

export default function FilterSelect({ paramKey, options, allLabel = "All", pageKey = "page", className = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramKey) || "";

  const onChange = (v: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (v) params.set(paramKey, v); else params.delete(paramKey);
    params.delete(pageKey);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron bg-white ${className}`}
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
