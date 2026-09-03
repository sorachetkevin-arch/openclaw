import { InsectType, PropertyType, JobStatus, ContactSource, PriceBreakdown } from './types';

export const INSECT_LABELS: Record<InsectType, string> = {
  cockroach: 'แมลงสาบ',
  termite: 'ปลวก',
  rat: 'หนู',
  mosquito: 'ยุง',
  ant: 'มด',
  bedbugs: 'เรือด/ไรฝุ่น',
  fly: 'แมลงวัน',
  other: 'อื่นๆ',
};

export const INSECT_EMOJI: Record<InsectType, string> = {
  cockroach: '🪳',
  termite: '🐜',
  rat: '🐭',
  mosquito: '🦟',
  ant: '🐝',
  bedbugs: '🛏️',
  fly: '🪰',
  other: '🐛',
};

export const PROPERTY_LABELS: Record<PropertyType, string> = {
  house: 'บ้านเดี่ยว',
  townhouse: 'ทาวน์โฮม/บ้านแฝด',
  condo: 'คอนโด/อพาร์ตเมนต์',
  office: 'สำนักงาน/อาคาร',
  restaurant: 'ร้านอาหาร/ครัว',
  factory: 'โรงงาน/โกดัง',
};

export const STATUS_LABELS: Record<JobStatus, string> = {
  new: 'ลูกค้าใหม่',
  quoted: 'ส่งใบเสนอราคาแล้ว',
  confirmed: 'ยืนยันงานแล้ว',
  scheduled: 'นัดหมายแล้ว',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
};

export const STATUS_COLORS: Record<JobStatus, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  quoted: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  scheduled: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export const SOURCE_LABELS: Record<ContactSource, string> = {
  line: 'LINE OA',
  facebook: 'Facebook',
  phone: 'โทรศัพท์',
  'walk-in': 'เดินเข้ามา',
  referral: 'แนะนำต่อ',
};

export const SOURCE_EMOJI: Record<ContactSource, string> = {
  line: '💬',
  facebook: '📘',
  phone: '📞',
  'walk-in': '🚶',
  referral: '🤝',
};

// Base price + per-m2 cost + warranty months
export const PRICE_TABLE: Record<InsectType, { base: number; perM2: number; maxExtra: number; warranty: number }> = {
  cockroach: { base: 800,  perM2: 4,  maxExtra: 2200,  warranty: 3  },
  termite:   { base: 3500, perM2: 18, maxExtra: 16500, warranty: 12 },
  rat:       { base: 1500, perM2: 7,  maxExtra: 4500,  warranty: 3  },
  mosquito:  { base: 500,  perM2: 3,  maxExtra: 1500,  warranty: 1  },
  ant:       { base: 600,  perM2: 3,  maxExtra: 1400,  warranty: 2  },
  bedbugs:   { base: 2500, perM2: 12, maxExtra: 7500,  warranty: 3  },
  fly:       { base: 700,  perM2: 4,  maxExtra: 1800,  warranty: 1  },
  other:     { base: 1000, perM2: 5,  maxExtra: 3000,  warranty: 2  },
};

export const PROPERTY_MULTIPLIER: Record<PropertyType, number> = {
  house:      1.0,
  townhouse:  0.95,
  condo:      0.85,
  office:     1.3,
  restaurant: 1.4,
  factory:    1.5,
};

export const TECHNICIANS = ['สมชาย ใจดี', 'วิชัย แข็งแรง', 'ประสิทธิ์ ทำงาน', 'กิตติ รวดเร็ว'];

// Company profile printed on quotations, warranty certificates and service reports.
export const COMPANY = {
  name: 'บริษัท กำจัดแมลง เซอร์วิส จำกัด',
  tagline: 'บริการกำจัดแมลงและสัตว์รบกวน ครบวงจร',
  address: '99/9 ถ.ลาดพร้าว แขวงจันทรเกษม เขตจตุจักร กรุงเทพฯ 10900',
  phone: '02-000-0000',
  mobile: '08x-xxx-xxxx',
  lineId: '@pestcontrol',
  taxId: '0-0000-00000-00-0',
};

