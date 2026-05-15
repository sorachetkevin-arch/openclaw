"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Keyword {
  id: string;
  keyword: string;
  status: string;
  priority: number;
  notes?: string;
  postCount: number;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  IN_PROGRESS: { label: "กำลังสร้าง", variant: "default" },
  PUBLISHED: { label: "โพสต์แล้ว", variant: "success" },
  FAILED: { label: "ล้มเหลว", variant: "destructive" },
};

export function KeywordManager({ initialKeywords }: { initialKeywords: Keyword[] }) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Keyword | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [form, setForm] = useState({ keyword: "", priority: 0, notes: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const filtered = filterStatus === "ALL" ? keywords : keywords.filter((k) => k.status === filterStatus);

  async function handleAdd() {
    if (!form.keyword.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setKeywords((prev) => [{ ...data, postCount: 0 }, ...prev]);
      setIsAddOpen(false);
      setForm({ keyword: "", priority: 0, notes: "" });
      toast({ title: "เพิ่ม Keyword สำเร็จ" });
    } catch (e) {
      toast({ title: "เกิดข้อผิดพลาด", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit() {
    if (!editItem) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/keywords/${editItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: editItem.keyword, priority: editItem.priority, notes: editItem.notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setKeywords((prev) => prev.map((k) => (k.id === editItem.id ? { ...k, ...data } : k)));
      setEditItem(null);
      toast({ title: "แก้ไข Keyword สำเร็จ" });
    } catch (e) {
      toast({ title: "เกิดข้อผิดพลาด", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("ต้องการลบ Keyword นี้?")) return;
    try {
      const res = await fetch(`/api/keywords/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setKeywords((prev) => prev.filter((k) => k.id !== id));
      toast({ title: "ลบ Keyword สำเร็จ" });
    } catch {
      toast({ title: "ลบไม่สำเร็จ", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทั้งหมด ({keywords.length})</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">กำลังสร้าง</SelectItem>
              <SelectItem value="PUBLISHED">โพสต์แล้ว</SelectItem>
              <SelectItem value="FAILED">ล้มเหลว</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          เพิ่ม Keyword
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              ยังไม่มี Keyword {filterStatus !== "ALL" && `สถานะ ${filterStatus}`}
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((kw) => {
                const s = STATUS_LABELS[kw.status] ?? { label: kw.status, variant: "secondary" as const };
                return (
                  <div key={kw.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{kw.keyword}</span>
                        <Badge variant={s.variant}>{s.label}</Badge>
                        {kw.priority > 0 && (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <ChevronUp className="h-3 w-3" /> P{kw.priority}
                          </span>
                        )}
                      </div>
                      {kw.notes && <p className="text-xs text-gray-500 mt-1">{kw.notes}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{kw.postCount} บทความ</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="icon" onClick={() => setEditItem(kw)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(kw.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่ม Keyword ใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="kw">Keyword *</Label>
              <Input
                id="kw"
                placeholder="เช่น วิธีทำ SEO สำหรับมือใหม่"
                value={form.keyword}
                onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="pri">Priority (0-10)</Label>
              <Input
                id="pri"
                type="number"
                min={0}
                max={10}
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="notes">หมายเหตุ</Label>
              <Textarea
                id="notes"
                placeholder="บันทึกเพิ่มเติม..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleAdd} disabled={loading || !form.keyword.trim()}>
              {loading ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไข Keyword</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label>Keyword</Label>
                <Input
                  value={editItem.keyword}
                  onChange={(e) => setEditItem((k) => k ? { ...k, keyword: e.target.value } : k)}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={editItem.priority}
                  onChange={(e) => setEditItem((k) => k ? { ...k, priority: Number(e.target.value) } : k)}
                />
              </div>
              <div>
                <Label>หมายเหตุ</Label>
                <Textarea
                  value={editItem.notes ?? ""}
                  onChange={(e) => setEditItem((k) => k ? { ...k, notes: e.target.value } : k)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>ยกเลิก</Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
