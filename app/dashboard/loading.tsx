import { Skeleton } from "@/components/ui";

// Workspace-shaped skeleton in the dashboard's final geometry (manual 12.1). Never a spinner.
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-16 desktop:gap-24" aria-busy="true" aria-label="loading your dashboard">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-full max-w-md" />
      </div>
      <div className="grid gap-12 desktop:grid-cols-12 desktop:gap-6">
        <div className="flex flex-col gap-3 desktop:col-span-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="flex flex-col gap-3 desktop:col-span-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
