import { getCurrentUser } from "@/lib/auth";
import { NAV } from "@/components/shell/nav";
import { PageHeader, TextLink } from "@/components/ui";

// Also shown when a page exists but this person may not see it: we never confirm what is behind a permission check.
export default async function NotFound() {
  const user = await getCurrentUser();
  const home = NAV[user?.role ?? "VISITOR"][0];
  return (
    <div className="measure flex flex-col gap-8">
      <PageHeader
        title="this page does not exist"
        description="the link may be old, or the page may not be open to your account."
      />
      <TextLink href={home.href} className="type-body self-start">
        back to {home.label}
      </TextLink>
    </div>
  );
}
