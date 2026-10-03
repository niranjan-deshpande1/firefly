import NextLink from "next/link";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { getCurrentUser, signOut } from "@/lib/auth";
import { Icon } from "@/components/ui";
import { NAV } from "./nav";
import { NavLinks } from "./nav-links";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-control px-3 type-label text-secondary transition-state hover:bg-raised hover:text-primary">
        <Icon icon={LogOut} size={24} />
        sign out
      </button>
    </form>
  );
}

function Wordmark() {
  // OPEN-LOGO-1: interim lowercase Satoshi wordmark.
  return (
    <NextLink href="/" className="inline-flex min-h-11 items-center type-display-3">
      firefly
    </NextLink>
  );
}

/** Desktop rail and mobile five-item bottom bar (manual 9.1, 9.2). */
export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const items = NAV[user?.role ?? "VISITOR"];
  const destinations = user ? items.slice(0, -1) : items;
  const you = user ? items.at(-1) : undefined;

  return (
    <div className="min-h-dvh">
      <nav aria-label="primary" className="z-chrome fixed inset-y-0 start-0 hidden w-rail flex-col gap-8 border-e border-line bg-ground p-6 desktop:flex">
        <Wordmark />
        <NavLinks items={destinations} layout="rail" />
        {user && you ? (
          <div className="mt-auto flex flex-col gap-2">
            <NavLinks items={[you]} layout="rail" />
            <SignOutButton />
          </div>
        ) : null}
      </nav>

      <div className="desktop:ps-rail">
        <div className="flex items-center justify-between px-4 pt-4 tablet:px-8 desktop:hidden">
          <Wordmark />
        </div>
        <main id="main" className="mx-auto flex w-full max-w-content flex-col gap-16 px-4 pt-8 pb-16 tablet:px-8 desktop:gap-24 desktop:px-6 desktop:pb-24">
          {children}
        </main>
        <footer className="mx-auto flex w-full max-w-content flex-wrap gap-x-6 gap-y-2 border-t border-line px-4 py-8 pb-32 type-body-s text-secondary tablet:px-8 desktop:px-6 desktop:pb-8">
          <span>firefly</span>
          <NextLink className="link" href="/hackathons">hackathons</NextLink>
          <NextLink className="link" href="/for-companies">hiring with firefly</NextLink>
        </footer>
      </div>

      <nav aria-label="primary" className="z-chrome fixed inset-x-0 bottom-0 border-t border-line bg-ground pb-[env(safe-area-inset-bottom)] desktop:hidden">
        <NavLinks items={items} layout="bar" />
      </nav>
    </div>
  );
}
