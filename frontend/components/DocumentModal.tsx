import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Job } from '../types';
import {
  COMPANY, INSECT_LABELS, PROPERTY_LABELS, TREATMENT_METHODS, CUSTOMER_PREP_LIST,
  QUOTATION_VALID_DAYS, PRICE_TABLE,
  calculatePrice, formatPrice, formatDate, formatDateLong, formatDateTime, addMonths, addDays,
} from '../constants';
import { Icon } from './Icons';

export type DocType = 'quotation' | 'warranty' | 'report';

interface Props {
  job: Job;
  type: DocType;
  onClose: () => void;
}

const DOC_TITLES: Record<DocType, string> = {
  quotation: 'ใบเสนอราคา',
  warranty: 'ใบรับประกันบริการ',
  report: 'รายงานการให้บริการ',
};

const DOC_PREFIX: Record<DocType, string> = {
  quotation: 'QT',
  warranty: 'WR',
  report: 'SR',
};

export function docNumber(type: DocType, job: Job): string {
  return `${DOC_PREFIX[type]}-${job.id.replace(/^JOB-/, '')}`;
}

function warrantyMonthsFor(job: Job): number {
  return job.warrantyMonths ?? Math.max(...job.insectTypes.map(t => PRICE_TABLE[t].warranty));
}

