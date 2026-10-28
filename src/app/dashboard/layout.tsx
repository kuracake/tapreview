import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/login/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="font-semibold">
            TapReview
          </Link>
          <Link href="/dashboard/businesses" className="text-gray-600 hover:text-gray-900">
            Bisnis
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{user.email}</span>
          <form action={logout}>
            <button type="submit" className="underline">
              Keluar
            </button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}