// Standard treatment description per pest, used in service reports.
export const TREATMENT_METHODS: Record<InsectType, string> = {
  cockroach: 'ฉีดพ่นน้ำยาตกค้าง (Residual Spray) บริเวณครัว ห้องน้ำ ท่อระบายน้ำ และวางเจลเหยื่อตามจุดซ่อนตัว',
  termite:   'อัดน้ำยาลงดินรอบแนวฐานราก เจาะพื้นอัดน้ำยาใต้อาคาร และฉีดพ่นโครงสร้างไม้ที่พบร่องรอย',
  rat:       'วางกล่องเหยื่อและกับดักตามแนวทางเดินของหนู อุดช่องทางเข้า และตรวจสอบจุดที่พบมูล/รอยกัด',
  mosquito:  'พ่นหมอกควัน (Fogging) บริเวณรอบอาคารและสวน ร่วมกับใส่ทรายอะเบทในแหล่งน้ำขัง',
  ant:       'ฉีดพ่นน้ำยาตามแนวทางเดินมด วางเจลเหยื่อจุดที่พบมด และพ่นรอบขอบอาคาร',
  bedbugs:   'พ่นน้ำยาบนที่นอน ขอบเตียง ตู้เสื้อผ้า และซอกมุมห้อง ร่วมกับใช้ความร้อนกำจัดไข่',
  fly:       'พ่นน้ำยาบริเวณจุดทิ้งขยะและครัว ติดตั้งกับดักแมลงวัน และพ่นหมอกควันพื้นที่โดยรอบ',
  other:     'สำรวจหน้างานและใช้วิธีกำจัดที่เหมาะสมกับชนิดแมลงที่พบ',
};

export const CUSTOMER_PREP_LIST = [
  'เก็บอาหาร ภาชนะ และของใช้ในครัวให้มิดชิด',
  'ย้ายเด็กเล็ก สัตว์เลี้ยง และปลูกไม้ประดับออกจากพื้นที่ฉีดพ่น',
  'เปิดประตู-หน้าต่างระบายอากาศประมาณ 2-4 ชั่วโมงหลังฉีดพ่น',
  'งดเช็ดถูพื้นและผนังบริเวณที่ฉีดพ่นอย่างน้อย 3 วัน',
];

export const QUOTATION_VALID_DAYS = 7;

export const ALL_INSECT_TYPES: InsectType[] = ['cockroach', 'termite', 'rat', 'mosquito', 'ant', 'bedbugs', 'fly', 'other'];
export const ALL_PROPERTY_TYPES: PropertyType[] = ['house', 'townhouse', 'condo', 'office', 'restaurant', 'factory'];
export const ALL_STATUSES: JobStatus[] = ['new', 'quoted', 'confirmed', 'scheduled', 'completed', 'cancelled'];
export const ALL_SOURCES: ContactSource[] = ['line', 'facebook', 'phone', 'walk-in', 'referral'];

export const STATUS_FLOW: JobStatus[] = ['new', 'quoted', 'confirmed', 'scheduled', 'completed'];

export function calculatePrice(
  insectTypes: InsectType[],
  propertyType: PropertyType,
  areaM2: number
): PriceBreakdown {
  const multiplier = PROPERTY_MULTIPLIER[propertyType];

  const insectBreakdown = insectTypes.map((type) => {
    const p = PRICE_TABLE[type];
    const extra = Math.min(areaM2 * p.perM2, p.maxExtra);
    const price = Math.round((p.base + extra) * multiplier / 100) * 100;
    return { type, label: INSECT_LABELS[type], price };
  });

  const subtotal = insectBreakdown.reduce((s, b) => s + b.price, 0);
  const total = subtotal;

  return {
    insectBreakdown,
    subtotal,
    propertyLabel: PROPERTY_LABELS[propertyType],
    propertyMultiplier: multiplier,
    total,
  };
}

export function formatPrice(price: number): string {
  return price.toLocaleString('th-TH') + ' บ.';
}

export function formatDate(iso?: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatDateLong(iso?: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function generateId(): string {
  const now = Date.now();
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `JOB-${now.toString().slice(-6)}${rand}`;
}

export const FAQ = [
  { q: 'ฉีดแล้วอยู่ได้นานไหม?', a: 'ทั่วไป 3 เดือน ปลวก 1 ปี ขึ้นอยู่กับสภาพแวดล้อม' },
  { q: 'อันตรายกับเด็กและสัตว์เลี้ยงไหม?', a: 'ยาได้มาตรฐาน WHO ปลอดภัยเมื่อแห้งแล้ว ประมาณ 2-4 ชม.' },
  { q: 'ใช้เวลากี่ชั่วโมง?', a: 'บ้านเดี่ยว 1-3 ชม. ขึ้นกับขนาดพื้นที่' },
  { q: 'ต้องเตรียมบ้านยังไง?', a: 'เก็บอาหาร/จาน ย้ายสัตว์เลี้ยง เปิดประตูหน้าต่างรอ' },
  { q: 'มีใบรับประกันไหม?', a: 'รับประกัน 3 เดือน ฟรีกลับมาฉีดซ้ำ (ปลวก 1 ปี)' },
  { q: 'ชำระเงินด้วยอะไรได้บ้าง?', a: 'โอนเงิน พร้อมเพย์ เงินสด' },
];
