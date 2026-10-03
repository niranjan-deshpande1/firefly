import NextLink from "next/link";
import { X } from "lucide-react";
import { Button, Field, Icon, Input, Select, TextLink } from "@/components/ui";
import { FORMAT_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS, filterChips, type ListingFilters } from "@/lib/discovery/filters";

type Options = Record<string, string>;

function SelectField({ name, label, value, options, anyLabel }: { name: string; label: string; value?: string; options: Options; anyLabel?: string }) {
  return (
    <Field label={label}>
      {({ id }) => (
        <Select id={id} name={name} defaultValue={value ?? ""}>
          {anyLabel ? <option value="">{anyLabel}</option> : null}
          {Object.entries(options).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}

/**
 * Plain GET form: the URL holds every filter, so results are shareable and work without JS.
 * Removable chips sit under the form, one per active filter.
 */
export function FilterBar({ filters, themes }: { filters: ListingFilters; themes: string[] }) {
  const chips = filterChips(filters);
  const themeOptions = Object.fromEntries((filters.theme && !themes.includes(filters.theme) ? [...themes, filters.theme] : themes).map((t) => [t, t]));

  return (
    <div className="flex flex-col gap-4">
      <form role="search" aria-label="filter hackathons" action="/hackathons" method="get" className="flex flex-col gap-4">
        <Field label="search">
          {({ id }) => <Input id={id} type="search" name="q" defaultValue={filters.q ?? ""} placeholder="title or tagline" />}
        </Field>
        <fieldset className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
          <legend className="sr-only">filters and sort</legend>
          <SelectField name="type" label="type" value={filters.type} options={TYPE_OPTIONS} anyLabel="any type" />
          <SelectField name="status" label="status" value={filters.status} options={STATUS_OPTIONS} anyLabel="any status" />
          <SelectField name="theme" label="theme" value={filters.theme} options={themeOptions} anyLabel="any theme" />
          <SelectField name="format" label="where" value={filters.format} options={FORMAT_OPTIONS} anyLabel="anywhere" />
          <Field label="from">{({ id }) => <Input id={id} type="date" name="from" defaultValue={filters.from ?? ""} />}</Field>
          <Field label="to">{({ id }) => <Input id={id} type="date" name="to" defaultValue={filters.to ?? ""} />}</Field>
          <SelectField name="sort" label="sort by" value={filters.sort} options={SORT_OPTIONS} />
          <div className="flex items-end">
            <Button type="submit" variant="secondary" className="w-full">
              apply filters
            </Button>
          </div>
        </fieldset>
      </form>

      {chips.length > 0 ? (
        <div role="group" aria-label="active filters" className="flex flex-wrap items-center gap-3">
          {chips.map((c) => (
            <NextLink key={c.key} href={c.href} className="chip" aria-label={`remove filter ${c.label}`}>
              {c.label}
              <Icon icon={X} />
            </NextLink>
          ))}
          {chips.length > 1 ? (
            <TextLink href={filters.sort === "start" ? "/hackathons" : `/hackathons?sort=${filters.sort}`} className="type-body-s">
              clear all filters
            </TextLink>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
