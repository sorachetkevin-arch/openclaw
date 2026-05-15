import { prisma } from "@/lib/prisma";
import { publishToBlogger } from "@/lib/blogger";
import { PostStatus, QueueStatus } from "@prisma/client";

export async function enqueuePost(postId: string, userId: string, scheduledAt: Date) {
  await prisma.$transaction([
    prisma.queueItem.upsert({
      where: { postId },
      update: { scheduledAt, status: QueueStatus.WAITING, attempts: 0, lastError: null },
      create: { postId, userId, scheduledAt, status: QueueStatus.WAITING },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { status: PostStatus.QUEUED, scheduledAt },
    }),
  ]);
}

export async function processQueue(userId: string) {
  const now = new Date();

  const dueItems = await prisma.queueItem.findMany({
    where: {
      userId,
      status: QueueStatus.WAITING,
      scheduledAt: { lte: now },
      attempts: { lt: 5 },
    },
    take: 1,
    include: { user: true },
  });

  const results = [];

  for (const item of dueItems) {
    await prisma.queueItem.update({
      where: { id: item.id },
      data: { status: QueueStatus.PROCESSING, attempts: { increment: 1 } },
    });
    await prisma.post.update({
      where: { id: item.postId },
      data: { status: PostStatus.PUBLISHING },
    });

    try {
      const post = await prisma.post.findUnique({ where: { id: item.postId } });
      const settings = await prisma.userSettings.findUnique({ where: { userId } });

      if (!post || !settings?.selectedBlogId) {
        throw new Error("Post or blog configuration missing");
      }

      const published = await publishToBlogger(userId, {
        blogId: settings.selectedBlogId,
        title: post.title,
        htmlContent: post.htmlContent,
        labels: (post.seoMeta as { tags?: string[] } | null)?.tags ?? [],
      });

      await prisma.$transaction([
        prisma.post.update({
          where: { id: item.postId },
          data: {
            status: PostStatus.PUBLISHED,
            bloggerPostId: published.id,
            bloggerUrl: published.url,
            publishedAt: new Date(published.publishedAt),
          },
        }),
        prisma.queueItem.update({
          where: { id: item.id },
          data: { status: QueueStatus.DONE },
        }),
      ]);

      if (post.keywordId) {
        await prisma.keyword.update({
          where: { id: post.keywordId },
          data: { status: "PUBLISHED" },
        });
      }

      results.push({ postId: item.postId, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      await prisma.$transaction([
        prisma.post.update({
          where: { id: item.postId },
          data: {
            status: PostStatus.FAILED,
            errorMessage: message,
            retryCount: { increment: 1 },
          },
        }),
        prisma.queueItem.update({
          where: { id: item.id },
          data: {
            status: item.attempts >= 4 ? QueueStatus.FAILED : QueueStatus.WAITING,
            lastError: message,
            scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // retry in 1h
          },
        }),
      ]);

      results.push({ postId: item.postId, success: false, error: message });
    }
  }

  return results;
}

export async function getQueueStats(userId: string) {
  const [waiting, processing, done, failed] = await Promise.all([
    prisma.queueItem.count({ where: { userId, status: QueueStatus.WAITING } }),
    prisma.queueItem.count({ where: { userId, status: QueueStatus.PROCESSING } }),
    prisma.queueItem.count({ where: { userId, status: QueueStatus.DONE } }),
    prisma.queueItem.count({ where: { userId, status: QueueStatus.FAILED } }),
  ]);
  return { waiting, processing, done, failed };
}
