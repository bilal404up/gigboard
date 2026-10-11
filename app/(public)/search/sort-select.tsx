"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "relevance", label: "Relevance" },
  { value: "best_selling", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
];

export function SortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const search = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(search?.toString() ?? "");
    if (e.target.value === "relevance") params.delete("sort");
    else params.set("sort", e.target.value);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm font-semibold text-ink-muted">Sort by</label>
      <select id="sort" defaultValue={defaultValue} onChange={onChange} className="field h-11 w-auto min-w-[10rem] py-0 text-sm font-semibold md:h-10">
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
