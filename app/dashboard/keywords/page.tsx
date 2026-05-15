import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";
import { KeywordManager } from "@/components/keywords/keyword-manager";

export default async function KeywordsPage() {
  const session = await auth();
  if (!session) return null;

  const keywords = await prisma.keyword.findMany({
    where: { userId: session.user.id },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div>
      <Header title="Keyword Dashboard" description="จัดการคีย์เวิร์ดสำหรับสร้างบทความ" />
      <div className="p-6">
        <KeywordManager
          initialKeywords={keywords.map((k) => ({
            id: k.id,
            keyword: k.keyword,
            status: k.status,
            priority: k.priority,
            notes: k.notes ?? undefined,
            postCount: k._count.posts,
            createdAt: k.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
