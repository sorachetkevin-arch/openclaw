import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";
import { BloggerConnector } from "@/components/blogger/blogger-connector";

export default async function BloggerPage() {
  const session = await auth();
  if (!session) return null;

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div>
      <Header title="Blogger Connector" description="เชื่อมต่อและจัดการ Blog ของคุณ" />
      <div className="p-6">
        <BloggerConnector
          currentBlogId={settings?.selectedBlogId ?? null}
          currentBlogName={settings?.selectedBlogName ?? null}
        />
      </div>
    </div>
  );
}
