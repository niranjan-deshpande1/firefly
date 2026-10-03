/**
 * Case-insensitive `contains`. SQLite already matches ASCII case-insensitively and rejects `mode`;
 * Postgres (the hosted deploy) needs `mode: "insensitive"`.
 */
const IS_POSTGRES = /^postgres(ql)?:/.test(process.env.DATABASE_URL ?? "");

export function containsText(value: string): { contains: string } {
  // The SQLite-generated client has no `mode` in its types; the Postgres client accepts it at runtime.
  return (IS_POSTGRES ? { contains: value, mode: "insensitive" } : { contains: value }) as { contains: string };
}
