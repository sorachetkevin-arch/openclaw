"use client";

import { useState } from "react";
import { Globe, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface BlogInfo {
  id: string;
  name: string;
  url: string;
  description?: string;
}

interface Props {
  currentBlogId: string | null;
  currentBlogName: string | null;
}

export function BloggerConnector({ currentBlogId, currentBlogName }: Props) {
  const [testing, setTesting] = useState(false);
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  const [blogs, setBlogs] = useState<BlogInfo[]>([]);
  const [selectedBlogId, setSelectedBlogId] = useState(currentBlogId ?? "");
  const [selectedBlogName, setSelectedBlogName] = useState(currentBlogName ?? "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function testConnection() {
    setTesting(true);
    setConnectionOk(null);
    try {
      const res = await fetch("/api/blogger/test");
      const data = await res.json();
      setConnectionOk(data.ok);
      if (data.ok) {
        setBlogs(data.blogs);
        toast({ title: "เชื่อมต่อสำเร็จ!", description: `พบ ${data.blogs.length} บล็อก` });
      } else {
        toast({ title: "เชื่อมต่อไม่สำเร็จ", description: "ตรวจสอบ OAuth token หรือ Login ใหม่", variant: "destructive" });
      }
    } catch {
      setConnectionOk(false);
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    } finally {
      setTesting(false);
    }
  }

  async function fetchBlogs() {
    try {
      const res = await fetch("/api/blogger/blogs");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBlogs(data);
        toast({ title: `โหลด ${data.length} บล็อกสำเร็จ` });
      }
    } catch {
      toast({ title: "โหลด Blog ไม่สำเร็จ", variant: "destructive" });
    }
  }

  async function saveBlogSelection(blogId: string, blogName: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/blogger/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedBlogId: blogId, selectedBlogName: blogName }),
      });
      if (res.ok) {
        setSelectedBlogId(blogId);
        setSelectedBlogName(blogName);
        toast({ title: "บันทึก Blog เป้าหมายสำเร็จ", description: blogName });
      }
    } catch {
      toast({ title: "บันทึกไม่สำเร็จ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            สถานะการเชื่อมต่อ Blogger API
          </CardTitle>
          <CardDescription>ทดสอบว่า Google OAuth Token ยังใช้งานได้</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={testConnection} disabled={testing} variant="outline">
              {testing ? (
                <><Loader2 className="h-4 w-4 animate-spin" />กำลังทดสอบ...</>
              ) : (
                <><RefreshCw className="h-4 w-4" />Test Connection</>
              )}
            </Button>

            {connectionOk === true && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">เชื่อมต่อสำเร็จ</span>
              </div>
            )}
            {connectionOk === false && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="text-sm font-medium">เชื่อมต่อไม่ได้</span>
              </div>
            )}
          </div>

          {connectionOk === false && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
              Token หมดอายุหรือไม่มีสิทธิ์ Blogger API
              กรุณา <strong>ออกจากระบบ</strong> และ <strong>Login ใหม่</strong> เพื่อรับ Token ใหม่
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Selection */}
      {selectedBlogId && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Blog เป้าหมายที่เลือก</p>
                <p className="text-sm text-green-700">{selectedBlogName}</p>
                <p className="text-xs text-green-600">ID: {selectedBlogId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">เลือก Blog เป้าหมาย</CardTitle>
              <CardDescription>บทความจะถูกโพสต์ไปยัง Blog ที่เลือก</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchBlogs}>
              <RefreshCw className="h-3 w-3" />
              โหลดรายการ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {blogs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>กด "Test Connection" หรือ "โหลดรายการ" เพื่อดู Blog</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedBlogId === blog.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                  onClick={() => saveBlogSelection(blog.id, blog.name)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{blog.name}</p>
                      <a
                        href={blog.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {blog.url}
                      </a>
                      {blog.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{blog.description}</p>
                      )}
                    </div>
                    <div className="ml-4 shrink-0">
                      {selectedBlogId === blog.id ? (
                        <Badge variant="default">เลือกอยู่</Badge>
                      ) : (
                        <Badge variant="outline">เลือก</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
