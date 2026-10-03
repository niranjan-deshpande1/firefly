import { TabLinks } from "@/components/ui";

// Owner: discovery builder. Tabs are route-backed; the builder adds the hackathon header and current-tab state.
const TABS = ["", "rules", "prizes", "schedule", "judging", "resources", "updates", "participants", "projects", "teams"];

export default async function HackathonLayout({ children, params }: LayoutProps<"/hackathons/[slug]">) {
  const { slug } = await params;
  const base = `/hackathons/${slug}`;
  const items = TABS.map((t) => ({ href: t ? `${base}/${t}` : base, label: t || "overview" }));
  return (
    <div className="flex flex-col gap-8">
      <TabLinks label="hackathon sections" items={items} current={base} />
      {children}
    </div>
  );
}
