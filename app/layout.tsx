import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Automated Blogger",
  description: "สร้างเนื้อหา SEO และโพสต์ลง Blogger.com โดยอัตโนมัติ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
