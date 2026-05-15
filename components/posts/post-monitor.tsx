"use client";

import { useState } from "react";
import { ExternalLink, RefreshCw, Trash2, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  status: string;
  keyword: string | null;
  bloggerUrl: string | null;
  errorMessage: string | null;
  retryCount: number;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
}

const STATUS: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  QUEUED: { label: "รอโพสต์", variant: "warning" },
  PUBLISHING: { label: "กำลังโพสต์", variant: "default" },
  PUBLISHED: { label: "โพสต์แล้ว", variant: "success" },
  FAILED: { label: "ล้มเหลว", variant: "destructive" },
};

export function PostMonitor({ posts: initialPosts }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const { toast } = useToast();

  const filtered = filterStatus === "ALL" ? posts : posts.filter((p) => p.status === filterStatus);

  async function handleDelete(id: string) {
    if (!confirm("ต้องการลบบทความนี้?")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((p) => p.filter((x) => x.id !== id));
      toast({ title: "ลบบทความสำเร็จ" });
    }
  }

  async function handleRetry(id: string) {
    const res = await fetch("/api/queue/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: id }),
    });
    if (res.ok) {
      setPosts((p) => p.map((x) => x.id === id ? { ...x, status: "QUEUED", errorMessage: null } : x));
      toast({ title: "รีทรายใหม่สำเร็จ" });
    }
  }

  async function handlePreview(post: Post) {
    setPreviewPost(post);
    setHtmlContent("");
    try {
      const res = await fetch(`/api/posts/${post.id}`);
      const data = await res.json();
      setHtmlContent(data.htmlContent ?? "");
    } catch {}
  }

  const counts: Record<string, number> = {};
  posts.forEach((p) => { counts[p.status] = (counts[p.status] ?? 0) + 1; });

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(STATUS).map(([status, { label, variant }]) => (
          <Card key={status} className="min-w-[100px]">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-xl font-bold text-gray-900">{counts[status] ?? 0}</p>
              <Badge variant={variant} className="text-xs mt-1">{label}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ทั้งหมด ({posts.length})</SelectItem>
            {Object.entries(STATUS).map(([status, { label }]) => (
              <SelectItem key={status} value={status}>{label} ({counts[status] ?? 0})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">ไม่มีบทความ</div>
          ) : (
            <div className="divide-y">
              {filtered.map((post) => {
                const s = STATUS[post.status] ?? { label: post.status, variant: "outline" as const };
                return (
                  <div key={post.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm">{post.title}</span>
                          <Badge variant={s.variant}>{s.label}</Badge>
                          {post.keyword && (
                            <span className="text-xs text-gray-400">#{post.keyword}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 flex-wrap">
                          <span>สร้าง: {formatDate(post.createdAt)}</span>
                          {post.scheduledAt && <span>กำหนด: {formatDate(post.scheduledAt)}</span>}
                          {post.publishedAt && <span>โพสต์: {formatDate(post.publishedAt)}</span>}
                          {post.retryCount > 0 && <span>พยายาม {post.retryCount} ครั้ง</span>}
                        </div>

                        {post.errorMessage && (
                          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {post.errorMessage}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => handlePreview(post)} title="Preview">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {post.bloggerUrl && (
                          <a href={post.bloggerUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" title="เปิดในบล็อก">
                              <ExternalLink className="h-4 w-4 text-blue-600" />
                            </Button>
                          </a>
                        )}
                        {post.status === "FAILED" && (
                          <Button variant="ghost" size="icon" onClick={() => handleRetry(post.id)} title="Retry">
                            <RefreshCw className="h-4 w-4 text-yellow-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} title="ลบ">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewPost} onOpenChange={(o) => !o && setPreviewPost(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{previewPost?.title}</DialogTitle>
          </DialogHeader>
          {htmlContent ? (
            <div
              className="prose prose-sm max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <p className="text-center text-gray-400 py-8">กำลังโหลด...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
