import { createClient } from "@/lib/supabase/server";

/**
 * Maps every category id (root or sub-category) to the slug of its root category,
 * which decides the gig cover style. Returns an empty map if the lookup fails,
 * and covers then fall back to a style chosen from the gig id.
 */
export async function getCategoryRootSlugs(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const sb = createClient();
    const { data } = await sb.from("categories").select("id, slug, parent_id");
    const rows = (data ?? []) as Array<{ id: string; slug: string; parent_id: string | null }>;
    const byId = new Map(rows.map((r) => [r.id, r]));
    for (const r of rows) {
      let cur = r;
      let guard = 0;
      while (cur.parent_id && byId.has(cur.parent_id) && guard++ < 5) cur = byId.get(cur.parent_id)!;
      map.set(r.id, cur.slug);
    }
  } catch {
    /* fall back to id-based covers */
  }
  return map;
}
