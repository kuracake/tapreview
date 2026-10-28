import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { cardUrl } from "@/lib/card-url";
import { one } from "@/lib/utils";

export const metadata = { title: "Kartu | TapReview" };

const STATUSES = ["unassigned", "active", "disabled"] as const;
type Status = (typeof STATUSES)[number];

const LABEL: Record<Status, string> = {
  unassigned: "Belum ditetapkan",
  active: "Aktif",
  disabled: "Nonaktif",
};

const BADGE: Record<Status, string> = {
  unassigned: "bg-gray-200 text-gray-700",
  active: "bg-green-100 text-green-800",
  disabled: "bg-red-100 text-red-800",
};

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { supabase } = await requireAdmin();
  const filter = STATUSES.find((s) => s === status);

  const countOf = (s: Status) =>
    supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .eq("status", s);

  let listQuery = supabase
    .from("cards")
    .select(
      "id, card_code, public_token, status, businesses(name), card_batches(batch_name)"
    )
    .order("created_at", { ascending: false })
    .order("card_code", { ascending: true })
    .limit(200);

  if (filter) listQuery = listQuery.eq("status", filter);

  const [unassigned, active, disabled, list] = await Promise.all([
    countOf("unassigned"),
    countOf("active"),
    countOf("disabled"),
    listQuery,
  ]);

  const counts: Record<Status, number> = {
    unassigned: unassigned.count ?? 0,
    active: active.count ?? 0,
    disabled: disabled.count ?? 0,
  };
  const total = counts.unassigned + counts.active + counts.disabled;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inventaris kartu</h1>
        <Link
          href="/dashboard/cards/batches"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Kelola batch
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/dashboard/cards" className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-semibold">{total}</p>
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/dashboard/cards?status=${s}`}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p className="text-xs text-gray-500">{LABEL[s]}</p>
            <p className="text-2xl font-semibold">{counts[s]}</p>
          </Link>
        ))}
      </div>

      {list.error && <p className="text-sm text-red-600">Gagal memuat kartu.</p>}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Bisnis</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">URL permanen</th>
              <th className="px-4 py-3 font-medium">QR</th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((c) => {
              const business = one<{ name: string }>(c.businesses);
              const batch = one<{ batch_name: string }>(c.card_batches);
              const st = c.status as Status;
              return (
                <tr key={c.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-mono">{c.card_code}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${BADGE[st]}`}>
                      {LABEL[st]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{business?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{batch?.batch_name ?? "-"}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`/r/${c.public_token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-xs underline"
                    >
                      {cardUrl(c.public_token)}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/dashboard/cards/${c.id}/qr?download=1`}
                      className="underline"
                    >
                      PNG
                    </a>
                  </td>
                </tr>
              );
            })}
            {(list.data ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Belum ada kartu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Menampilkan maksimal 200 kartu terbaru.</p>
    </div>
  );
}