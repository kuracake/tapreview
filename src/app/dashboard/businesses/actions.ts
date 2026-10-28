"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { businessSchema } from "@/lib/validation/business";

export type BusinessFormState = { error?: string; success?: string };

function readForm(formData: FormData) {
  const get = (key: string) => String(formData.get(key) ?? "");
  return {
    name: get("name"),
    owner_name: get("owner_name"),
    phone: get("phone"),
    address: get("address"),
    review_url: get("review_url"),
    place_id: get("place_id"),
    notes: get("notes"),
  };
}

export async function createBusiness(
  _prev: BusinessFormState,
  formData: FormData
): Promise<BusinessFormState> {
  const { supabase, user } = await requireAdmin();

  const parsed = businessSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from("businesses")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Gagal menyimpan bisnis. Coba lagi." };
  }

  await supabase.from("review_url_history").insert({
    business_id: data.id,
    old_url: null,
    new_url: parsed.data.review_url,
    changed_by: user.id,
  });

  await logActivity(supabase, {
    actorId: user.id,
    action: "business.created",
    entityType: "business",
    entityId: data.id,
    metadata: { name: parsed.data.name },
  });

  revalidatePath("/dashboard/businesses");
  redirect(`/dashboard/businesses/${data.id}`);
}

export async function updateBusiness(
  id: string,
  _prev: BusinessFormState,
  formData: FormData
): Promise<BusinessFormState> {
  const { supabase, user } = await requireAdmin();

  const parsed = businessSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data: current } = await supabase
    .from("businesses")
    .select("review_url")
    .eq("id", id)
    .maybeSingle();

  if (!current) return { error: "Bisnis tidak ditemukan." };

  const { error } = await supabase
    .from("businesses")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: "Gagal memperbarui bisnis. Coba lagi." };

  const urlChanged = current.review_url !== parsed.data.review_url;

  if (urlChanged) {
    await supabase.from("review_url_history").insert({
      business_id: id,
      old_url: current.review_url,
      new_url: parsed.data.review_url,
      changed_by: user.id,
    });
    await logActivity(supabase, {
      actorId: user.id,
      action: "business.review_url_changed",
      entityType: "business",
      entityId: id,
      metadata: { old_url: current.review_url, new_url: parsed.data.review_url },
    });
  }

  await logActivity(supabase, {
    actorId: user.id,
    action: "business.updated",
    entityType: "business",
    entityId: id,
    metadata: { name: parsed.data.name },
  });

  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${id}`);
  return { success: "Perubahan tersimpan." };
}

export async function setBusinessStatus(
  id: string,
  status: "active" | "inactive"
): Promise<void> {
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("businesses")
    .update({ status })
    .eq("id", id);

  if (error) return;

  await logActivity(supabase, {
    actorId: user.id,
    action: status === "active" ? "business.activated" : "business.deactivated",
    entityType: "business",
    entityId: id,
  });

  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${id}`);
}