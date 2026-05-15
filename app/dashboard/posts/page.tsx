import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";
import { PostMonitor } from "@/components/posts/post-monitor";

export default async function PostsPage() {
  const session = await auth();
  if (!session) return null;

  const posts = await prisma.post.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { keyword: true },
  });

  return (
    <div>
      <Header title="Post Monitoring" description="ติดตามสถานะบทความที่โพสต์" />
      <div className="p-6">
        <PostMonitor
          posts={posts.map((p) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            keyword: p.keyword?.keyword ?? null,
            bloggerUrl: p.bloggerUrl ?? null,
            errorMessage: p.errorMessage ?? null,
            retryCount: p.retryCount,
            scheduledAt: p.scheduledAt?.toISOString() ?? null,
            publishedAt: p.publishedAt?.toISOString() ?? null,
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
