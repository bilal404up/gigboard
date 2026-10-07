import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { transitionOrder } from "@/lib/utils/order-workflow";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("buyer_id").eq("id", params.id).single();
  if (!order || order.buyer_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await transitionOrder(params.id, "completed");
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ success: true });
}
