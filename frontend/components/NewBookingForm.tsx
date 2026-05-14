import React, { useState } from 'react';
import { Job, InsectType, PropertyType, ContactSource } from '../types';
import {
  INSECT_LABELS, INSECT_EMOJI, PROPERTY_LABELS, SOURCE_LABELS, SOURCE_EMOJI,
  ALL_INSECT_TYPES, ALL_PROPERTY_TYPES, ALL_SOURCES, TECHNICIANS,
  calculatePrice, formatPrice, generateId, PRICE_TABLE,
} from '../constants';
import { Icon } from './Icons';

interface Props {
  onSave: (job: Job) => void;
  onCancel: () => void;
}

interface FormState {
  insectTypes: InsectType[];
  propertyType: PropertyType;
  areaM2: string;
  address: string;
  problemDescription: string;
  customerName: string;
  customerPhone: string;
  customerLineId: string;
  source: ContactSource;
  scheduledDate: string;
  technician: string;
  notes: string;
}

const INITIAL: FormState = {
  insectTypes: [],
  propertyType: 'house',
  areaM2: '',
  address: '',
  problemDescription: '',
  customerName: '',
  customerPhone: '',
  customerLineId: '',
  source: 'line',
  scheduledDate: '',
  technician: '',
  notes: '',
};

const STEP_LABELS = ['ประเภทแมลง', 'สถานที่', 'รายละเอียด', 'ลูกค้า', 'สรุป'];

