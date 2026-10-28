import JSZip from "jszip";
import QRCode from "qrcode";
import { getAdmin } from "@/lib/auth";
import { cardUrl } from "@/lib/card-url";

export const dynamic = "force-dynamic";

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
    .select("card_code, public_token")
    .eq("batch_id", id)
    .order("card_code", { ascending: true });

  if (!cards || cards.length === 0) {
    return new Response("Batch tidak memiliki kartu", { status: 404 });
  }

  const zip = new JSZip();
  for (const card of cards) {
    const png = await QRCode.toBuffer(cardUrl(card.public_token), {
      type: "png",
      width: 800,
      margin: 4,
      errorCorrectionLevel: "M",
    });
    zip.file(`${card.card_code}.png`, png);
  }

  const content = await zip.generateAsync({ type: "uint8array" });
  const slug = batch.batch_name.replace(/[^a-zA-Z0-9_-]+/g, "-");

  return new Response(new Uint8Array(content), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="qr-${slug}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}