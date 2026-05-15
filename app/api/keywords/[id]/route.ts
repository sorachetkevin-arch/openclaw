import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  keyword: z.string().min(1).max(200).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "PUBLISHED", "FAILED"]).optional(),
  priority: z.number().int().min(0).max(10).optional(),
  notes: z.string().max(500).nullable().optional(),
});

async function getKeyword(id: string, userId: string) {
  return prisma.keyword.findFirst({ where: { id, userId } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const kw = await getKeyword(id, session.user.id);
  if (!kw) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.keyword.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const kw = await getKeyword(id, session.user.id);
  if (!kw) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.keyword.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
