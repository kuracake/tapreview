import { getAdmin } from "@/lib/auth";
import { cardUrl } from "@/lib/card-url";

export const dynamic = "force-dynamic";

const esc = (value: string) => `"${value.replaceAll('"', '""')}"`;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ctx = await getAdmin();
  if (!ctx) return new Response("Unauthorized", { status: 401 });
  if (!ctx.isAdmin) return new Response("Forbidden", { status: 403 });

  const { data: batch } = await ctx.supabase
    .from("card_batches")
    .select("batch_name")
    .eq("id", id)
    .maybeSingle();

  if (!batch) return new Response("Batch tidak ditemukan", { status: 404 });

  const { data: cards } = await ctx.supabase
    .from("cards")
    .select("card_code, public_token, status")
    .eq("batch_id", id)
    .order("card_code", { ascending: true });

  const rows: string[][] = [
    ["card_code", "public_token", "url", "status"],
    ...(cards ?? []).map((c) => [
      c.card_code,
      c.public_token,
      cardUrl(c.public_token),
      c.status,
    ]),
  ];

  const csv = rows.map((r) => r.map(esc).join(",")).join("\r\n");
  const slug = batch.batch_name.replace(/[^a-zA-Z0-9_-]+/g, "-");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kartu-${slug}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}