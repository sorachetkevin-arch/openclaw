import React from 'react';
import { Job, View } from '../types';
import {
  STATUS_LABELS, STATUS_COLORS, INSECT_LABELS, INSECT_EMOJI,
  SOURCE_LABELS, SOURCE_EMOJI, formatPrice, formatDate,
} from '../constants';
import { StatusBadge } from './StatusBadge';
import { Icon } from './Icons';

interface Props {
  jobs: Job[];
  onNavigate: (view: View, jobId?: string) => void;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  iconBg: string;
  iconColor: string;
  sub?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, iconBg, iconColor, sub, onClick }) => (
  <div
    className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start space-x-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className={`${iconBg} rounded-xl p-3 shrink-0`}>
      <Icon name={icon} className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm font-medium text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  </div>
);

export const Dashboard: React.FC<Props> = ({ jobs, onNavigate }) => {
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const newToday = jobs.filter(j => j.status === 'new' && new Date(j.createdAt).toDateString() === today).length;
  const totalNew = jobs.filter(j => j.status === 'new').length;
  const waitingConfirm = jobs.filter(j => j.status === 'quoted').length;
  const scheduled = jobs.filter(j => j.status === 'scheduled' || j.status === 'confirmed').length;
  const completedMonth = jobs.filter(j => {
    if (j.status !== 'completed') return false;
    const d = new Date(j.completedDate || j.createdAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const revenueMonth = jobs
    .filter(j => {
      if (j.status !== 'completed') return false;
      const d = new Date(j.completedDate || j.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, j) => sum + (j.finalPrice || j.estimatedPrice), 0);

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const followUpSoon = jobs.filter(j => {
    if (!j.followUpDate) return false;
    const diff = new Date(j.followUpDate).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">แดชบอร์ด</h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => onNavigate('new-booking')}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow transition-colors"
        >
          <Icon name="Plus" className="w-4 h-4" />
          <span>นัดงานใหม่</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="ลูกค้าใหม่วันนี้"
          value={newToday}
          icon="Bell"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          sub={`ทั้งหมด ${totalNew} รายรอดำเนินการ`}
          onClick={() => onNavigate('jobs')}
        />
        <StatCard
          label="รอยืนยัน"
          value={waitingConfirm}
          icon="Clock"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          sub="ส่งใบเสนอราคาแล้ว"
          onClick={() => onNavigate('jobs')}
        />
        <StatCard
          label="นัดหมาย/ยืนยันแล้ว"
          value={scheduled}
          icon="Calendar"
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          sub="รอลงพื้นที่"
          onClick={() => onNavigate('jobs')}
        />
        <StatCard
          label="เสร็จสิ้นเดือนนี้"
          value={completedMonth}
          icon="TrendingUp"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          sub={`รายได้ ${formatPrice(revenueMonth)}`}
        />
      </div>

      {/* Follow-up Alert */}
      {followUpSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Bell" className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-amber-800 text-sm">แจ้งเตือน Follow-up</div>
              <div className="text-amber-700 text-sm mt-1">
                มี {followUpSoon.length} งานที่ใกล้ถึงกำหนด follow-up:
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {followUpSoon.map(j => (
                  <button
                    key={j.id}
                    onClick={() => onNavigate('job-detail', j.id)}
                    className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded-full transition-colors"
                  >
                    {j.customerName} ({formatDate(j.followUpDate)})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center space-x-2">
            <Icon name="ClipboardList" className="w-5 h-5 text-emerald-600" />
            <span>งานล่าสุด</span>
          </h2>
          <button
            onClick={() => onNavigate('jobs')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
          >
            <span>ดูทั้งหมด</span>
            <Icon name="ChevronRight" className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {recentJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center px-6 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => onNavigate('job-detail', job.id)}
            >
              {/* Insect icons */}
              <div className="w-10 text-xl shrink-0">
                {INSECT_EMOJI[job.insectTypes[0]]}
                {job.insectTypes.length > 1 && (
                  <span className="text-xs text-slate-400 ml-0.5">+{job.insectTypes.length - 1}</span>
                )}
              </div>

              {/* Customer info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 text-sm truncate">{job.customerName}</div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                  <span>{SOURCE_EMOJI[job.source]} {SOURCE_LABELS[job.source]}</span>
                  <span>•</span>
                  <span>{formatDate(job.createdAt)}</span>
                </div>
              </div>

              {/* Insect types */}
              <div className="hidden md:flex items-center space-x-1 mx-4">
                {job.insectTypes.map(t => (
                  <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {INSECT_LABELS[t]}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="text-sm font-semibold text-emerald-700 mr-4 shrink-0">
                {formatPrice(job.finalPrice || job.estimatedPrice)}
              </div>

              {/* Status */}
              <StatusBadge status={job.status} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('new-booking')}
          className="flex items-center space-x-4 bg-white border-2 border-dashed border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-2xl p-5 text-left transition-colors"
        >
          <div className="bg-emerald-100 rounded-xl p-3">
            <Icon name="Plus" className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-700">บันทึกงานใหม่</div>
            <div className="text-sm text-slate-400">ลูกค้าทัก LINE / โทรเข้า</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('calculator')}
          className="flex items-center space-x-4 bg-white border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-2xl p-5 text-left transition-colors"
        >
          <div className="bg-blue-100 rounded-xl p-3">
            <Icon name="Calculator" className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-700">คำนวณราคา</div>
            <div className="text-sm text-slate-400">ประเมินราคาเบื้องต้น</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('jobs')}
          className="flex items-center space-x-4 bg-white border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 rounded-2xl p-5 text-left transition-colors"
        >
          <div className="bg-purple-100 rounded-xl p-3">
            <Icon name="ClipboardList" className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-700">ดูงานทั้งหมด</div>
            <div className="text-sm text-slate-400">{jobs.length} งานในระบบ</div>
          </div>
        </button>
      </div>
    </div>
  );
};
