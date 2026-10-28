import QRCode from "qrcode";
import { getAdmin } from "@/lib/auth";
import { cardUrl } from "@/lib/card-url";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ctx = await getAdmin();
  if (!ctx) return new Response("Unauthorized", { status: 401 });
  if (!ctx.isAdmin) return new Response("Forbidden", { status: 403 });

  const { data: card } = await ctx.supabase
    .from("cards")
    .select("card_code, public_token")
    .eq("id", id)
    .maybeSingle();

  if (!card) return new Response("Kartu tidak ditemukan", { status: 404 });

  const png = await QRCode.toBuffer(cardUrl(card.public_token), {
    type: "png",
    width: 1024,
    margin: 4,
    errorCorrectionLevel: "M",
  });

  const download = new URL(request.url).searchParams.get("download") === "1";

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${card.card_code}.png"`,
      "Cache-Control": "no-store",
    },
  });
}