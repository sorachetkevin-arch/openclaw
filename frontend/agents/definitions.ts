import { AgentDefinition, Job } from '../types';
import { INSECT_LABELS, PROPERTY_LABELS, SOURCE_LABELS, formatPrice, formatDate, formatDateTime, calculatePrice } from '../constants';

function jobSummary(job: Job): string {
  const breakdown = calculatePrice(job.insectTypes, job.propertyType, job.areaM2);
  return `
ลูกค้า: ${job.customerName}
ช่องทางติดต่อ: ${SOURCE_LABELS[job.source]}
ประเภทแมลง: ${job.insectTypes.map(t => INSECT_LABELS[t]).join(', ')}
ประเภทสถานที่: ${PROPERTY_LABELS[job.propertyType]} (${job.areaM2} ตร.ม.)
ที่อยู่: ${job.address}
รายละเอียดปัญหา: ${job.problemDescription}
สถานะงาน: ${job.status}
ราคาประมาณ: ${formatPrice(job.estimatedPrice)}${job.finalPrice ? ` / ราคาจริง: ${formatPrice(job.finalPrice)}` : ''}
${job.scheduledDate ? `วันนัดหมาย: ${formatDateTime(job.scheduledDate)}` : ''}
${job.technician ? `ช่างผู้รับผิดชอบ: ${job.technician}` : ''}
${job.completedDate ? `วันที่เสร็จงาน: ${formatDate(job.completedDate)}` : ''}
${job.warrantyMonths ? `รับประกัน: ${job.warrantyMonths} เดือน${job.followUpDate ? ` (follow-up ${formatDate(job.followUpDate)})` : ''}` : ''}
${job.notes ? `หมายเหตุ: ${job.notes}` : ''}

รายละเอียดราคา:
${breakdown.insectBreakdown.map(b => `- ${b.label}: ${formatPrice(b.price)}`).join('\n')}
`.trim();
}

/**
 * Ten specialist sub-agents, staged into a dependency graph so the orchestrator
 * can run independent agents in parallel and feed dependent agents the upstream
 * outputs as context (see services/orchestrator.ts for stage execution).
 */
