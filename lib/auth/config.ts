import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import { prisma } from "@/lib/db";
import type { Provider } from "next-auth/providers";

export const isDemoMode = () => process.env.DEMO_MODE === "true";
export const isGitHubAuthEnabled = () => Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);

// ponytail: fixed secret only in demo mode so `npm run dev` works with no setup; production must set AUTH_SECRET.
const DEMO_SECRET = "firefly-demo-mode-secret-do-not-use-in-production";

function providers(): Provider[] {
  const list: Provider[] = [];
  if (isGitHubAuthEnabled()) {
    list.push(GitHub({ clientId: process.env.GITHUB_ID, clientSecret: process.env.GITHUB_SECRET }));
  }
  if (isDemoMode()) {
    list.push(
      Credentials({
        id: "demo",
        name: "Demo sign-in",
        credentials: { userId: { label: "User", type: "text" } },
        async authorize(raw) {
          const parsed = z.object({ userId: z.string().min(1).max(64) }).safeParse(raw);
          if (!parsed.success) return null;
          const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
          return user ? { id: user.id, name: user.name, email: user.email, image: user.image } : null;
        },
      }),
    );
  }
  return list;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET ?? (isDemoMode() ? DEMO_SECRET : undefined),
  trustHost: true,
  providers: providers(),
  pages: { signIn: "/signin" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid && session.user) session.user.id = token.uid as string;
      return session;
    },
  },
});
