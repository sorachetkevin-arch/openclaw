import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateBlogContent } from "@/lib/claude";
import { z } from "zod";

const schema = z.object({
  keyword: z.string().min(1),
  keywordId: z.string().optional(),
  writingStyle: z.string().optional(),
  targetLanguage: z.string().optional(),
  promptTemplate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  // Mark keyword as in-progress
  if (parsed.data.keywordId) {
    await prisma.keyword.updateMany({
      where: { id: parsed.data.keywordId, userId: session.user.id },
      data: { status: "IN_PROGRESS" },
    });
  }

  try {
    const generated = await generateBlogContent({
      keyword: parsed.data.keyword,
      writingStyle: parsed.data.writingStyle,
      targetLanguage: parsed.data.targetLanguage,
      promptTemplate: parsed.data.promptTemplate || undefined,
    });

    // Save as draft post
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        keywordId: parsed.data.keywordId ?? null,
        title: generated.title,
        content: generated.outline,
        htmlContent: generated.htmlContent,
        seoMeta: generated.seoMeta,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ post, generated }, { status: 201 });
  } catch (err) {
    if (parsed.data.keywordId) {
      await prisma.keyword.updateMany({
        where: { id: parsed.data.keywordId, userId: session.user.id },
        data: { status: "PENDING" },
      });
    }
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
