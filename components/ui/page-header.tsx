import type { ReactNode } from "react";

type PageHeaderProps = {
  /** One lowercase display line, top-left (manual 8). */
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between">
      <div className="flex flex-col gap-2">
        {eyebrow ? <p className="type-eyebrow text-secondary">{eyebrow}</p> : null}
        <h1 id="page-title" tabIndex={-1} className="type-display-2 outline-none">
          {title}
        </h1>
        {description ? <div className="type-body text-secondary measure">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
