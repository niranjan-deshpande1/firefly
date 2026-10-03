import { Skeleton } from "@/components/ui";

// Record skeleton: header, focal media and the metadata column at final geometry.
export default function Loading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="loading project">
      <Skeleton className="h-12 w-3/4" />
      <div className="grid grid-cols-1 gap-12 desktop:grid-cols-12 desktop:gap-6">
        <Skeleton className="aspect-[4/3] w-full rounded-none desktop:col-span-8" />
        <div className="flex flex-col gap-4 desktop:col-span-4">
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
