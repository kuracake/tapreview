import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Bisnis | TapReview" };

export default async function BusinessesPage() {
  const { supabase } = await requireAdmin();

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, name, owner_name, status, created_at, cards(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bisnis</h1>
        <Link
          href="/dashboard/businesses/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          Tambah bisnis
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">Gagal memuat data bisnis.</p>}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Pemilik</th>
              <th className="px-4 py-3 font-medium">Kartu</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(businesses ?? []).map((b) => (
              <tr key={b.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/businesses/${b.id}`}
                    className="font-medium underline"
                  >
                    {b.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{b.owner_name ?? "-"}</td>
                <td className="px-4 py-3">{b.cards?.[0]?.count ?? 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      b.status === "active"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                        : "rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700"
                    }
                  >
                    {b.status === "active" ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
              </tr>
            ))}
            {(businesses ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Belum ada bisnis.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}