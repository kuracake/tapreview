import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import BatchForm from "./batch-form";

export const metadata = { title: "Batch Kartu | TapReview" };

const formatDate = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  });

export default async function BatchesPage() {
  const { supabase } = await requireAdmin();

  const { data: batches, error } = await supabase
    .from("card_batches")
    .select("id, batch_name, quantity, notes, created_at, cards(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Batch kartu</h1>
        <Link href="/dashboard/cards" className="text-sm underline">
          &larr; Inventaris kartu
        </Link>
      </div>

      <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Buat batch baru</h2>
        <BatchForm />
      </div>

      {error && <p className="text-sm text-red-600">Gagal memuat batch.</p>}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Kartu</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
              <th className="px-4 py-3 font-medium">Unduh untuk produksi</th>
            </tr>
          </thead>
          <tbody>
            {(batches ?? []).map((b) => (
              <tr key={b.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{b.batch_name}</p>
                  {b.notes && <p className="text-xs text-gray-500">{b.notes}</p>}
                </td>
                <td className="px-4 py-3">{b.cards?.[0]?.count ?? 0}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(b.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <a
                      href={`/dashboard/cards/batches/${b.id}/qr-zip`}
                      className="underline"
                    >
                      ZIP QR (PNG)
                    </a>
                    <a
                      href={`/dashboard/cards/batches/${b.id}/csv`}
                      className="underline"
                    >
                      CSV URL
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {(batches ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Belum ada batch.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}