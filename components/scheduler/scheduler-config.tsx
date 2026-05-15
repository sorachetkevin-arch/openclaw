"use client";

import { useState } from "react";
import { Clock, Play, RefreshCw, Calendar, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface Settings {
  scheduleEnabled: boolean;
  scheduleTime: string;
  postsPerDay: number;
  minDelayMinutes: number;
}

interface QueueItem {
  id: string;
  postId: string;
  scheduledAt: string;
  attempts: number;
  status: string;
  lastError?: string;
}

interface PendingPost {
  id: string;
  title: string;
  createdAt: string;
}

interface Props {
  settings: Settings;
  queueItems: QueueItem[];
  pendingPosts: PendingPost[];
}

const QUEUE_STATUS: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  WAITING: { label: "รอโพสต์", variant: "warning" },
  PROCESSING: { label: "กำลังโพสต์", variant: "default" },
  DONE: { label: "สำเร็จ", variant: "success" },
  FAILED: { label: "ล้มเหลว", variant: "destructive" },
};

export function SchedulerConfig({ settings: initialSettings, queueItems: initialQueue, pendingPosts }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [queue, setQueue] = useState(initialQueue);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [enqueueing, setEnqueueing] = useState<string | null>(null);
  const { toast } = useToast();

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/scheduler", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast({ title: "บันทึกการตั้งค่าสำเร็จ" });
      }
    } catch {
      toast({ title: "บันทึกไม่สำเร็จ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function processNow() {
    setProcessing(true);
    try {
      const res = await fetch("/api/queue/process", { method: "POST" });
      const data = await res.json();
      toast({
        title: `ประมวลผล Queue`,
        description: `ดำเนินการ ${data.processed} รายการ`,
      });
    } catch {
      toast({ title: "ประมวลผลไม่สำเร็จ", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  }

  async function enqueuePost(postId: string) {
    setEnqueueing(postId);
    try {
      const res = await fetch("/api/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        toast({ title: "เพิ่มเข้า Queue สำเร็จ" });
      }
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    } finally {
      setEnqueueing(null);
    }
  }

  async function retryFailed(postId: string) {
    try {
      const res = await fetch("/api/queue/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        setQueue((q) =>
          q.map((item) =>
            item.postId === postId
              ? { ...item, status: "WAITING", attempts: 0, lastError: undefined }
              : item
          )
        );
        toast({ title: "รีเซ็ต Queue สำเร็จ" });
      }
    } catch {
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Scheduler Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            ตั้งค่าตารางโพสต์อัตโนมัติ
          </CardTitle>
          <CardDescription>กำหนดความถี่และเวลาในการโพสต์บทความ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">เปิดใช้งาน Auto Schedule</p>
              <p className="text-xs text-gray-500">ระบบจะโพสต์บทความตามเวลาที่กำหนดอัตโนมัติ</p>
            </div>
            <Switch
              checked={settings.scheduleEnabled}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, scheduleEnabled: v }))}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>เวลาโพสต์</Label>
              <Input
                type="time"
                value={settings.scheduleTime}
                onChange={(e) => setSettings((s) => ({ ...s, scheduleTime: e.target.value }))}
              />
            </div>
            <div>
              <Label>จำนวนบทความต่อวัน</Label>
              <Select
                value={String(settings.postsPerDay)}
                onValueChange={(v) => setSettings((s) => ({ ...s, postsPerDay: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} บทความ/วัน</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>ระยะห่างขั้นต่ำระหว่างโพสต์ (นาที)</Label>
            <Input
              type="number"
              min={10}
              value={settings.minDelayMinutes}
              onChange={(e) => setSettings((s) => ({ ...s, minDelayMinutes: Number(e.target.value) }))}
            />
            <p className="text-xs text-gray-400 mt-1">
              เพื่อป้องกัน Google แบน ควรตั้งไว้ที่ 60+ นาที
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />บันทึก...</> : "บันทึกการตั้งค่า"}
            </Button>
            <Button variant="outline" onClick={processNow} disabled={processing}>
              {processing ? <><Loader2 className="h-4 w-4 animate-spin" />กำลังประมวลผล...</> : <><Play className="h-4 w-4" />ประมวลผล Queue ตอนนี้</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Posts — Add to Queue */}
      {pendingPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">บทความที่รอเพิ่มเข้า Queue</CardTitle>
            <CardDescription>บทความ Draft ที่ยังไม่ได้กำหนดเวลาโพสต์</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => enqueuePost(post.id)}
                    disabled={enqueueing === post.id}
                  >
                    {enqueueing === post.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Calendar className="h-3 w-3" />}
                    เพิ่มเข้า Queue
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Monitor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Queue Management</CardTitle>
              <CardDescription>สถานะบทความในคิวทั้งหมด</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>ไม่มีรายการในคิว</p>
            </div>
          ) : (
            <div className="space-y-2">
              {queue.map((item) => {
                const s = QUEUE_STATUS[item.status] ?? { label: item.status, variant: "secondary" as const };
                return (
                  <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={s.variant}>{s.label}</Badge>
                        <span className="text-xs text-gray-500">
                          กำหนด: {formatDate(item.scheduledAt)}
                        </span>
                        {item.attempts > 0 && (
                          <span className="text-xs text-gray-400">พยายาม {item.attempts} ครั้ง</span>
                        )}
                      </div>
                      {item.lastError && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {item.lastError}
                        </p>
                      )}
                    </div>
                    {item.status === "FAILED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-3 shrink-0"
                        onClick={() => retryFailed(item.postId)}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
