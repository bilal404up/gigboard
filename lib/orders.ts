import type { createClient } from "@/lib/supabase/server";
import { gigTitle } from "@/lib/order-status";

type Client = ReturnType<typeof createClient>;

export type OrderLike = {
  id: string;
  gig_id: string | null;
  buyer_id: string;
  seller_id: string;
  package_snapshot?: unknown;
  [key: string]: any;
};

export type EnrichedOrder<T extends OrderLike> = T & {
  gigTitle: string;
  gigSlug: string | null;
  packageName: string | null;
  buyerName: string | null;
  sellerName: string | null;
};

/**
 * Orders store the package, not the gig, so lists used to be titled "Starter".
 * This reads the gig titles and the names of both sides in two small queries.
 * Read-only.
 */
export async function enrichOrders<T extends OrderLike>(sb: Client, orders: T[] | null | undefined): Promise<EnrichedOrder<T>[]> {
  const list = orders ?? [];
  if (list.length === 0) return [];
  const gigIds = Array.from(new Set(list.map((o) => o.gig_id).filter(Boolean))) as string[];
  const userIds = Array.from(new Set(list.flatMap((o) => [o.buyer_id, o.seller_id]).filter(Boolean)));

  const [{ data: gigs }, { data: people }] = await Promise.all([
    gigIds.length ? sb.from("gigs").select("id, title, slug").in("id", gigIds) : Promise.resolve({ data: [] as any[] }),
    userIds.length ? sb.from("public_profiles").select("id, full_name").in("id", userIds) : Promise.resolve({ data: [] as any[] }),
  ]);
  const gigById = new Map((gigs ?? []).map((g: any) => [g.id, g]));
  const nameById = new Map((people ?? []).map((p: any) => [p.id, p.full_name as string]));

  return list.map((o) => {
    const g = o.gig_id ? (gigById.get(o.gig_id) as any) : null;
    const pkg = (o.package_snapshot as { name?: string } | null)?.name ?? null;
    return {
      ...o,
      gigTitle: g?.title ? gigTitle(g.title) : pkg ?? "Order",
      gigSlug: g?.slug ?? null,
      packageName: pkg,
      buyerName: nameById.get(o.buyer_id) ?? null,
      sellerName: nameById.get(o.seller_id) ?? null,
    };
  });
}
