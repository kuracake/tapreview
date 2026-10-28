"use client";

import { useActionState } from "react";
import type { BusinessFormState } from "./actions";

type BusinessValues = {
  name?: string | null;
  owner_name?: string | null;
  phone?: string | null;
  address?: string | null;
  review_url?: string | null;
  place_id?: string | null;
  notes?: string | null;
};

type Props = {
  action: (
    prev: BusinessFormState,
    formData: FormData
  ) => Promise<BusinessFormState>;
  initial?: BusinessValues;
  submitLabel: string;
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function BusinessForm({ action, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(
    action,
    {} as BusinessFormState
  );

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Nama bisnis" name="name" defaultValue={initial?.name} required />
      <Field label="Nama pemilik / kontak" name="owner_name" defaultValue={initial?.owner_name} />
      <Field label="Nomor WhatsApp" name="phone" defaultValue={initial?.phone} />
      <Field label="Alamat" name="address" defaultValue={initial?.address} />
      <Field
        label="Tautan ulasan Google Maps"
        name="review_url"
        type="url"
        defaultValue={initial?.review_url}
        required
        hint="Harus diawali https:// dan berasal dari Google. Uji tautannya sebelum kartu diaktifkan."
      />
      <Field label="Place ID (opsional)" name="place_id" defaultValue={initial?.place_id} />

      <div className="space-y-1">
        <label htmlFor="notes" className="text-sm font-medium">
          Catatan admin
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ""}
          className={inputClass}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-green-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}