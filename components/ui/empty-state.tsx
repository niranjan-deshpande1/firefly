import type { ReactNode } from "react";

/** State sentence plus exactly one next route (manual 11.4). Never a bare "nothing here". */
export function EmptyState({ children, action }: { children: ReactNode; action: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 py-8">
      <p className="type-body measure">{children}</p>
      {action}
    </div>
  );
}
