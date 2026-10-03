import { NextResponse } from "next/server";
import { runJobs } from "@/lib/jobs";

// Vercel Cron calls this daily (vercel.json) with "Authorization: Bearer $CRON_SECRET".
// Without CRON_SECRET set, the route refuses every call, so the jobs can't be triggered by strangers.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Not found", { status: 404 });
  }
  const counts = await runJobs(new Date());
  return NextResponse.json({ ranAt: new Date().toISOString(), ...counts });
}
