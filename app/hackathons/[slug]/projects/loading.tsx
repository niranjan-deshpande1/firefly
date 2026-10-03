import { Skeleton } from "@/components/ui";

// Collection skeleton: tile-shaped blocks in the final grid.
export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="loading projects">
      <Skeleton className="h-12 w-1/2" />
      <ul className="grid grid-cols-1 gap-x-4 gap-y-16 tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-x-6">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <Skeleton className="h-6 w-2/3" />
          </li>
        ))}
      </ul>
    </div>
  );
}
