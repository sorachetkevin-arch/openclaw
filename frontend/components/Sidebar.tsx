import React from 'react';
import { View } from '../types';
import { Icon } from './Icons';

interface NavItem {
  view: View;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard',    label: 'แดชบอร์ด',      icon: 'Home'          },
  { view: 'jobs',         label: 'งานทั้งหมด',     icon: 'ClipboardList' },
  { view: 'new-booking',  label: 'นัดงานใหม่',     icon: 'Plus'          },
  { view: 'calculator',   label: 'คำนวณราคา',      icon: 'Calculator'    },
];

interface Props {
  currentView: View;
  onNavigate: (view: View) => void;
  jobCount: number;
  newCount: number;
}

export const Sidebar: React.FC<Props> = ({ currentView, onNavigate, jobCount, newCount }) => {
  return (
    <aside className="w-64 bg-emerald-900 text-white flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-emerald-800">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 rounded-xl p-2 shadow-lg">
            <Icon name="Bug" className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg leading-none">กำจัดแมลง</div>
            <div className="text-emerald-400 text-xs mt-0.5">ระบบจัดการงาน CRM</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon name={item.icon} className="w-4.5 h-4.5 w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {item.view === 'jobs' && jobCount > 0 && (
                <span className={`text-xs rounded-full px-2 py-0.5 font-semibold ${isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-700 text-emerald-200'}`}>
                  {jobCount}
                </span>
              )}
              {item.view === 'dashboard' && newCount > 0 && (
                <span className="text-xs rounded-full px-2 py-0.5 font-semibold bg-red-500 text-white animate-pulse">
                  {newCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-emerald-800">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
            <Icon name="User" className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">แอดมิน</div>
            <div className="text-xs text-emerald-400 truncate">ทีมกำจัดแมลง</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
