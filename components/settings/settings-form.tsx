"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsData {
  writingStyle: string;
  targetLanguage: string;
  promptTemplate: string;
  scheduleEnabled: boolean;
  scheduleTime: string;
  postsPerDay: number;
  minDelayMinutes: number;
}

export function SettingsForm({ initialSettings }: { initialSettings: SettingsData }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function save() {
    setSaving(true);
    try {
      const [schedRes, contentRes] = await Promise.all([
        fetch("/api/scheduler", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduleEnabled: settings.scheduleEnabled,
            scheduleTime: settings.scheduleTime,
            postsPerDay: settings.postsPerDay,
            minDelayMinutes: settings.minDelayMinutes,
          }),
        }),
        fetch("/api/settings/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            writingStyle: settings.writingStyle,
            targetLanguage: settings.targetLanguage,
            promptTemplate: settings.promptTemplate,
          }),
        }),
      ]);
      if (schedRes.ok || contentRes.ok) {
        toast({ title: "บันทึกการตั้งค่าสำเร็จ" });
      }
    } catch {
      toast({ title: "บันทึกไม่สำเร็จ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ตั้งค่า AI Content</CardTitle>
          <CardDescription>ปรับแต่งการสร้างเนื้อหาด้วย AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>สไตล์การเขียนเริ่มต้น</Label>
              <Select value={settings.writingStyle} onValueChange={(v) => setSettings((s) => ({ ...s, writingStyle: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                  <SelectItem value="listicle">Listicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ภาษาเริ่มต้น</Label>
              <Select value={settings.targetLanguage} onValueChange={(v) => setSettings((s) => ({ ...s, targetLanguage: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="th">ภาษาไทย</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Default Prompt Template</Label>
            <Textarea
              rows={6}
              placeholder="Prompt Template (ใช้ {writingStyle} และ {targetLanguage})"
              value={settings.promptTemplate}
              onChange={(e) => setSettings((s) => ({ ...s, promptTemplate: e.target.value }))}
              className="text-xs font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">เว้นว่างเพื่อใช้ template เริ่มต้น</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ตั้งค่า Scheduler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto Schedule</p>
              <p className="text-xs text-gray-500">โพสต์อัตโนมัติตามตาราง</p>
            </div>
            <Switch
              checked={settings.scheduleEnabled}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, scheduleEnabled: v }))}
            />
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>เวลาโพสต์</Label>
              <Input type="time" value={settings.scheduleTime} onChange={(e) => setSettings((s) => ({ ...s, scheduleTime: e.target.value }))} />
            </div>
            <div>
              <Label>บทความ/วัน</Label>
              <Input type="number" min={1} max={20} value={settings.postsPerDay} onChange={(e) => setSettings((s) => ({ ...s, postsPerDay: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Delay (นาที)</Label>
              <Input type="number" min={10} value={settings.minDelayMinutes} onChange={(e) => setSettings((s) => ({ ...s, minDelayMinutes: Number(e.target.value) }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" />บันทึก...</> : "บันทึกการตั้งค่า"}
      </Button>
    </div>
  );
}
