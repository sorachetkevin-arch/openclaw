import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  keyword: z.string().min(1).max(200),
  priority: z.number().int().min(0).max(10).optional(),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keywords = await prisma.keyword.findMany({
    where: { userId: session.user.id },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { posts: true } } },
  });

  return NextResponse.json(keywords);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const keyword = await prisma.keyword.create({
    data: {
      userId: session.user.id,
      keyword: parsed.data.keyword,
      priority: parsed.data.priority ?? 0,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json(keyword, { status: 201 });
}
