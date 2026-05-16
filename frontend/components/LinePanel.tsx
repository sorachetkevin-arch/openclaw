import React, { useState } from 'react';
import { Job, JobStatus } from '../types';
import { INSECT_LABELS, INSECT_EMOJI, PROPERTY_LABELS, formatPrice, formatDate, formatDateTime } from '../constants';
import { Icon } from './Icons';
import { runAgentTask } from '../services/geminiService';

interface Props {
  job: Job;
}

function buildLineUrl(lineId: string): string {
  const id = lineId.startsWith('@') ? lineId : `~${lineId}`;
  return `https://line.me/R/ti/p/${id}`;
}

function generateMessage(job: Job, template: 'quote' | 'confirm' | 'remind' | 'complete'): string {
  const insects = job.insectTypes.map(t => `${INSECT_EMOJI[t]}${INSECT_LABELS[t]}`).join(', ');
  const price = formatPrice(job.estimatedPrice);
  const finalPrice = job.finalPrice ? formatPrice(job.finalPrice) : price;

  switch (template) {
    case 'quote':
      return `สวัสดีครับ คุณ${job.customerName} 🙏

ทางเราขอส่งใบเสนอราคาบริการกำจัดแมลง ดังนี้

🐛 บริการ: ${insects}
📍 สถานที่: ${job.address}
💰 ราคาประมาณ: ${price}
🛡️ รับประกัน: ${job.warrantyMonths ?? 3} เดือน

✅ ราคานี้รวมค่าแรงและค่ายา
✅ ยาได้มาตรฐาน WHO ปลอดภัย
✅ ฟรีกลับมาฉีดซ้ำภายในระยะรับประกัน

สนใจสอบถามเพิ่มเติมได้เลยนะครับ 😊`;

    case 'confirm':
      return `สวัสดีครับ คุณ${job.customerName} 🙏

✅ ยืนยันการจองบริการกำจัดแมลงแล้วครับ

🐛 บริการ: ${insects}
📍 สถานที่: ${job.address}
💰 ราคา: ${price}
${job.scheduledDate ? `📅 วันเวลา: ${formatDateTime(job.scheduledDate)}` : ''}
${job.technician ? `👷 ช่างผู้รับผิดชอบ: ${job.technician}` : ''}

📋 กรุณาเตรียมความพร้อม:
• เก็บอาหาร/ภาชนะให้มิดชิด
• ย้ายสัตว์เลี้ยงออกจากพื้นที่
• เปิดประตู-หน้าต่างไว้รอ

ขอบคุณที่ไว้วางใจบริการของเราครับ 🙏`;

    case 'remind':
      return `สวัสดีครับ คุณ${job.customerName} 🙏

⏰ แจ้งเตือนนัดหมายบริการกำจัดแมลง

${job.scheduledDate ? `📅 วัน-เวลา: ${formatDateTime(job.scheduledDate)}` : ''}
📍 สถานที่: ${job.address}
${job.technician ? `👷 ช่าง: ${job.technician}` : ''}

กรุณาเตรียมความพร้อม และหากต้องการเปลี่ยนแปลงนัดหมาย รบกวนแจ้งล่วงหน้าด้วยนะครับ

ขอบคุณครับ 😊`;

    case 'complete':
      return `สวัสดีครับ คุณ${job.customerName} 🙏

✅ ดำเนินการเสร็จเรียบร้อยแล้วครับ

🐛 บริการ: ${insects}
📍 สถานที่: ${job.address}
💰 ราคาสุดท้าย: ${finalPrice}
${job.completedDate ? `📅 วันที่เสร็จ: ${formatDate(job.completedDate)}` : ''}
🛡️ รับประกัน: ${job.warrantyMonths ?? 3} เดือน${job.followUpDate ? ` (ถึง ${formatDate(job.followUpDate)})` : ''}

หากพบแมลงอีกภายในระยะรับประกัน แจ้งได้เลยนะครับ บริการกลับมาฉีดซ้ำฟรี 🆓

ขอบคุณมากที่ไว้วางใจบริการของเราครับ รบกวนช่วยรีวิวด้วยนะครับ ⭐⭐⭐⭐⭐`;
  }
}

