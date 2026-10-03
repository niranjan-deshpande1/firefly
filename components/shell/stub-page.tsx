import { PageHeader } from "@/components/ui";

/** Placeholder a builder replaces. Lists owner and archetype so the route is easy to find. */
export function StubPage({ title, owner, archetype }: { title: string; owner: string; archetype: string }) {
  return (
    <PageHeader
      title={title}
      eyebrow={archetype}
      description={<p>this page is being built by the {owner} builder.</p>}
    />
  );
}
