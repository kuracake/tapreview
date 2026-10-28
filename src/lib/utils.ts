// Relasi many-to-one dari Supabase kadang bertipe objek, kadang array.
export function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}