"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  LayoutDashboard,
  Tags,
  Wand2,
  Globe,
  Clock,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "ภาพรวม" },
  { href: "/dashboard/keywords", icon: Tags, label: "Keywords" },
  { href: "/dashboard/content", icon: Wand2, label: "สร้างเนื้อหา AI" },
  { href: "/dashboard/blogger", icon: Globe, label: "Blogger Connector" },
  { href: "/dashboard/scheduler", icon: Clock, label: "ตั้งเวลาโพสต์" },
  { href: "/dashboard/posts", icon: FileText, label: "บทความทั้งหมด" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-gray-900 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-1.5">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">AI Automated</p>
            <p className="text-blue-400 text-xs">Blogger</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Settings className="h-4 w-4" />
          ตั้งค่า
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