export const NewBookingForm: React.FC<Props> = ({ onSave, onCancel }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleInsect = (t: InsectType) => {
    setForm(prev => ({
      ...prev,
      insectTypes: prev.insectTypes.includes(t)
        ? prev.insectTypes.filter(x => x !== t)
        : [...prev.insectTypes, t],
    }));
  };

  const areaNum = parseFloat(form.areaM2) || 0;
  const breakdown = form.insectTypes.length > 0 && areaNum > 0
    ? calculatePrice(form.insectTypes, form.propertyType, areaNum)
    : null;

  const maxWarranty = form.insectTypes.length > 0
    ? Math.max(...form.insectTypes.map(t => PRICE_TABLE[t].warranty))
    : 3;

  const canNext = [
    form.insectTypes.length > 0,
    !!form.propertyType && !!form.areaM2 && areaNum > 0,
    !!form.address.trim() && !!form.problemDescription.trim(),
    !!form.customerName.trim() && !!form.customerPhone.trim(),
  ];

  const handleSave = () => {
    const job: Job = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerLineId: form.customerLineId.trim() || undefined,
      address: form.address.trim(),
      insectTypes: form.insectTypes,
      propertyType: form.propertyType,
      areaM2: areaNum,
      problemDescription: form.problemDescription.trim(),
      status: 'new',
      estimatedPrice: breakdown?.total ?? 0,
      scheduledDate: form.scheduledDate || undefined,
      technician: form.technician || undefined,
      notes: form.notes.trim() || undefined,
      source: form.source,
      warrantyMonths: maxWarranty,
    };
    onSave(job);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">บันทึกงานใหม่</h1>
        <p className="text-sm text-slate-500 mt-1">กรอกข้อมูลลูกค้าที่ติดต่อเข้ามา</p>
      </div>

      {/* Progress */}
      <div className="flex items-center space-x-2">
        {STEP_LABELS.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-emerald-600 text-white' :
                  i === step ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
                  'bg-slate-100 text-slate-400'
                }`}
              >
                {i < step ? <Icon name="Check" className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${i === step ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-1 rounded ${i < step ? 'bg-emerald-500' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">

        {/* Step 0: Insect types */}
        {step === 0 && (
          <>
            <h2 className="font-semibold text-slate-700 text-lg">ต้องการกำจัดแมลงอะไร?</h2>
            <p className="text-sm text-slate-500">เลือกได้มากกว่า 1 ประเภท</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ALL_INSECT_TYPES.map(t => {
                const selected = form.insectTypes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleInsect(t)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span className="text-3xl mb-1">{INSECT_EMOJI[t]}</span>
                    <span className="text-sm font-medium">{INSECT_LABELS[t]}</span>
                    {selected && (
                      <span className="mt-1">
                        <Icon name="CheckCircle" className="w-4 h-4 text-emerald-500" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Step 1: Property */}
        {step === 1 && (
          <>
            <h2 className="font-semibold text-slate-700 text-lg">ประเภทสถานที่และขนาดพื้นที่</h2>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">ประเภทสถานที่</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_PROPERTY_TYPES.map(pt => (
                  <button
                    key={pt}
                    onClick={() => setField('propertyType', pt)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.propertyType === pt
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {PROPERTY_LABELS[pt]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                พื้นที่โดยประมาณ (ตร.ม.)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  placeholder="เช่น 120"
                  value={form.areaM2}
                  onChange={e => setField('areaM2', e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  min="1"
                />
                <span className="text-slate-500 text-sm font-medium">ตร.ม.</span>
              </div>
              {areaNum > 0 && form.insectTypes.length > 0 && breakdown && (
                <div className="mt-3 bg-emerald-50 rounded-xl px-4 py-3 text-sm">
                  <div className="text-emerald-700 font-semibold">
                    ราคาประมาณ: {formatPrice(breakdown.total)}
                  </div>
                  <div className="text-emerald-600 text-xs mt-0.5">
                    รวม {form.insectTypes.length} ประเภทแมลง • พื้นที่ {areaNum} ตร.ม.
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Step 2: Description + Address */}
        {step === 2 && (
          <>
            <h2 className="font-semibold text-slate-700 text-lg">รายละเอียดปัญหาและที่อยู่</h2>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">รายละเอียดปัญหา</label>
              <textarea
                rows={3}
                placeholder="เช่น พบแมลงสาบในห้องครัวและห้องน้ำ มีมดขึ้นโต๊ะอาหาร..."
                value={form.problemDescription}
                onChange={e => setField('problemDescription', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">ที่อยู่</label>
              <textarea
                rows={2}
                placeholder="เช่น 12/3 ถ.รามคำแหง ซ.21 แขวงหัวหมาก บางกะปิ กทม."
                value={form.address}
                onChange={e => setField('address', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </>
        )}

        {/* Step 3: Customer */}
        {step === 3 && (
          <>
            <h2 className="font-semibold text-slate-700 text-lg">ข้อมูลลูกค้า</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">ชื่อลูกค้า *</label>
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล หรือชื่อร้าน"
                  value={form.customerName}
                  onChange={e => setField('customerName', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">เบอร์โทรศัพท์ *</label>
                <input
                  type="tel"
                  placeholder="08x-xxx-xxxx"
                  value={form.customerPhone}
                  onChange={e => setField('customerPhone', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">LINE ID</label>
                <input
                  type="text"
                  placeholder="@lineid (ถ้ามี)"
                  value={form.customerLineId}
                  onChange={e => setField('customerLineId', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">ช่องทางที่ติดต่อ</label>
                <select
                  value={form.source}
                  onChange={e => setField('source', e.target.value as ContactSource)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {ALL_SOURCES.map(s => (
                    <option key={s} value={s}>{SOURCE_EMOJI[s]} {SOURCE_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">วันนัดหมาย (ถ้ามี)</label>
                <input
                  type="datetime-local"
                  value={form.scheduledDate}
                  onChange={e => setField('scheduledDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">ช่างที่รับผิดชอบ</label>
                <select
                  value={form.technician}
                  onChange={e => setField('technician', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- ยังไม่กำหนด --</option>
                  {TECHNICIANS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">หมายเหตุ</label>
              <textarea
                rows={2}
                placeholder="บันทึกเพิ่มเติม..."
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <>
            <h2 className="font-semibold text-slate-700 text-lg">สรุปรายละเอียดงาน</h2>
            <div className="space-y-4">
              {/* Customer */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <Icon name="User" className="w-4 h-4 text-slate-500" />
                  <span>ข้อมูลลูกค้า</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><span className="text-slate-400">ชื่อ:</span> {form.customerName}</div>
                  <div><span className="text-slate-400">เบอร์:</span> {form.customerPhone}</div>
                  {form.customerLineId && <div><span className="text-slate-400">LINE:</span> {form.customerLineId}</div>}
                  <div><span className="text-slate-400">ช่องทาง:</span> {SOURCE_EMOJI[form.source]} {SOURCE_LABELS[form.source]}</div>
                </div>
              </div>

              {/* Job */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <Icon name="Bug" className="w-4 h-4 text-slate-500" />
                  <span>รายละเอียดงาน</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div>
                    <span className="text-slate-400">แมลง:</span>{' '}
                    {form.insectTypes.map(t => `${INSECT_EMOJI[t]} ${INSECT_LABELS[t]}`).join(', ')}
                  </div>
                  <div><span className="text-slate-400">สถานที่:</span> {PROPERTY_LABELS[form.propertyType]} • {areaNum} ตร.ม.</div>
                  <div><span className="text-slate-400">ที่อยู่:</span> {form.address}</div>
                  <div><span className="text-slate-400">ปัญหา:</span> {form.problemDescription}</div>
                  {form.scheduledDate && <div><span className="text-slate-400">นัด:</span> {new Date(form.scheduledDate).toLocaleString('th-TH')}</div>}
                  {form.technician && <div><span className="text-slate-400">ช่าง:</span> {form.technician}</div>}
                </div>
              </div>

              {/* Price */}
              {breakdown && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="font-semibold text-emerald-800 mb-3 flex items-center space-x-2">
                    <Icon name="Banknote" className="w-4 h-4" />
                    <span>ราคาประมาณการ</span>
                  </div>
                  <div className="space-y-1.5 text-sm text-emerald-700">
                    {breakdown.insectBreakdown.map(b => (
                      <div key={b.type} className="flex justify-between">
                        <span>{INSECT_EMOJI[b.type]} {b.label}</span>
                        <span className="font-medium">{formatPrice(b.price)}</span>
                      </div>
                    ))}
                    <div className="border-t border-emerald-300 mt-2 pt-2 flex justify-between font-bold text-emerald-900 text-base">
                      <span>รวมทั้งสิ้น</span>
                      <span>{formatPrice(breakdown.total)}</span>
                    </div>
                    <div className="text-xs text-emerald-600 mt-1">
                      รับประกัน {maxWarranty} เดือน • สถานที่: {PROPERTY_LABELS[form.propertyType]}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}
          className="flex items-center space-x-2 px-5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-medium transition-colors"
        >
          <Icon name="ChevronLeft" className="w-4 h-4" />
          <span>{step === 0 ? 'ยกเลิก' : 'ย้อนกลับ'}</span>
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext[step]}
            className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-semibold shadow transition-all"
          >
            <span>ถัดไป</span>
            <Icon name="ChevronRight" className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow transition-all"
          >
            <Icon name="Check" className="w-4 h-4" />
            <span>บันทึกงาน</span>
          </button>
        )}
      </div>
    </div>
  );
};
