import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata = { title: "Login Admin | TapReview" };

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const notice =
    error === "forbidden"
      ? "Akun ini tidak memiliki akses admin."
      : undefined;

  return <LoginForm notice={notice} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">TapReview Admin</h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">
          Masuk untuk mengelola kartu dan bisnis.
        </p>
        <Suspense fallback={null}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}