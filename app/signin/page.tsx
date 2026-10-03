import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser, isDemoMode, isGitHubAuthEnabled, signIn } from "@/lib/auth";
import { prisma, USER_ROLES, type UserRole } from "@/lib/db";
import { Button, PageHeader } from "@/components/ui";
import { NAV } from "@/components/shell/nav";

export const metadata = { title: "sign in" };

// Archetype: passage.
const ROLE_LABEL: Record<UserRole, string> = {
  CANDIDATE: "builders",
  COMPANY: "company members",
  ORGANIZER: "organizers",
  REVIEWER: "reviewers and interviewers",
  ADMIN: "operators",
};

const homeFor = (role: UserRole) => NAV[role][0].href;

async function demoSignIn(formData: FormData) {
  "use server";
  if (!isDemoMode()) return;
  const userId = z.string().min(1).max(64).parse(formData.get("userId"));
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return;
  await signIn("demo", { userId, redirectTo: homeFor(user.role as UserRole) });
}

async function githubSignIn() {
  "use server";
  await signIn("github", { redirectTo: "/dashboard" });
}

export default async function SignInPage() {
  const current = await getCurrentUser();
  if (current) redirect(homeFor(current.role));

  const demo = isDemoMode();
  const users = demo
    ? await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }], select: { id: true, name: true, role: true } })
    : [];

  return (
    <div className="measure flex flex-col gap-12">
      <PageHeader
        title="sign in to firefly"
        description={demo ? "this is a demo. choose a seeded person to see firefly from their side." : "sign in with your GitHub account."}
      />

      {isGitHubAuthEnabled() ? (
        <form action={githubSignIn}>
          <Button type="submit" variant="primary">sign in with GitHub</Button>
        </form>
      ) : null}

      {demo
        ? USER_ROLES.map((role) => {
            const group = users.filter((u) => u.role === role);
            if (group.length === 0) return null;
            return (
              <section key={role} aria-labelledby={`role-${role}`} className="flex flex-col gap-3">
                <h2 id={`role-${role}`} className="type-eyebrow text-secondary">{ROLE_LABEL[role]}</h2>
                <ul className="flex flex-col">
                  {group.map((u) => (
                    <li key={u.id} className="row flex items-center">
                      <form action={demoSignIn} className="flex w-full">
                        <input type="hidden" name="userId" value={u.id} />
                        <Button type="submit" variant="ghost" className="w-full justify-start">
                          continue as {u.name}
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        : null}

      {!demo && !isGitHubAuthEnabled() ? (
        <p className="type-body text-secondary">sign-in is not configured. set DEMO_MODE=true or add GITHUB_ID and GITHUB_SECRET, then restart.</p>
      ) : null}
    </div>
  );
}
