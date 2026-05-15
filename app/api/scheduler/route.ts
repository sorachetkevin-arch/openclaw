import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enqueuePost, processQueue } from "@/lib/queue";
import { z } from "zod";

const settingsSchema = z.object({
  scheduleEnabled: z.boolean().optional(),
  scheduleTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  postsPerDay: z.number().int().min(1).max(20).optional(),
  minDelayMinutes: z.number().int().min(10).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { userId: session.user.id, ...parsed.data },
  });

  return NextResponse.json(settings);
}

// POST /api/scheduler — enqueue a post manually
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { postId, scheduledAt } = z.object({
    postId: z.string(),
    scheduledAt: z.string().datetime().optional(),
  }).parse(body);

  // Verify post ownership
  const post = await prisma.post.findFirst({
    where: { id: postId, userId: session.user.id },
  });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const date = scheduledAt ? new Date(scheduledAt) : new Date();
  await enqueuePost(postId, session.user.id, date);

  return NextResponse.json({ ok: true });
}
