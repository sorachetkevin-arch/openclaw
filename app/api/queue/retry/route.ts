import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json();

  const post = await prisma.post.findFirst({
    where: { id: postId, userId: session.user.id },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.post.update({
      where: { id: postId },
      data: { status: "QUEUED", errorMessage: null },
    }),
    prisma.queueItem.upsert({
      where: { postId },
      update: {
        status: "WAITING",
        attempts: 0,
        lastError: null,
        scheduledAt: new Date(),
      },
      create: {
        postId,
        userId: session.user.id,
        scheduledAt: new Date(),
        status: "WAITING",
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
