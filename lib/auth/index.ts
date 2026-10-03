import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma, type UserRole } from "@/lib/db";
import { auth } from "./config";

export { signIn, signOut, handlers, isDemoMode, isGitHubAuthEnabled } from "./config";

export type CurrentUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  role: UserRole;
};

// The role is read from the database on every request, so a role change applies at once.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, image: true, username: true, role: true },
  });
  return user ? { ...user, role: user.role as UserRole } : null;
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}
