import React, { useState, useMemo } from 'react';
import { Job, JobStatus, View } from '../types';
import {
  STATUS_LABELS, INSECT_LABELS, INSECT_EMOJI, SOURCE_LABELS, SOURCE_EMOJI,
  ALL_STATUSES, formatPrice, formatDate,
} from '../constants';
import { StatusBadge } from './StatusBadge';
import { Icon } from './Icons';

interface Props {
  jobs: Job[];
  onNavigate: (view: View, jobId?: string) => void;
  onNewBooking: () => void;
}

const STATUS_TABS: { value: JobStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'new', label: 'ลูกค้าใหม่' },
  { value: 'quoted', label: 'ส่งใบเสนอราคาแล้ว' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'scheduled', label: 'นัดหมายแล้ว' },
  { value: 'completed', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' },
];

export const JobList: React.FC<Props> = ({ jobs, onNavigate, onNewBooking }) => {
  const [activeStatus, setActiveStatus] = useState<JobStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = jobs;
    if (activeStatus !== 'all') {
      list = list.filter(j => j.status === activeStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(j =>
        j.customerName.toLowerCase().includes(q) ||
        j.customerPhone.includes(q) ||
        j.id.toLowerCase().includes(q) ||
        j.address.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [jobs, activeStatus, search]);

  const countByStatus = useMemo(() => {
    const map: Record<string, number> = { all: jobs.length };
    for (const s of ALL_STATUSES) {
      map[s] = jobs.filter(j => j.status === s).length;
    }
    return map;
  }, [jobs]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">งานทั้งหมด</h1>
          <p className="text-sm text-slate-500 mt-0.5">{jobs.length} งานในระบบ</p>
        </div>
        <button
          onClick={onNewBooking}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow transition-colors"
        >
          <Icon name="Plus" className="w-4 h-4" />
          <span>นัดงานใหม่</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Icon name="Search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อ, เบอร์โทร, เลขงาน..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Status tabs */}
      <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map(tab => {
          const count = countByStatus[tab.value] ?? 0;
          const isActive = activeStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Icon name="ClipboardList" className="w-12 h-12 mb-3 opacity-30" />
            <div className="font-medium">ไม่พบงาน</div>
            <div className="text-sm mt-1">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">เลขงาน</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">ลูกค้า</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">แมลง</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">นัด</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">ราคา</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">สถานะ</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(job => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => onNavigate('job-detail', job.id)}
                  >
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">{job.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{job.customerName}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
                        <span>{SOURCE_EMOJI[job.source]}</span>
                        <span>{job.customerPhone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {job.insectTypes.map(t => (
                          <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {INSECT_EMOJI[t]} {INSECT_LABELS[t]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs whitespace-nowrap">
                      {job.scheduledDate ? formatDate(job.scheduledDate) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="font-semibold text-emerald-700">
                        {formatPrice(job.finalPrice || job.estimatedPrice)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Icon name="ChevronRight" className="w-4 h-4 text-slate-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
