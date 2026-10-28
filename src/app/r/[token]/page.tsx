import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAllowedReviewUrl } from "@/lib/review-url";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Kartu TapReview",
  robots: { index: false, follow: false },
};

type Resolved =
  | { kind: "not_found" }
  | { kind: "unassigned" }
  | { kind: "disabled" }
  | { kind: "invalid_link" }
  | { kind: "active"; url: string };

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

async function resolveCard(token: string): Promise<Resolved> {
  if (!TOKEN_PATTERN.test(token)) return { kind: "not_found" };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cards")
    .select("status, businesses(review_url, status)")
    .eq("public_token", token)
    .maybeSingle();

  if (error || !data) return { kind: "not_found" };
  if (data.status === "unassigned") return { kind: "unassigned" };
  if (data.status !== "active") return { kind: "disabled" };

  const business = Array.isArray(data.businesses)
    ? data.businesses[0]
    : data.businesses;

  if (!business || business.status !== "active") return { kind: "disabled" };
  if (!isAllowedReviewUrl(business.review_url)) return { kind: "invalid_link" };

  return { kind: "active", url: business.review_url };
}

function InfoCard({ title, message }: { title: string; message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <p className="mt-6 text-xs text-gray-400">TapReview</p>
      </div>
    </main>
  );
}

export default async function CardRedirectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await resolveCard(token);

  // redirect() tidak boleh dibungkus try/catch, jadi dipanggil di luar resolveCard
  if (result.kind === "active") {
    redirect(result.url);
  }

  switch (result.kind) {
    case "unassigned":
      return (
        <InfoCard
          title="Kartu belum diaktifkan"
          message="Kartu ini belum dihubungkan ke bisnis mana pun. Silakan hubungi penjual kartu."
        />
      );
    case "disabled":
      return (
        <InfoCard
          title="Kartu tidak aktif"
          message="Kartu ini sedang dinonaktifkan. Silakan hubungi pemilik bisnis."
        />
      );
    case "invalid_link":
      return (
        <InfoCard
          title="Tautan ulasan bermasalah"
          message="Tujuan ulasan untuk kartu ini belum valid. Silakan hubungi pemilik bisnis."
        />
      );
    default:
      return (
        <InfoCard
          title="Kartu tidak ditemukan"
          message="Kami tidak menemukan kartu dengan kode ini. Periksa kembali kartunya."
        />
      );
  }
}