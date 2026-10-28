import { z } from "zod";
import { isAllowedReviewUrl } from "@/lib/review-url";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter.`)
    .transform((v) => (v === "" ? null : v));

export const businessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama bisnis minimal 2 karakter.")
    .max(120, "Nama bisnis maksimal 120 karakter."),
  owner_name: optionalText(120),
  phone: optionalText(30),
  address: optionalText(300),
  review_url: z
    .string()
    .trim()
    .refine(
      isAllowedReviewUrl,
      "Tautan ulasan harus HTTPS dan berasal dari domain Google (google.com, g.page, maps.app.goo.gl)."
    ),
  place_id: optionalText(200),
  notes: optionalText(1000),
});

export type BusinessInput = z.infer<typeof businessSchema>;