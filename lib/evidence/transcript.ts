// Transcript text is untrusted. These helpers only split and search plain text; nothing here renders HTML.

/** Splits a transcript into excerpts at blank lines. Each excerpt gets a stable index for deep links. */
export function splitExcerpts(content: string): string[] {
  return content
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

/** Id used in EvidenceRef { kind: "TRANSCRIPT", id } for one excerpt. Ids are cuids, so "-" never collides. */
export function excerptId(transcriptId: string, index: number): string {
  return `${transcriptId}-${index + 1}`;
}

/** Case-insensitive match used by the in-page search. Empty query matches everything. */
export function matchesQuery(text: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q === "" || text.toLowerCase().includes(q);
}

/** Splits text into plain and matched segments so the viewer can mark matches without HTML injection. */
export function highlightSegments(text: string, query: string): { text: string; match: boolean }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [{ text, match: false }];
  const lower = text.toLowerCase();
  const out: { text: string; match: boolean }[] = [];
  let at = 0;
  for (let hit = lower.indexOf(q); hit !== -1; hit = lower.indexOf(q, at)) {
    if (hit > at) out.push({ text: text.slice(at, hit), match: false });
    out.push({ text: text.slice(hit, hit + q.length), match: true });
    at = hit + q.length;
  }
  if (at < text.length) out.push({ text: text.slice(at), match: false });
  return out;
}
