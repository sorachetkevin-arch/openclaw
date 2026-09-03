import React, { useState, useCallback } from 'react';
import { Job, View, InsectType, PropertyType } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { JobList } from './components/JobList';
import { JobDetail } from './components/JobDetail';
import { NewBookingForm } from './components/NewBookingForm';
import { PriceCalculator } from './components/PriceCalculator';
import { useJobs } from './hooks/useJobs';

export default function App() {
  const {
    jobs, connection, error, saving,
    addJob: persistJob, updateJob, deleteJob, refresh, dismissError,
  } = useJobs();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useCallback((view: View, jobId?: string) => {
    setCurrentView(view);
    if (jobId) setSelectedJobId(jobId);
    setSidebarOpen(false);
  }, []);

  const addJob = useCallback((job: Job) => {
    persistJob(job);
    setSelectedJobId(job.id);
    setCurrentView('job-detail');
  }, [persistJob]);

  const selectedJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) ?? null : null;
  const newCount = jobs.filter(j => j.status === 'new').length;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard jobs={jobs} onNavigate={navigate} />;
      case 'jobs':
        return <JobList jobs={jobs} onNavigate={navigate} onNewBooking={() => navigate('new-booking')} />;
      case 'new-booking':
        return (
          <NewBookingForm
            onSave={addJob}
            onCancel={() => navigate('jobs')}
          />
        );
      case 'calculator':
        return (
          <PriceCalculator
            onCreateJob={(insects: InsectType[], property: PropertyType, area: number) => {
              navigate('new-booking');
            }}
          />
        );
      case 'job-detail':
        if (!selectedJob) {
          return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <p>ไม่พบงานนี้</p>
              <button onClick={() => navigate('jobs')} className="mt-4 text-emerald-600 underline text-sm">
                กลับไปหน้างานทั้งหมด
              </button>
            </div>
          );
        }
        return (
          <JobDetail
            job={selectedJob}
            onBack={() => navigate('jobs')}
            onUpdate={updateJob}
            onDelete={deleteJob}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile slides in */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-30 transform transition-transform duration-300 lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar
          currentView={currentView}
          onNavigate={navigate}
          jobCount={jobs.length}
          newCount={newCount}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-emerald-900 text-white shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="font-bold text-base">ระบบกำจัดแมลง</div>
          {newCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-semibold">
              {newCount} ใหม่
            </span>
          )}
        </div>

        {/* Connection / error banner — the only place async failures surface */}
        {(error || connection === 'loading' || saving) && (
          <div
            role="status"
            aria-live="polite"
            className={`shrink-0 px-4 py-2 text-sm flex items-center justify-between gap-3 ${
              error
                ? 'bg-amber-50 text-amber-800 border-b border-amber-200'
                : 'bg-slate-50 text-slate-600 border-b border-slate-200'
            }`}
          >
            <span className="min-w-0">
              {error
                ? error
                : connection === 'loading'
                  ? 'กำลังโหลดข้อมูลจากเซิร์ฟเวอร์...'
                  : 'กำลังบันทึก...'}
            </span>
            {error && (
              <span className="flex items-center gap-2 shrink-0">
                <button onClick={refresh} className="underline font-medium">
                  ลองใหม่
                </button>
                <button
                  onClick={dismissError}
                  aria-label="ปิดข้อความแจ้งเตือน"
                  className="px-1.5 rounded hover:bg-amber-100"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
