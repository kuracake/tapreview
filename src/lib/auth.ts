import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, isAdmin: !!adminRow };
}

export async function requireAdmin() {
  const ctx = await getAdmin();

  if (!ctx) redirect("/login");
  if (!ctx.isAdmin) redirect("/login?error=forbidden");

  return { supabase: ctx.supabase, user: ctx.user };
}