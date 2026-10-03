import { Skeleton } from "@/components/ui";

// Final-geometry skeleton for the record layout: header, timeline beside its aside, then summary.
export default function Loading() {
  return (
    <div className="flex flex-col gap-12 desktop:gap-24" aria-busy="true" aria-label="loading the evidence locker">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 w-2/3 desktop:w-1/3" />
        <Skeleton className="h-6 w-full desktop:w-1/2" />
      </div>
      <div className="grid grid-cols-1 gap-8 desktop:grid-cols-12 desktop:gap-6">
        <div className="flex flex-col gap-4 desktop:col-span-8">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-48 w-full tablet:h-64" />
        </div>
        <div className="flex flex-col gap-3 desktop:col-span-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-64 w-full desktop:w-2/3" />
    </div>
  );
}
