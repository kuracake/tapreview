"use client";

import { useActionState } from "react";
import { createBatch, type BatchFormState } from "./actions";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

export default function BatchForm() {
  const [state, formAction, pending] = useActionState(
    createBatch,
    {} as BatchFormState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="batch_name" className="text-sm font-medium">
          Nama batch <span className="text-red-600">*</span>
        </label>
        <input id="batch_name" name="batch_name" required className={inputClass} />
      </div>

      <div className="space-y-1">
        <label htmlFor="quantity" className="text-sm font-medium">
          Jumlah kartu <span className="text-red-600">*</span>
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          max={500}
          defaultValue={10}
          required
          className={inputClass}
        />
        <p className="text-xs text-gray-500">Maksimal 500 per batch.</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="notes" className="text-sm font-medium">
          Catatan
        </label>
        <textarea id="notes" name="notes" rows={2} className={inputClass} />
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
        {pending ? "Membuat..." : "Buat batch"}
      </button>
    </form>
  );
}