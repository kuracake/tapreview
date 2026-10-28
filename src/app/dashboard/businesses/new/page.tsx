import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import BusinessForm from "../business-form";
import { createBusiness } from "../actions";

export const metadata = { title: "Tambah Bisnis | TapReview" };

export default async function NewBusinessPage() {
  await requireAdmin();

  return (
    <div className="max-w-xl space-y-4">
      <Link href="/dashboard/businesses" className="text-sm text-gray-600 underline">
        &larr; Kembali
      </Link>
      <h1 className="text-2xl font-semibold">Tambah bisnis</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <BusinessForm action={createBusiness} submitLabel="Simpan bisnis" />
      </div>
    </div>
  );
}