import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import BusinessForm from "../business-form";
import { updateBusiness, setBusinessStatus } from "../actions";

export const metadata = { title: "Detail Bisnis | TapReview" };

const formatDate = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  });

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!business) notFound();

  const [{ data: history }, { count: cardCount }] = await Promise.all([
    supabase
      .from("review_url_history")
      .select("id, old_url, new_url, created_at")
      .eq("business_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .eq("business_id", id),
  ]);

  const isActive = business.status === "active";

  return (
    <div className="max-w-xl space-y-6">
      <Link href="/dashboard/businesses" className="text-sm text-gray-600 underline">
        &larr; Kembali
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{business.name}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {cardCount ?? 0} kartu terhubung &middot;{" "}
            {isActive ? "Aktif" : "Nonaktif"}
          </p>
        </div>
        <form action={setBusinessStatus.bind(null, id, isActive ? "inactive" : "active")}>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </form>
      </div>

      {!isActive && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Bisnis nonaktif: semua kartu yang terhubung menampilkan halaman
          &quot;Kartu tidak aktif&quot; dan tidak mengarahkan pelanggan.
        </p>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <BusinessForm
          action={updateBusiness.bind(null, id)}
          initial={business}
          submitLabel="Simpan perubahan"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Riwayat tautan ulasan</h2>
        <ul className="space-y-3 text-sm">
          {(history ?? []).map((h) => (
            <li key={h.id} className="border-b border-gray-100 pb-3 last:border-0">
              <p className="text-xs text-gray-500">{formatDate(h.created_at)}</p>
              {h.old_url && (
                <p className="break-all text-gray-500 line-through">{h.old_url}</p>
              )}
              <p className="break-all">{h.new_url}</p>
            </li>
          ))}
          {(history ?? []).length === 0 && (
            <li className="text-gray-500">Belum ada riwayat.</li>
          )}
        </ul>
      </div>
    </div>
  );
}