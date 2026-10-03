import type { ReactNode } from "react";

type PageHeaderProps = {
  /** One lowercase display line, top-left (manual 8). */
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** 2 for a sub-page under a layout that already owns the page's h1 (one display line per view). */
  level?: 1 | 2;
};

export function PageHeader({ title, eyebrow, description, actions, level = 1 }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between">
      <div className="flex flex-col gap-2">
        {eyebrow ? <p className="type-eyebrow text-secondary">{eyebrow}</p> : null}
        {level === 1 ? (
          <h1 id="page-title" tabIndex={-1} className="type-display-1">
            {title}
          </h1>
        ) : (
          <h2 className="type-display-3">{title}</h2>
        )}
        {description ? <div className="type-body text-secondary measure">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
