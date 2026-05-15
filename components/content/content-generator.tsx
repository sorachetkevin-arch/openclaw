"use client";

import { useState } from "react";
import { Wand2, ChevronDown, ChevronUp, Eye, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface Props {
  keywords: { id: string; keyword: string }[];
  defaultSettings: {
    writingStyle: string;
    targetLanguage: string;
    promptTemplate: string;
  };
}

const STEPS = ["Research", "Outline", "Draft", "SEO Optimization", "Final HTML"];

export function ContentGenerator({ keywords, defaultSettings }: Props) {
  const [selectedKeywordId, setSelectedKeywordId] = useState("");
  const [customKeyword, setCustomKeyword] = useState("");
  const [writingStyle, setWritingStyle] = useState(defaultSettings.writingStyle);
  const [targetLanguage, setTargetLanguage] = useState(defaultSettings.targetLanguage);
  const [promptTemplate, setPromptTemplate] = useState(defaultSettings.promptTemplate);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [result, setResult] = useState<{
    postId: string;
    title: string;
    htmlContent: string;
    seoMeta: { description: string; focusKeyword: string; tags: string[] };
    outline: string;
  } | null>(null);
  const [previewHtml, setPreviewHtml] = useState(false);
  const { toast } = useToast();

  const keyword = selectedKeywordId
    ? keywords.find((k) => k.id === selectedKeywordId)?.keyword ?? customKeyword
    : customKeyword;

  async function handleGenerate() {
    if (!keyword.trim()) {
      toast({ title: "กรุณาระบุ Keyword", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress(0);

    // Simulate RAG workflow progress
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(STEPS[i]);
      setProgress(((i + 1) / (STEPS.length + 1)) * 80);
      await new Promise((r) => setTimeout(r, 300));
    }

    try {
      const res = await fetch("/api/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(),
          keywordId: selectedKeywordId || undefined,
          writingStyle,
          targetLanguage,
          promptTemplate: promptTemplate || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setProgress(100);
      setCurrentStep("เสร็จสิ้น");
      setResult({
        postId: data.post.id,
        title: data.generated.title,
        htmlContent: data.generated.htmlContent,
        seoMeta: data.generated.seoMeta,
        outline: data.generated.outline,
      });

      toast({ title: "สร้างบทความสำเร็จ!", description: `"${data.generated.title}"` });
    } catch (e) {
      toast({ title: "สร้างบทความไม่สำเร็จ", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleQueue(postId: string) {
    const res = await fetch("/api/scheduler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    if (res.ok) {
      toast({ title: "เพิ่มเข้า Queue สำเร็จ", description: "บทความจะถูกโพสต์ตามตารางเวลา" });
    } else {
      toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Configuration */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">เลือก Keyword</CardTitle>
            <CardDescription>เลือกจากรายการหรือพิมพ์เอง</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {keywords.length > 0 && (
              <div>
                <Label>Keyword จาก Dashboard</Label>
                <Select value={selectedKeywordId} onValueChange={(v) => { setSelectedKeywordId(v); setCustomKeyword(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก Keyword..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- พิมพ์เอง --</SelectItem>
                    {keywords.map((k) => (
                      <SelectItem key={k.id} value={k.id}>{k.keyword}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>หรือพิมพ์ Keyword เอง</Label>
              <Input
                placeholder="เช่น วิธีลดน้ำหนักอย่างได้ผล"
                value={customKeyword}
                onChange={(e) => { setCustomKeyword(e.target.value); setSelectedKeywordId(""); }}
                disabled={!!selectedKeywordId}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ตั้งค่าการสร้างเนื้อหา</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>สไตล์การเขียน</Label>
              <Select value={writingStyle} onValueChange={setWritingStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informative">Informative (ให้ข้อมูล)</SelectItem>
                  <SelectItem value="conversational">Conversational (สนทนา)</SelectItem>
                  <SelectItem value="professional">Professional (มืออาชีพ)</SelectItem>
                  <SelectItem value="storytelling">Storytelling (เล่าเรื่อง)</SelectItem>
                  <SelectItem value="listicle">Listicle (รายการ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>ภาษา</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="th">ภาษาไทย</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                onClick={() => setShowPromptEditor((v) => !v)}
              >
                {showPromptEditor ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Custom Prompt Template
              </button>
              {showPromptEditor && (
                <div className="mt-2">
                  <Textarea
                    rows={8}
                    placeholder="ใส่ Prompt Template ที่กำหนดเอง (ใช้ {writingStyle} และ {targetLanguage} เพื่อแทรกค่า)"
                    value={promptTemplate}
                    onChange={(e) => setPromptTemplate(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RAG Workflow Info */}
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-semibold text-blue-800 mb-2">RAG Workflow</p>
            <div className="flex items-center gap-1 flex-wrap">
              {STEPS.map((step, i) => (
                <span key={step} className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${loading && currentStep === step ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>
                    {step}
                  </span>
                  {i < STEPS.length - 1 && <span className="text-blue-300 text-xs">→</span>}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleGenerate}
          disabled={loading || !keyword.trim()}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {currentStep}...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              สร้างบทความด้วย AI
            </>
          )}
        </Button>

        {loading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-center text-gray-500">ขั้นตอน: {currentStep}</p>
          </div>
        )}
      </div>

      {/* Right: Result */}
      <div className="space-y-4">
        {result ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{result.title}</CardTitle>
                  <Badge variant="success">สร้างสำเร็จ</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SEO Meta */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-600">SEO Meta</p>
                  <p className="text-xs text-gray-700"><strong>Focus Keyword:</strong> {result.seoMeta.focusKeyword}</p>
                  <p className="text-xs text-gray-700"><strong>Description:</strong> {result.seoMeta.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.seoMeta.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>

                {/* Outline */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">โครงสร้างบทความ</p>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                    {result.outline}
                  </pre>
                </div>

                {/* HTML Preview Toggle */}
                <div>
                  <button
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    onClick={() => setPreviewHtml((v) => !v)}
                  >
                    <Eye className="h-3 w-3" />
                    {previewHtml ? "ซ่อน" : "ดู"} HTML Preview
                  </button>
                  {previewHtml && (
                    <div
                      className="mt-2 prose prose-sm max-w-none border rounded-lg p-4 max-h-80 overflow-y-auto bg-white text-xs"
                      dangerouslySetInnerHTML={{ __html: result.htmlContent }}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(result.htmlContent);
                      toast({ title: "คัดลอก HTML สำเร็จ" });
                    }}
                  >
                    คัดลอก HTML
                  </Button>
                  <Button size="sm" onClick={() => handleQueue(result.postId)}>
                    <Calendar className="h-3 w-3" />
                    เพิ่มเข้า Queue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="h-full min-h-[400px] flex items-center justify-center">
            <CardContent className="text-center text-gray-400 pt-12">
              <Wand2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">ผลลัพธ์จะแสดงที่นี่</p>
              <p className="text-xs mt-1">เลือก Keyword และกด "สร้างบทความ"</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
