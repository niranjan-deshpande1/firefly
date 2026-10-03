/** Operator-only figure (admin funnel, billing). Never on builder-facing surfaces; never animates. */
export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 border-s border-line ps-4">
      <dt className="type-label text-secondary">{label}</dt>
      <dd className="type-body-l font-bold tabular-nums">{value}</dd>
    </div>
  );
}
