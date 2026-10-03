import { BookUser, Building2, ClipboardCheck, FolderKanban, Gavel, Home, LogIn, Mic, Receipt, Shield, UserRound, UsersRound } from "lucide-react";
import type { UserRole } from "@/lib/db/enums";

// Icons are referenced by name so nav items can cross the server/client boundary.
export const NAV_ICONS = { BookUser, Building2, ClipboardCheck, FolderKanban, Gavel, Home, LogIn, Mic, Receipt, Shield, UserRound, UsersRound };
export type NavItem = { href: string; label: string; icon: keyof typeof NAV_ICONS };

const HACKATHONS: NavItem = { href: "/hackathons", label: "hackathons", icon: "FolderKanban" };
const YOU: NavItem = { href: "/settings", label: "you", icon: "UserRound" };

/**
 * Five destinations at most, home first and "you" last (manual 9.1, DESIGN.md D7).
 * Four when a label would not fit a fifth of the narrowest bar; the rest are linked from home.
 * Pages still check permissions on the server; this list only decides what is shown.
 */
export const NAV: Record<UserRole | "VISITOR", NavItem[]> = {
  VISITOR: [
    { href: "/", label: "home", icon: "Home" },
    HACKATHONS,
    { href: "/for-companies", label: "companies", icon: "Building2" },
    { href: "/signin", label: "sign in", icon: "LogIn" },
  ],
  CANDIDATE: [{ href: "/dashboard", label: "home", icon: "Home" }, HACKATHONS, YOU],
  COMPANY: [
    { href: "/company", label: "home", icon: "Home" },
    { href: "/company/talent", label: "talent", icon: "UsersRound" },
    { href: "/company/billing", label: "billing", icon: "Receipt" },
    YOU,
  ],
  ORGANIZER: [{ href: "/organize", label: "home", icon: "Home" }, HACKATHONS, YOU],
  REVIEWER: [
    { href: "/review", label: "home", icon: "Home" },
    { href: "/judge", label: "judging", icon: "Gavel" },
    { href: "/interviews", label: "interviews", icon: "Mic" },
    YOU,
  ],
  ADMIN: [
    { href: "/admin", label: "home", icon: "Shield" },
    { href: "/organize", label: "organize", icon: "BookUser" },
    { href: "/review", label: "review", icon: "ClipboardCheck" },
    YOU,
  ],
};

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
