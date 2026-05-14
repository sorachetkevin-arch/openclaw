import React, { useState } from 'react';
import { Job, JobStatus } from '../types';
import {
  STATUS_LABELS, STATUS_FLOW, INSECT_LABELS, INSECT_EMOJI, PROPERTY_LABELS,
  SOURCE_LABELS, SOURCE_EMOJI, TECHNICIANS, ALL_STATUSES,
  formatPrice, formatDate, formatDateTime, calculatePrice, PRICE_TABLE,
} from '../constants';
import { StatusBadge } from './StatusBadge';
import { Icon } from './Icons';
import { LinePanel } from './LinePanel';

interface Props {
  job: Job;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<Job>) => void;
  onDelete: (id: string) => void;
}

const NEXT_STATUS: Record<JobStatus, JobStatus | null> = {
  new: 'quoted',
  quoted: 'confirmed',
  confirmed: 'scheduled',
  scheduled: 'completed',
  completed: null,
  cancelled: null,
};

const NEXT_LABEL: Record<JobStatus, string> = {
  new: 'ส่งใบเสนอราคา',
  quoted: 'ยืนยันงาน',
  confirmed: 'นัดหมายแล้ว',
  scheduled: 'เสร็จสิ้น',
  completed: '',
  cancelled: '',
};

