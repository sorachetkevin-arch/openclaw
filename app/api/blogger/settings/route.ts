import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  selectedBlogId: z.string(),
  selectedBlogName: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: {
      selectedBlogId: parsed.data.selectedBlogId,
      selectedBlogName: parsed.data.selectedBlogName,
    },
    create: {
      userId: session.user.id,
      selectedBlogId: parsed.data.selectedBlogId,
      selectedBlogName: parsed.data.selectedBlogName,
    },
  });

  return NextResponse.json(settings);
}