const TEMPLATE_META: Record<string, { label: string; icon: string; statuses: JobStatus[]; color: string }> = {
  quote:    { label: 'ส่งใบเสนอราคา',     icon: 'FileText',      statuses: ['new', 'quoted'],               color: 'blue'    },
  confirm:  { label: 'ยืนยันนัดหมาย',      icon: 'CheckCircle',   statuses: ['confirmed', 'scheduled'],     color: 'emerald' },
  remind:   { label: 'แจ้งเตือนนัดหมาย',   icon: 'Bell',          statuses: ['confirmed', 'scheduled'],     color: 'amber'   },
  complete: { label: 'แจ้งงานเสร็จ',       icon: 'Star',          statuses: ['completed'],                  color: 'purple'  },
};

const COLOR_CLASSES: Record<string, string> = {
  blue:    'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  amber:   'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
  purple:  'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
};

export const LinePanel: React.FC<Props> = ({ job }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<Record<string, string>>({});
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiDraft = async (key: string) => {
    setAiLoading(key);
    setAiError(null);
    const insects = job.insectTypes.map(t => `${INSECT_EMOJI[t]}${INSECT_LABELS[t]}`).join(', ');
    const jobContext = [
      `ชื่อลูกค้า: ${job.customerName}`,
      `แมลงที่ต้องกำจัด: ${insects}`,
      `ประเภทสถานที่: ${PROPERTY_LABELS[job.propertyType]}`,
      `พื้นที่: ${job.areaM2} ตร.ม.`,
      `ที่อยู่: ${job.address}`,
      `ราคาประมาณ: ${formatPrice(job.estimatedPrice)}`,
      job.finalPrice ? `ราคาจริง: ${formatPrice(job.finalPrice)}` : '',
      job.scheduledDate ? `วันนัดหมาย: ${formatDateTime(job.scheduledDate)}` : '',
      job.technician ? `ช่างผู้รับผิดชอบ: ${job.technician}` : '',
      job.warrantyMonths ? `รับประกัน: ${job.warrantyMonths} เดือน` : '',
      job.problemDescription ? `รายละเอียดปัญหา: ${job.problemDescription}` : '',
    ].filter(Boolean).join('\n');

    const templateNames: Record<string, string> = {
      quote: 'ใบเสนอราคา',
      confirm: 'ยืนยันนัดหมาย',
      remind: 'แจ้งเตือนนัดหมาย',
      complete: 'แจ้งงานเสร็จสิ้น',
    };

    const systemInstruction = `คุณเป็นผู้ช่วยเขียนข้อความ LINE สำหรับธุรกิจบริการกำจัดแมลง เขียนข้อความที่:
- เป็นมิตร อบอุ่น เป็นมืออาชีพ
- ใช้ภาษาไทยที่สุภาพแต่ไม่เป็นทางการเกินไป
- ใส่รายละเอียดเฉพาะของลูกค้าและงานเพื่อให้รู้สึกได้รับการดูแลอย่างใกล้ชิด
- ใช้ emoji อย่างเหมาะสม ไม่มากเกินไป
- ห้ามเพิ่มข้อมูลที่ไม่ได้รับมา (เช่น ห้ามแต่งตัวเลขราคาหรือวันเวลาเอง)
- ตอบเฉพาะตัวข้อความ LINE เท่านั้น ไม่ต้องอธิบายเพิ่มเติม`;

    try {
      const result = await runAgentTask(
        systemInstruction,
        `ข้อมูลงาน:\n${jobContext}\n\nประเภทข้อความ: ${templateNames[key] ?? key}`,
      );
      setAiMessages(prev => ({ ...prev, [key]: result }));
      setExpandedKey(key);
    } catch (e: any) {
      setAiError('ไม่สามารถเชื่อมต่อ AI ได้ กรุณาตรวจสอบการเชื่อมต่อ backend');
    } finally {
      setAiLoading(null);
    }
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const relevantTemplates = Object.entries(TEMPLATE_META).filter(
    ([, meta]) => meta.statuses.includes(job.status)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h2 className="font-semibold text-slate-700 mb-4 flex items-center space-x-2">
        {/* LINE green brand icon */}
        <span className="w-5 h-5 flex items-center justify-center rounded-md bg-[#06C755] shrink-0">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
        </span>
        <span>LINE Integration</span>
        {job.source === 'line' && (
          <span className="text-xs bg-[#06C755]/10 text-[#06C755] font-semibold px-2 py-0.5 rounded-full border border-[#06C755]/20">
            ลูกค้า LINE OA
          </span>
        )}
      </h2>

      {/* Open LINE chat */}
      {job.customerLineId ? (
        <div className="mb-4 flex items-center justify-between bg-[#06C755]/5 border border-[#06C755]/20 rounded-xl px-4 py-3">
          <div className="text-sm">
            <span className="text-slate-500 text-xs">LINE ID</span>
            <div className="font-semibold text-slate-700">{job.customerLineId}</div>
          </div>
          <a
            href={buildLineUrl(job.customerLineId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#06C755] hover:bg-[#05b34b] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Icon name="MessageSquare" className="w-4 h-4" />
            <span>เปิด LINE</span>
          </a>
        </div>
      ) : (
        <div className="mb-4 text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
          ไม่มี LINE ID — เพิ่มได้ที่หน้าแก้ไขลูกค้า
        </div>
      )}

      {/* Message templates */}
      {relevantTemplates.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">ข้อความที่แนะนำ</div>
          {aiError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">
              {aiError}
            </div>
          )}
          {relevantTemplates.map(([key, meta]) => {
            const defaultMessage = generateMessage(job, key as any);
            const aiMessage = aiMessages[key];
            const activeMessage = aiMessage ?? defaultMessage;
            const isExpanded = expandedKey === key;
            const isCopied = copiedKey === key;
            const isGenerating = aiLoading === key;
            return (
              <div key={key} className={`rounded-xl border ${COLOR_CLASSES[meta.color]} transition-colors`}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Icon name={meta.icon} className="w-4 h-4" />
                    <span className="text-sm font-semibold">{meta.label}</span>
                    {aiMessage && (
                      <span className="text-xs bg-white/60 border border-current/20 px-1.5 py-0.5 rounded-full font-medium opacity-80">
                        AI
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setExpandedKey(isExpanded ? null : key)}
                      className="text-xs underline opacity-70 hover:opacity-100"
                    >
                      {isExpanded ? 'ซ่อน' : 'ดูตัวอย่าง'}
                    </button>
                    <button
                      onClick={() => handleAiDraft(key)}
                      disabled={isGenerating || !!aiLoading}
                      className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white/60 hover:bg-white border border-current/20 text-xs font-semibold transition-colors disabled:opacity-50"
                      title="สร้างข้อความด้วย AI"
                    >
                      {isGenerating ? (
                        <Icon name="Loader2" className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Icon name="Sparkles" className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">{isGenerating ? 'กำลังสร้าง...' : 'AI'}</span>
                    </button>
                    <button
                      onClick={() => copyText(key, activeMessage)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/60 hover:bg-white border border-current/20 text-xs font-semibold transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Icon name="Check" className="w-3.5 h-3.5" />
                          <span>คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Icon name="Copy" className="w-3.5 h-3.5" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {aiMessage && (
                      <div className="flex items-center justify-between text-xs opacity-70">
                        <span className="flex items-center space-x-1">
                          <Icon name="Sparkles" className="w-3 h-3" />
                          <span>ข้อความจาก AI</span>
                        </span>
                        <button
                          onClick={() => setAiMessages(prev => { const n = { ...prev }; delete n[key]; return n; })}
                          className="underline hover:opacity-100"
                        >
                          ใช้ข้อความเดิม
                        </button>
                      </div>
                    )}
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-white/60 rounded-lg p-3 border border-current/10 font-sans leading-relaxed">
                      {activeMessage}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {relevantTemplates.length === 0 && (
        <div className="text-xs text-slate-400 text-center py-2">
          ไม่มีข้อความแนะนำสำหรับสถานะนี้
        </div>
      )}
    </div>
  );
};
