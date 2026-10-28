"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export type BatchFormState = { error?: string; success?: string };

const batchSchema = z.object({
  batch_name: z
    .string()
    .trim()
    .min(2, "Nama batch minimal 2 karakter.")
    .max(100, "Nama batch maksimal 100 karakter."),
  quantity: z.coerce
    .number()
    .int("Jumlah harus bilangan bulat.")
    .min(1, "Jumlah minimal 1.")
    .max(500, "Jumlah maksimal 500 per batch."),
  notes: z
    .string()
    .trim()
    .max(500, "Catatan maksimal 500 karakter.")
    .transform((v) => (v === "" ? null : v)),
});

// 8 byte acak -> 11 karakter base64url (A-Z a-z 0-9 - _)
function generateTokens(count: number): string[] {
  const tokens = new Set<string>();
  while (tokens.size < count) {
    tokens.add(randomBytes(8).toString("base64url"));
  }
  return [...tokens];
}

export async function createBatch(
  _prev: BatchFormState,
  formData: FormData
): Promise<BatchFormState> {
  const { supabase, user } = await requireAdmin();

  const parsed = batchSchema.safeParse({
    batch_name: String(formData.get("batch_name") ?? ""),
    quantity: formData.get("quantity"),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { batch_name, quantity, notes } = parsed.data;

  const { data: batch, error: batchError } = await supabase
    .from("card_batches")
    .insert({ batch_name, quantity, notes })
    .select("id")
    .single();

  if (batchError || !batch) {
    return { error: "Gagal membuat batch. Coba lagi." };
  }

  const rows = generateTokens(quantity).map((token) => ({
    public_token: token,
    batch_id: batch.id,
  }));

  // Satu perintah insert bersifat atomik: semua kartu masuk, atau tidak sama sekali.
  const { error: cardsError } = await supabase.from("cards").insert(rows);

  if (cardsError) {
    await supabase.from("card_batches").delete().eq("id", batch.id);
    return { error: "Gagal membuat kartu. Batch dibatalkan, coba lagi." };
  }

  await logActivity(supabase, {
    actorId: user.id,
    action: "batch.created",
    entityType: "card_batch",
    entityId: batch.id,
    metadata: { batch_name, quantity },
  });

  revalidatePath("/dashboard/cards");
  revalidatePath("/dashboard/cards/batches");
  return { success: `Batch "${batch_name}" berhasil dibuat dengan ${quantity} kartu.` };
}