import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { check } from "@/lib/permissions";
import { buildExport } from "@/lib/profiles/queries";

// Data export: the signed-in person's own rows as a JSON download. It takes no input, so there is nothing to parse.
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !(await check(user, "privacy.manage", { subjectUserId: user.id }))) {
    return new Response("not found", { status: 404 });
  }
  const data = await buildExport(user.id);
  await audit({ actorId: user.id, action: "DATA_EXPORT", resourceType: "User", resourceId: user.id, subjectUserId: user.id });
  const day = data.exportedAt.slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="firefly-export-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