export const DocumentModal: React.FC<Props> = ({ job, type, onClose }) => {
  // Hide the app shell while printing so only the document sheet is on paper.
  useEffect(() => {
    document.body.classList.add('doc-open');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('doc-open');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const body = (
    <div className="doc-overlay fixed inset-0 z-50 bg-slate-900/60 overflow-y-auto" onClick={onClose}>
      {/* Toolbar (screen only) */}
      <div className="no-print sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-700">
            <Icon name="FileText" className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-sm">{DOC_TITLES[type]}</span>
            <span className="text-xs text-slate-400 font-mono">{docNumber(type, job)}</span>
          </div>
          <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm"
            >
              <Icon name="Download" className="w-4 h-4" />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              aria-label="ปิด"
            >
              <Icon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sheet */}
      <div className="py-6 px-4">
        <div
          className="doc-sheet max-w-3xl mx-auto bg-white text-slate-800 shadow-xl border border-slate-200 rounded-lg p-10 text-sm leading-relaxed"
          onClick={e => e.stopPropagation()}
        >
          <DocHeader type={type} job={job} />
          {type === 'quotation' && <QuotationBody job={job} />}
          {type === 'warranty' && <WarrantyBody job={job} />}
          {type === 'report' && <ReportBody job={job} />}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(body, document.body);
};

/* ---------- Shared pieces ---------- */

const DocHeader: React.FC<{ type: DocType; job: Job }> = ({ type, job }) => {
  const issued = type === 'quotation' ? job.createdAt : (job.completedDate ?? new Date().toISOString());
  return (
    <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-5 mb-6">
      <div className="flex items-start space-x-3">
        <div className="bg-emerald-600 rounded-xl p-2.5 shrink-0">
          <Icon name="Bug" className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="text-lg font-bold text-emerald-800 leading-tight">{COMPANY.name}</div>
          <div className="text-xs text-slate-500">{COMPANY.tagline}</div>
          <div className="text-xs text-slate-500 mt-1.5 space-y-0.5">
            <div>{COMPANY.address}</div>
            <div>โทร {COMPANY.phone} • มือถือ {COMPANY.mobile} • LINE {COMPANY.lineId}</div>
            <div>เลขประจำตัวผู้เสียภาษี {COMPANY.taxId}</div>
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-2xl font-black text-slate-800 tracking-tight">{DOC_TITLES[type]}</div>
        <div className="mt-2 text-xs text-slate-500 space-y-0.5">
          <div>เลขที่: <span className="font-mono font-semibold text-slate-700">{docNumber(type, job)}</span></div>
          <div>วันที่: <span className="font-semibold text-slate-700">{formatDate(issued)}</span></div>
          <div>อ้างอิงงาน: <span className="font-mono text-slate-700">{job.id}</span></div>
        </div>
      </div>
    </div>
  );
};

const CustomerBlock: React.FC<{ job: Job; title?: string }> = ({ job, title = 'ข้อมูลลูกค้า' }) => (
  <div className="grid grid-cols-2 gap-6 mb-6">
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="font-semibold text-base">{job.customerName}</div>
      <div className="text-slate-600 mt-0.5">{job.address}</div>
      <div className="text-slate-600 mt-0.5">
        โทร {job.customerPhone}
        {job.customerLineId && <> • LINE {job.customerLineId}</>}
      </div>
    </div>
    <div>
      <SectionTitle>สถานที่ให้บริการ</SectionTitle>
      <Row label="ประเภท" value={PROPERTY_LABELS[job.propertyType]} />
      <Row label="พื้นที่" value={`${job.areaM2} ตร.ม.`} />
      <Row label="ปัญหาที่พบ" value={job.insectTypes.map(t => INSECT_LABELS[t]).join(', ')} />
    </div>
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5">{children}</div>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex text-slate-700">
    <span className="w-24 shrink-0 text-slate-500">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const SignatureBlock: React.FC<{ left: string; right: string; leftName?: string; rightName?: string }> = ({ left, right, leftName, rightName }) => (
  <div className="grid grid-cols-2 gap-12 mt-12 pt-2">
    {[{ t: left, n: leftName }, { t: right, n: rightName }].map(({ t, n }) => (
      <div key={t} className="text-center">
        <div className="border-b border-slate-400 h-12 mb-2" />
        <div className="text-slate-700">( {n ?? ' '.repeat(30)} )</div>
        <div className="text-xs text-slate-500 mt-0.5">{t}</div>
        <div className="text-xs text-slate-400 mt-0.5">วันที่ ______ / ______ / ________</div>
      </div>
    ))}
  </div>
);

const Footer: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="mt-8 pt-3 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
    <span>{COMPANY.name} • {COMPANY.phone} • LINE {COMPANY.lineId}</span>
    <span>{children}</span>
  </div>
);

/* ---------- Quotation ---------- */

const QuotationBody: React.FC<{ job: Job }> = ({ job }) => {
  const breakdown = calculatePrice(job.insectTypes, job.propertyType, job.areaM2);
  const warranty = warrantyMonthsFor(job);
  const validUntil = addDays(job.createdAt, QUOTATION_VALID_DAYS);
  // If the estimate on the job was overridden, honour the stored figure.
  const total = job.estimatedPrice || breakdown.total;

  return (
    <>
      <CustomerBlock job={job} title="เรียน" />

      <SectionTitle>รายการบริการ</SectionTitle>
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-emerald-50 text-emerald-900">
            <th className="text-left px-3 py-2 border border-emerald-100 w-10">#</th>
            <th className="text-left px-3 py-2 border border-emerald-100">รายการ</th>
            <th className="text-left px-3 py-2 border border-emerald-100">รายละเอียด</th>
            <th className="text-right px-3 py-2 border border-emerald-100 w-32">ราคา (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.insectBreakdown.map((b, i) => (
            <tr key={b.type} className="align-top">
              <td className="px-3 py-2 border border-slate-200 text-slate-500">{i + 1}</td>
              <td className="px-3 py-2 border border-slate-200 font-medium">บริการกำจัด{b.label}</td>
              <td className="px-3 py-2 border border-slate-200 text-slate-600 text-xs">
                {TREATMENT_METHODS[b.type]}
                <div className="mt-1 text-slate-400">รับประกัน {PRICE_TABLE[b.type].warranty} เดือน</div>
              </td>
              <td className="px-3 py-2 border border-slate-200 text-right font-medium">{b.price.toLocaleString('th-TH')}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="px-3 py-2 border border-slate-200 text-right text-slate-500 text-xs">
              พื้นที่ {job.areaM2} ตร.ม. • {breakdown.propertyLabel} (ตัวคูณ ×{breakdown.propertyMultiplier})
            </td>
            <td className="px-3 py-2 border border-slate-200 text-right text-slate-500">{breakdown.subtotal.toLocaleString('th-TH')}</td>
          </tr>
          <tr className="bg-emerald-600 text-white">
            <td colSpan={3} className="px-3 py-2.5 border border-emerald-600 text-right font-bold">รวมทั้งสิ้น</td>
            <td className="px-3 py-2.5 border border-emerald-600 text-right font-black text-base">{formatPrice(total)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="grid grid-cols-2 gap-6 mb-2">
        <div>
          <SectionTitle>เงื่อนไข</SectionTitle>
          <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1">
            <li>ราคานี้รวมค่าแรงและค่าน้ำยาแล้ว ยังไม่รวมภาษีมูลค่าเพิ่ม (ถ้ามี)</li>
            <li>ใช้น้ำยาที่ได้มาตรฐาน WHO และขึ้นทะเบียนกับ อย. ปลอดภัยเมื่อแห้ง</li>
            <li>รับประกันผลงาน {warranty} เดือน หากพบแมลงซ้ำ กลับมาบริการฟรีในระยะประกัน</li>
            <li>ราคาอาจปรับเปลี่ยนหลังสำรวจหน้างานจริง หากพบความรุนแรงมากกว่าที่แจ้ง</li>
            <li>ชำระเงินหลังบริการเสร็จ ผ่านเงินสด โอนเงิน หรือพร้อมเพย์</li>
          </ul>
        </div>
        <div>
          <SectionTitle>การเตรียมพื้นที่</SectionTitle>
          <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1">
            {CUSTOMER_PREP_LIST.map(p => <li key={p}>{p}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-800">
        ใบเสนอราคานี้มีผลถึงวันที่ <span className="font-semibold">{formatDateLong(validUntil)}</span> ({QUOTATION_VALID_DAYS} วันนับจากวันที่ออกเอกสาร)
      </div>

      <SignatureBlock left="ผู้เสนอราคา" right="ผู้อนุมัติ / ลูกค้า" rightName={job.customerName} />
      <Footer>{job.notes ? `หมายเหตุ: ${job.notes}` : ''}</Footer>
    </>
  );
};

/* ---------- Warranty certificate ---------- */

const WarrantyBody: React.FC<{ job: Job }> = ({ job }) => {
  const warranty = warrantyMonthsFor(job);
  const start = job.completedDate ?? new Date().toISOString();
  const end = addMonths(start, warranty);

  return (
    <>
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full px-4 py-1.5 text-xs font-semibold">
          <Icon name="Shield" className="w-4 h-4" />
          <span>รับประกันผลงาน {warranty} เดือน</span>
        </div>
      </div>

      <CustomerBlock job={job} title="ออกให้แก่" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="วันที่ให้บริการ" value={formatDateLong(start)} />
        <Stat label="ระยะรับประกัน" value={`${warranty} เดือน`} />
        <Stat label="สิ้นสุดการรับประกัน" value={formatDateLong(end)} highlight />
      </div>

      <SectionTitle>บริการที่อยู่ในการรับประกัน</SectionTitle>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-emerald-50 text-emerald-900">
            <th className="text-left px-3 py-2 border border-emerald-100">บริการ</th>
            <th className="text-left px-3 py-2 border border-emerald-100 w-32">รับประกัน</th>
            <th className="text-left px-3 py-2 border border-emerald-100 w-40">ถึงวันที่</th>
          </tr>
        </thead>
        <tbody>
          {job.insectTypes.map(t => {
            const m = PRICE_TABLE[t].warranty;
            return (
              <tr key={t}>
                <td className="px-3 py-2 border border-slate-200 font-medium">กำจัด{INSECT_LABELS[t]}</td>
                <td className="px-3 py-2 border border-slate-200">{m} เดือน</td>
                <td className="px-3 py-2 border border-slate-200">{formatDate(addMonths(start, m))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <SectionTitle>เงื่อนไขการรับประกัน</SectionTitle>
      <ol className="list-decimal pl-5 text-slate-600 text-xs space-y-1 mb-2">
        <li>หากพบแมลงชนิดเดียวกับที่ให้บริการภายในระยะรับประกัน บริษัทจะเข้าบริการซ้ำโดยไม่คิดค่าใช้จ่าย</li>
        <li>ลูกค้าต้องแจ้งภายในระยะรับประกัน ผ่านโทรศัพท์ {COMPANY.phone} หรือ LINE {COMPANY.lineId} พร้อมระบุเลขที่ใบรับประกัน</li>
        <li>การรับประกันไม่ครอบคลุมกรณีมีการต่อเติม รื้อถอน น้ำท่วม หรือมีแมลงจากพื้นที่ข้างเคียงที่ไม่ได้รับบริการ</li>
        <li>การรับประกันไม่ครอบคลุมความเสียหายของทรัพย์สินที่เกิดขึ้นก่อนวันให้บริการ</li>
        <li>ใบรับประกันนี้ใช้ได้เฉพาะสถานที่ที่ระบุ ไม่สามารถโอนสิทธิ์ได้</li>
      </ol>

      <SignatureBlock left="ผู้มีอำนาจลงนาม" right="ช่างผู้ให้บริการ" rightName={job.technician} />
      <Footer>เลขที่ใบรับประกัน {docNumber('warranty', job)}</Footer>
    </>
  );
};

const Stat: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`rounded-lg border px-4 py-3 ${highlight ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-200'}`}>
    <div className={`text-xs ${highlight ? 'text-emerald-100' : 'text-slate-500'}`}>{label}</div>
    <div className="font-bold mt-0.5">{value}</div>
  </div>
);

/* ---------- Service report ---------- */

const ReportBody: React.FC<{ job: Job }> = ({ job }) => {
  const warranty = warrantyMonthsFor(job);
  const finalPrice = job.finalPrice ?? job.estimatedPrice;

  return (
    <>
      <CustomerBlock job={job} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="ช่างผู้ให้บริการ" value={job.technician ?? '-'} />
        <Stat label="วันเวลานัดหมาย" value={job.scheduledDate ? formatDateTime(job.scheduledDate) : '-'} />
        <Stat label="เสร็จสิ้นเมื่อ" value={job.completedDate ? formatDateTime(job.completedDate) : '-'} highlight />
      </div>

      <SectionTitle>ปัญหาที่ลูกค้าแจ้ง</SectionTitle>
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 mb-6">
        {job.problemDescription}
      </div>

      <SectionTitle>การดำเนินการ</SectionTitle>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-emerald-50 text-emerald-900">
            <th className="text-left px-3 py-2 border border-emerald-100 w-36">บริการ</th>
            <th className="text-left px-3 py-2 border border-emerald-100">วิธีดำเนินการ</th>
            <th className="text-center px-3 py-2 border border-emerald-100 w-20">ผล</th>
          </tr>
        </thead>
        <tbody>
          {job.insectTypes.map(t => (
            <tr key={t} className="align-top">
              <td className="px-3 py-2 border border-slate-200 font-medium">กำจัด{INSECT_LABELS[t]}</td>
              <td className="px-3 py-2 border border-slate-200 text-slate-600 text-xs">{TREATMENT_METHODS[t]}</td>
              <td className="px-3 py-2 border border-slate-200 text-center text-emerald-600">
                <Icon name="CheckCircle" className="w-4 h-4 inline" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-6 mb-2">
        <div>
          <SectionTitle>คำแนะนำหลังบริการ</SectionTitle>
          <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1">
            <li>เปิดระบายอากาศประมาณ 2-4 ชั่วโมง ก่อนกลับเข้าใช้พื้นที่</li>
            <li>งดเช็ดถูบริเวณที่ฉีดพ่นอย่างน้อย 3 วัน เพื่อให้น้ำยาออกฤทธิ์ตกค้าง</li>
            <li>อาจพบแมลงออกมาตายเพิ่มขึ้นใน 3-7 วันแรก ถือเป็นเรื่องปกติ</li>
            <li>เก็บขยะเศษอาหารให้มิดชิด และซ่อมจุดรั่วซึมเพื่อลดแหล่งอาศัยของแมลง</li>
          </ul>
        </div>
        <div>
          <SectionTitle>สรุปค่าบริการ</SectionTitle>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="flex justify-between px-4 py-2 text-slate-500 text-xs border-b border-slate-100">
              <span>ราคาประเมิน</span><span>{formatPrice(job.estimatedPrice)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5 bg-emerald-50 font-bold text-emerald-800">
              <span>ค่าบริการจริง</span><span>{formatPrice(finalPrice)}</span>
            </div>
            <div className="flex justify-between px-4 py-2 text-slate-500 text-xs border-t border-slate-100">
              <span>รับประกัน</span>
              <span>{warranty} เดือน{job.completedDate && <> (ถึง {formatDate(addMonths(job.completedDate, warranty))})</>}</span>
            </div>
          </div>
        </div>
      </div>

      {job.notes && (
        <div className="mt-4">
          <SectionTitle>หมายเหตุจากช่าง</SectionTitle>
          <div className="text-slate-700 text-xs">{job.notes}</div>
        </div>
      )}

      <SignatureBlock left="ช่างผู้ให้บริการ" right="ลูกค้าผู้รับบริการ" leftName={job.technician} rightName={job.customerName} />
      <Footer>เลขที่รายงาน {docNumber('report', job)}</Footer>
    </>
  );
};