export const JobDetail: React.FC<Props> = ({ job, onBack, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Job>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const setEdit = <K extends keyof Job>(key: K, value: Job[K]) =>
    setEditData(prev => ({ ...prev, [key]: value }));

  const handleSaveEdit = () => {
    onUpdate(job.id, editData);
    setEditing(false);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditData({});
  };

  const handleAdvanceStatus = () => {
    const next = NEXT_STATUS[job.status];
    if (!next) return;
    const updates: Partial<Job> = { status: next };
    if (next === 'completed') {
      updates.completedDate = new Date().toISOString();
      const maxWarranty = Math.max(...job.insectTypes.map(t => PRICE_TABLE[t].warranty));
      updates.warrantyMonths = maxWarranty;
      const followUp = new Date();
      followUp.setMonth(followUp.getMonth() + maxWarranty - 1);
      updates.followUpDate = followUp.toISOString().slice(0, 10);
    }
    onUpdate(job.id, updates);
  };

  const breakdown = calculatePrice(job.insectTypes, job.propertyType, job.areaM2);
  const nextStatus = NEXT_STATUS[job.status];
  const currentField = (key: keyof Job) => (key in editData ? editData[key] : job[key]) as any;

  const statusIndex = STATUS_FLOW.indexOf(job.status);

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{job.customerName}</h1>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{job.id}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
            >
              <Icon name="Edit2" className="w-4 h-4" />
              <span>แก้ไข</span>
            </button>
          )}
          {editing && (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
              >
                บันทึก
              </button>
            </>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Icon name="Trash2" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="text-sm text-red-700 font-medium">ยืนยันการลบงานนี้?</div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-100"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => { onDelete(job.id); onBack(); }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
            >
              ลบงาน
            </button>
          </div>
        </div>
      )}

      {/* Status timeline */}
      {job.status !== 'cancelled' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">สถานะงาน</h2>
            <StatusBadge status={job.status} />
          </div>
          <div className="flex items-center space-x-1">
            {STATUS_FLOW.map((s, i) => {
              const done = i <= statusIndex;
              const current = i === statusIndex;
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      done ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                    } ${current ? 'ring-4 ring-emerald-100' : ''}`}>
                      {done && !current ? <Icon name="Check" className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span className={`text-xs mt-1 hidden sm:block text-center leading-tight ${done ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                      {STATUS_LABELS[s].replace('แล้ว', '').replace('สิ้น', '')}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-1 rounded ${i < statusIndex ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {nextStatus && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">ขั้นตอนถัดไป: <span className="font-medium text-slate-700">{STATUS_LABELS[nextStatus]}</span></div>
              <button
                onClick={handleAdvanceStatus}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow transition-colors"
              >
                <Icon name="ArrowRight" className="w-4 h-4" />
                <span>{NEXT_LABEL[job.status]}</span>
              </button>
            </div>
          )}
          {job.status !== 'cancelled' && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <button
                onClick={() => onUpdate(job.id, { status: 'cancelled' })}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                ยกเลิกงานนี้
              </button>
            </div>
          )}
        </div>
      )}

      {job.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
          <Icon name="X" className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <div className="font-semibold text-red-700">งานถูกยกเลิก</div>
            {job.notes && <div className="text-sm text-red-600 mt-0.5">{job.notes}</div>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Customer info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center space-x-2">
              <Icon name="User" className="w-4 h-4 text-emerald-600" />
              <span>ข้อมูลลูกค้า</span>
            </h2>
            <div className="space-y-3 text-sm">
              <InfoRow label="ชื่อ" value={job.customerName} />
              <InfoRow label="เบอร์" value={
                <a href={`tel:${job.customerPhone}`} className="text-blue-600 hover:underline">
                  {job.customerPhone}
                </a>
              } />
              {job.customerLineId && <InfoRow label="LINE" value={job.customerLineId} />}
              <InfoRow
                label="ช่องทาง"
                value={`${SOURCE_EMOJI[job.source]} ${SOURCE_LABELS[job.source]}`}
              />
              <InfoRow label="วันที่แจ้ง" value={formatDateTime(job.createdAt)} />
            </div>
          </div>

          {/* Problem */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center space-x-2">
              <Icon name="Bug" className="w-4 h-4 text-emerald-600" />
              <span>รายละเอียดปัญหา</span>
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-slate-500 mb-1">ประเภทแมลง</div>
                <div className="flex flex-wrap gap-2">
                  {job.insectTypes.map(t => (
                    <span key={t} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                      {INSECT_EMOJI[t]} {INSECT_LABELS[t]}
                    </span>
                  ))}
                </div>
              </div>
              <InfoRow label="สถานที่" value={`${PROPERTY_LABELS[job.propertyType]} • ${job.areaM2} ตร.ม.`} />
              <div>
                <div className="text-slate-500 mb-1">ที่อยู่</div>
                <div className="text-slate-700 flex items-start space-x-1.5">
                  <Icon name="MapPin" className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>{job.address}</span>
                </div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">รายละเอียด</div>
                <div className="text-slate-700 bg-slate-50 rounded-lg p-3">{job.problemDescription}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Job info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center space-x-2">
              <Icon name="Calendar" className="w-4 h-4 text-emerald-600" />
              <span>ข้อมูลงาน</span>
            </h2>
            <div className="space-y-3 text-sm">
              {editing ? (
                <>
                  <div>
                    <label className="block text-slate-500 mb-1">สถานะ</label>
                    <select
                      value={currentField('status')}
                      onChange={e => setEdit('status', e.target.value as JobStatus)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">วันนัดหมาย</label>
                    <input
                      type="datetime-local"
                      value={currentField('scheduledDate')?.slice(0, 16) ?? ''}
                      onChange={e => setEdit('scheduledDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">ช่างผู้รับผิดชอบ</label>
                    <select
                      value={currentField('technician') ?? ''}
                      onChange={e => setEdit('technician', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                    >
                      <option value="">-- ยังไม่กำหนด --</option>
                      {TECHNICIANS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">ราคาสุดท้าย (บ.)</label>
                    <input
                      type="number"
                      value={currentField('finalPrice') ?? ''}
                      onChange={e => setEdit('finalPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder={String(job.estimatedPrice)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <InfoRow label="วันนัดหมาย" value={job.scheduledDate ? formatDateTime(job.scheduledDate) : '-'} />
                  <InfoRow label="วันที่เสร็จ" value={job.completedDate ? formatDate(job.completedDate) : '-'} />
                  <InfoRow label="ช่าง" value={job.technician ?? '-'} />
                  {job.warrantyMonths && <InfoRow label="รับประกัน" value={`${job.warrantyMonths} เดือน`} />}
                  {job.followUpDate && <InfoRow label="Follow-up" value={formatDate(job.followUpDate)} highlight />}
                </>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center space-x-2">
              <Icon name="Banknote" className="w-4 h-4 text-emerald-600" />
              <span>ราคา</span>
            </h2>
            <div className="space-y-2 text-sm">
              {breakdown.insectBreakdown.map(b => (
                <div key={b.type} className="flex justify-between text-slate-600">
                  <span>{INSECT_EMOJI[b.type]} {b.label}</span>
                  <span>{formatPrice(b.price)}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>ราคาประมาณ</span>
                  <span>{formatPrice(job.estimatedPrice)}</span>
                </div>
                {job.finalPrice && (
                  <div className="flex justify-between font-bold text-emerald-700 text-base">
                    <span>ราคาจริง</span>
                    <span>{formatPrice(job.finalPrice)}</span>
                  </div>
                )}
                {!job.finalPrice && (
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>ราคาประมาณ</span>
                    <span className="text-emerald-700">{formatPrice(job.estimatedPrice)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-4 flex items-center space-x-2">
              <Icon name="FileText" className="w-4 h-4 text-emerald-600" />
              <span>เอกสาร</span>
            </h2>
            <div className="space-y-2">
              <DocButton
                icon="FileText"
                label="ใบเสนอราคา"
                sub={formatPrice(job.estimatedPrice)}
                color="blue"
              />
              {job.status === 'completed' && (
                <DocButton
                  icon="Shield"
                  label="ใบรับประกัน"
                  sub={`${job.warrantyMonths} เดือน`}
                  color="emerald"
                />
              )}
              {job.status === 'completed' && (
                <DocButton
                  icon="FileCheck"
                  label="รายงานบริการ"
                  sub={formatDate(job.completedDate)}
                  color="purple"
                />
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-3 flex items-center space-x-2">
              <Icon name="MessageSquare" className="w-4 h-4 text-emerald-600" />
              <span>หมายเหตุ</span>
            </h2>
            {editing ? (
              <textarea
                rows={3}
                value={currentField('notes') ?? ''}
                onChange={e => setEdit('notes', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="บันทึกเพิ่มเติม..."
              />
            ) : (
              <p className="text-sm text-slate-600">{job.notes || <span className="text-slate-300 italic">ไม่มีหมายเหตุ</span>}</p>
            )}
          </div>
        </div>
      </div>

      {/* LINE Integration */}
      <LinePanel job={job} />
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex items-start justify-between">
    <span className="text-slate-500 shrink-0 mr-4">{label}</span>
    <span className={`text-right font-medium ${highlight ? 'text-amber-600' : 'text-slate-700'}`}>{value}</span>
  </div>
);

interface DocButtonProps {
  icon: string;
  label: string;
  sub: string;
  color: 'blue' | 'emerald' | 'purple';
}

const COLOR_MAP = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100',
};

const DocButton: React.FC<DocButtonProps> = ({ icon, label, sub, color }) => (
  <button
    onClick={() => alert(`กำลังสร้าง ${label}... (ฟีเจอร์นี้เชื่อม PDF generator)`)}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${COLOR_MAP[color]}`}
  >
    <div className="flex items-center space-x-3">
      <Icon name={icon} className="w-4 h-4" />
      <div className="text-left">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs opacity-70">{sub}</div>
      </div>
    </div>
    <Icon name="Download" className="w-4 h-4 opacity-60" />
  </button>
);
