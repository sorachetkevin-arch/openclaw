import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processQueue } from "@/lib/queue";

// Triggered by a cron job or manually
export async function POST(req: Request) {
  // Allow internal cron calls with secret header
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret && cronSecret === process.env.CRON_SECRET) {
    // Process queue for all users (cron mode)
    return NextResponse.json({ message: "Use user-specific endpoint for cron" });
  }

  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results = await processQueue(session.user.id);
  return NextResponse.json({ processed: results.length, results });
}
