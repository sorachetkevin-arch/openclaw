import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) return null;

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div>
      <Header title="ตั้งค่า" description="จัดการการตั้งค่าระบบ" />
      <div className="p-6">
        <SettingsForm
          initialSettings={{
            writingStyle: settings?.writingStyle ?? "informative",
            targetLanguage: settings?.targetLanguage ?? "th",
            promptTemplate: settings?.promptTemplate ?? "",
            scheduleEnabled: settings?.scheduleEnabled ?? false,
            scheduleTime: settings?.scheduleTime ?? "08:00",
            postsPerDay: settings?.postsPerDay ?? 1,
            minDelayMinutes: settings?.minDelayMinutes ?? 60,
          }}
        />
      </div>
    </div>
  );
}
