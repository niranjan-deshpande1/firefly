import { Skeleton } from "@/components/ui";

// Final-geometry skeleton for the hackathon listing (manual 7.10, 12.1 collection).
export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="loading hackathons">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-11 w-full" />
      <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-48 rounded-card" />
        ))}
      </div>
    </div>
  );
}