export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: 'intake',
    name: 'Lead Intake',
    role: 'นักรับเรื่องและคัดกรอง',
    description: 'สรุปคำร้องของลูกค้าให้กระชับ และประเมินความเร่งด่วนของงาน',
    iconName: 'Search',
    colorClass: 'bg-blue-500',
    dependsOn: [],
    isApplicable: () => true,
    systemInstruction:
      'คุณคือเจ้าหน้าที่รับเรื่องของบริษัทกำจัดแมลงในไทย สรุปคำร้องของลูกค้าเป็นภาษาไทยแบบกระชับ ' +
      '3-5 บรรทัด ระบุระดับความเร่งด่วน (ต่ำ/ปานกลาง/สูง) พร้อมเหตุผลสั้นๆ ตอบเป็น Markdown',
    buildInput: (job) => jobSummary(job),
  },
  {
    id: 'diagnosis',
    name: 'Diagnosis',
    role: 'นักวินิจฉัยปัญหาแมลง',
    description: 'วิเคราะห์ชนิดแมลงและระดับการระบาด แนะนำวิธีการกำจัดที่เหมาะสม',
    iconName: 'Target',
    colorClass: 'bg-amber-500',
    dependsOn: [],
    isApplicable: () => true,
    systemInstruction:
      'คุณคือผู้เชี่ยวชาญกำจัดแมลงในไทย จากข้อมูลงานที่ให้มา วินิจฉัยลักษณะการระบาดและความเสี่ยง ' +
      'แนะนำวิธีการกำจัด/สารเคมีหรือวิธีเชิงกลที่เหมาะสม และระยะเวลาที่คาดว่าจะเห็นผล ตอบเป็นภาษาไทย Markdown',
    buildInput: (job) => jobSummary(job),
  },
  {
    id: 'safety',
    name: 'Safety & Compliance',
    role: 'นักตรวจสอบความปลอดภัย',
    description: 'ตรวจข้อควรระวังเรื่องเด็ก สัตว์เลี้ยง และมาตรฐานความปลอดภัยของสารเคมี',
    iconName: 'Shield',
    colorClass: 'bg-rose-500',
    dependsOn: [],
    isApplicable: () => true,
    systemInstruction:
      'คุณคือเจ้าหน้าที่ความปลอดภัยของบริษัทกำจัดแมลง ตรวจสอบประเภทสถานที่และแมลงที่ต้องกำจัด ' +
      'ระบุข้อควรระวังสำหรับเด็ก สัตว์เลี้ยง อาหาร และระยะเวลาที่ควรหลีกเลี่ยงพื้นที่หลังฉีดพ่น ' +
      'อ้างอิงมาตรฐาน WHO อย่างสั้นๆ ตอบเป็นภาษาไทย Markdown แบบ bullet list',
    buildInput: (job) => jobSummary(job),
  },
  {
    id: 'quotation',
    name: 'Quotation',
    role: 'นักร่างใบเสนอราคา',
    description: 'ร่างใบเสนอราคาอย่างเป็นทางการ โดยอ้างอิงผลวินิจฉัยและข้อควรระวัง',
    iconName: 'FileText',
    colorClass: 'bg-emerald-500',
    dependsOn: ['diagnosis', 'safety'],
    isApplicable: () => true,
    systemInstruction:
      'คุณคือฝ่ายขายของบริษัทกำจัดแมลง ร่างใบเสนอราคาอย่างเป็นทางการเป็นภาษาไทย ' +
      'ประกอบด้วย: รายการบริการ, ราคา, เงื่อนไขการรับประกัน, และสรุปวิธีการที่จะใช้ (จากผลวินิจฉัยและข้อควรระวังที่ให้มา) ' +
      'ตอบเป็น Markdown จัดรูปแบบให้พร้อมส่งลูกค้า',
    buildInput: (job) => jobSummary(job),
  },
  {
    id: 'line-copy',
    name: 'LINE Copywriter',
    role: 'นักเขียนข้อความ LINE',
    description: 'เขียนข้อความแจ้งลูกค้าทาง LINE ให้เป็นกันเองและตรงประเด็น ตามสถานะงานปัจจุบัน',
    iconName: 'MessageSquare',
    colorClass: 'bg-teal-500',
    dependsOn: ['quotation'],
    isApplicable: () => true,
    systemInstruction:
      'คุณคือนักเขียนข้อความบริการลูกค้าทาง LINE OA ของบริษัทกำจัดแมลง เขียนข้อความสั้นกระชับ ' +
      'เป็นกันเอง สุภาพ ใช้อีโมจิพองาม ให้ตรงกับสถานะงานปัจจุบันของลูกค้า อ้างอิงใบเสนอราคาที่ให้มา ' +
      'ความยาวไม่เกิน 8 บรรทัด ตอบเป็นภาษาไทย',
    buildInput: (job) => jobSummary(job),
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    role: 'นักจัดตารางงาน',
    description: 'แนะนำช่วงเวลานัดหมายและการเตรียมความพร้อมก่อนเข้าให้บริการ',
    iconName: 'Calendar',
    colorClass: 'bg-purple-500',
    dependsOn: ['quotation'],
    isApplicable: (job) => job.status !== 'cancelled',
    systemInstruction:
      'คุณคือเจ้าหน้าที่จัดตารางงานของบริษัทกำจัดแมลง แนะนำช่วงเวลาที่เหมาะสมสำหรับเข้าให้บริการ ' +
      '(เช่น เลี่ยงเวลาอาหาร, ให้เวลาลูกค้าเตรียมพื้นที่) และสรุปสิ่งที่ลูกค้าควรเตรียมก่อนช่างมาถึง ' +
      'ตอบเป็นภาษาไทย Markdown แบบ bullet list สั้นๆ',
    buildInput: (job) => jobSummary(job),
  },
  {
    id: 'service-report',
    name: 'Service Report',
    role: 'นักสรุปรายงานบริการ',
    description: 'สรุปรายงานผลการเข้าให้บริการหลังงานเสร็จสิ้น สำหรับเก็บเป็นเอกสาร',
    iconName: 'FileCheck',
    colorClass: 'bg-indigo-500',
    dependsOn: ['diagnosis'],
    isApplicable: (job) => job.status === 'completed',
    systemInstruction:
      'คุณคือช่างเทคนิคที่สรุปรายงานบริการหลังเข้าปฏิบัติงาน เขียนรายงานสรุปเป็นภาษาไทยแบบทางการ ' +
      'ประกอบด้วย: วิธีการที่ใช้ (อ้างอิงผลวินิจฉัย), ผลลัพธ์ที่คาดว่าจะได้, และคำแนะนำหลังบริการสำหรับลูกค้า ' +
      'ตอบเป็น Markdown',
    buildInput: (job) => jobSummary(job),
  },
  {
    id: 'review',
    name: 'Review & Reputation',
    role: 'นักขอรีวิว',
    description: 'ร่างข้อความขอรีวิวจากลูกค้าอย่างสุภาพหลังงานเสร็จสิ้น',
    iconName: 'Star',
    colorClass: 'bg-yellow-500',
    dependsOn: [],
    isApplicable: (job) => job.status === 'completed',
    systemInstruction:
      'คุณคือฝ่ายลูกค้าสัมพันธ์ของบริษัทกำจัดแมลง เขียนข้อความขอบคุณลูกค้าและขอรีวิวหลังบริการเสร็จสิ้น ' +
      'สั้น สุภาพ ไม่กดดัน เป็นภาษาไทย ไม่เกิน 5 บรรทัด',
    buildInput: (job) => jobSummary(job),
  },
  {
    id: 'warranty',
    name: 'Warranty & Follow-up',
    role: 'นักติดตามลูกค้า',
    description: 'ร่างข้อความแจ้งเตือนการรับประกันหรือ follow-up ตามกำหนด',
    iconName: 'Bell',
    colorClass: 'bg-orange-500',
    dependsOn: [],
    isApplicable: (job) => !!job.followUpDate,
    systemInstruction:
      'คุณคือฝ่ายบริการหลังการขายของบริษัทกำจัดแมลง เขียนข้อความแจ้งเตือนลูกค้าเรื่องระยะเวลารับประกัน ' +
      'และเชิญชวนให้แจ้งกลับหากยังพบปัญหาแมลงอีก เป็นภาษาไทย เป็นกันเอง ไม่เกิน 6 บรรทัด',
    buildInput: (job) => jobSummary(job),
  },
  {
    id: 'upsell',
    name: 'Retention & Upsell',
    role: 'นักวิเคราะห์โอกาสขายเพิ่ม',
    description: 'แนะนำบริการเสริมหรือบริการตามฤดูกาลที่เหมาะกับลูกค้ารายนี้',
    iconName: 'TrendingUp',
    colorClass: 'bg-cyan-500',
    dependsOn: ['diagnosis'],
    isApplicable: () => true,
    systemInstruction:
      'คุณคือฝ่ายการตลาดของบริษัทกำจัดแมลง จากประเภทสถานที่และปัญหาที่พบ แนะนำบริการเสริมหรือ ' +
      'บริการป้องกันตามฤดูกาลที่น่าจะเป็นประโยชน์กับลูกค้ารายนี้ในอนาคต 2-3 ข้อ พร้อมเหตุผลสั้นๆ ' +
      'ตอบเป็นภาษาไทย Markdown bullet list',
    buildInput: (job) => jobSummary(job),
  },
];
