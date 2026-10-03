// JSON columns are stored as strings (SQLite and Postgres both accept this).
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function toJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export type LinkItem = { label: string; url: string };

export type EvidenceRefKind = "COMMIT" | "TRANSCRIPT" | "DECISION" | "CHECKIN" | "INTERVIEW_NOTE";
export type EvidenceRef = { kind: EvidenceRefKind; id: string; label: string; excerpt?: string };
