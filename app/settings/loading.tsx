import { Skeleton } from "@/components/ui";

// Passage skeleton: page line, then the profile form controls (manual 12.1).
export default function Loading() {
  return (
    <div className="flex flex-col gap-16 desktop:ms-[8.333%] desktop:w-7/12" aria-busy="true" aria-label="loading settings">
      <Skeleton className="h-12 w-32" />
      <div className="flex flex-col gap-6 measure">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
