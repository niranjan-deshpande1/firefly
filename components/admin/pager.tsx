import { TextLink } from "@/components/ui";
import { PAGE_SIZE, filterHref } from "@/lib/admin/filters";

type Props = { path: string; filters: Record<string, string | number | undefined>; page: number; total: number; noun: string };

/** "newer" and "older" links for a newest-first log. */
export function Pager({ path, filters, page, total, noun }: Props) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(total, page * PAGE_SIZE);
  return (
    <nav aria-label={`${noun} pages`} className="flex flex-wrap items-center gap-6 type-body-s">
      <p className="text-secondary">
        {start} to {end} of {total} {noun}
      </p>
      {page > 1 ? <TextLink href={filterHref(path, { ...filters, page: page - 1 })}>newer {noun}</TextLink> : null}
      {page < pages ? <TextLink href={filterHref(path, { ...filters, page: page + 1 })}>older {noun}</TextLink> : null}
    </nav>
  );
}
