import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tags, FileText, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;
  const userId = session.user.id;

  const [keywordCount, postStats, recentPosts, queueStats] = await Promise.all([
    prisma.keyword.count({ where: { userId } }),
    prisma.post.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    }),
    prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { keyword: true },
    }),
    prisma.queueItem.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    }),
  ]);

  const statMap = Object.fromEntries(postStats.map((s) => [s.status, s._count.status]));
  const queueMap = Object.fromEntries(queueStats.map((s) => [s.status, s._count.status]));
  const totalPosts = postStats.reduce((a, s) => a + s._count.status, 0);

  const stats = [
    { label: "Keywords ทั้งหมด", value: keywordCount, icon: Tags, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "บทความทั้งหมด", value: totalPosts, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "โพสต์แล้ว", value: statMap["PUBLISHED"] ?? 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "รอในคิว", value: queueMap["WAITING"] ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "ล้มเหลว", value: statMap["FAILED"] ?? 0, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Draft", value: statMap["DRAFT"] ?? 0, icon: TrendingUp, color: "text-gray-600", bg: "bg-gray-50" },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "outline" }> = {
      DRAFT: { label: "Draft", variant: "secondary" },
      QUEUED: { label: "รอโพสต์", variant: "warning" },
      PUBLISHING: { label: "กำลังโพสต์", variant: "default" },
      PUBLISHED: { label: "โพสต์แล้ว", variant: "success" },
      FAILED: { label: "ล้มเหลว", variant: "destructive" },
    };
    const s = map[status] ?? { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div>
      <Header title="ภาพรวม" description="สรุปสถานะระบบ AI Automated Blogger" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/dashboard/keywords", label: "เพิ่ม Keyword", desc: "เพิ่มคีย์เวิร์ดใหม่" },
            { href: "/dashboard/content", label: "สร้างบทความ", desc: "ใช้ AI สร้างเนื้อหา" },
            { href: "/dashboard/blogger", label: "เชื่อมต่อ Blog", desc: "ตั้งค่า Blogger.com" },
            { href: "/dashboard/scheduler", label: "ตั้งเวลา", desc: "กำหนดตารางโพสต์" },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">บทความล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">ยังไม่มีบทความ</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                      <p className="text-xs text-gray-500">
                        {post.keyword?.keyword && <span className="mr-2">#{post.keyword.keyword}</span>}
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0">{statusBadge(post.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
