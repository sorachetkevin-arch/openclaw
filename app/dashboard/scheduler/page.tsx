import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";
import { SchedulerConfig } from "@/components/scheduler/scheduler-config";

export default async function SchedulerPage() {
  const session = await auth();
  if (!session) return null;

  const [settings, queueItems, pendingPosts] = await Promise.all([
    prisma.userSettings.findUnique({ where: { userId: session.user.id } }),
    prisma.queueItem.findMany({
      where: { userId: session.user.id },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    }),
    prisma.post.findMany({
      where: { userId: session.user.id, status: "DRAFT" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <Header title="Automation Scheduler" description="ตั้งเวลาโพสต์บทความอัตโนมัติ" />
      <div className="p-6">
        <SchedulerConfig
          settings={{
            scheduleEnabled: settings?.scheduleEnabled ?? false,
            scheduleTime: settings?.scheduleTime ?? "08:00",
            postsPerDay: settings?.postsPerDay ?? 1,
            minDelayMinutes: settings?.minDelayMinutes ?? 60,
          }}
          queueItems={queueItems.map((q) => ({
            id: q.id,
            postId: q.postId,
            scheduledAt: q.scheduledAt.toISOString(),
            attempts: q.attempts,
            status: q.status,
            lastError: q.lastError ?? undefined,
          }))}
          pendingPosts={pendingPosts.map((p) => ({
            id: p.id,
            title: p.title,
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
