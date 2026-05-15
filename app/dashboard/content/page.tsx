import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";
import { ContentGenerator } from "@/components/content/content-generator";

export default async function ContentPage() {
  const session = await auth();
  if (!session) return null;

  const [keywords, settings] = await Promise.all([
    prisma.keyword.findMany({
      where: { userId: session.user.id, status: { in: ["PENDING", "IN_PROGRESS"] } },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    }),
    prisma.userSettings.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <div>
      <Header title="AI Content Engine" description="สร้างเนื้อหาบทความด้วย Claude AI" />
      <div className="p-6">
        <ContentGenerator
          keywords={keywords.map((k) => ({ id: k.id, keyword: k.keyword }))}
          defaultSettings={{
            writingStyle: settings?.writingStyle ?? "informative",
            targetLanguage: settings?.targetLanguage ?? "th",
            promptTemplate: settings?.promptTemplate ?? "",
          }}
        />
      </div>
    </div>
  );
}
