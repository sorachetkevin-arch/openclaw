import React, { useEffect, useMemo, useState } from 'react';
import { AgentState, Job } from '../types';
import { AGENT_DEFINITIONS } from '../agents/definitions';
import { initialAgentStates, runOrchestration } from '../services/orchestrator';
import { AgentCard } from './AgentCard';
import { OutputModal } from './OutputModal';
import { Icon } from './Icons';

interface Props {
  jobs: Job[];
  initialJobId: string | null;
}

export const AgentOrchestrator: React.FC<Props> = ({ jobs, initialJobId }) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(initialJobId ?? jobs[0]?.id ?? null);
  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId) ?? null, [jobs, selectedJobId]);

  const [agents, setAgents] = useState<AgentState[]>(() => (selectedJob ? initialAgentStates(selectedJob) : []));
  const [running, setRunning] = useState(false);
  const [viewingAgent, setViewingAgent] = useState<AgentState | null>(null);

  useEffect(() => {
    setAgents(selectedJob ? initialAgentStates(selectedJob) : []);
  }, [selectedJobId]);

  const handleRun = async () => {
    if (!selectedJob || running) return;
    setRunning(true);
    setAgents(initialAgentStates(selectedJob));

    await runOrchestration(selectedJob, (agentId, update) => {
      setAgents(prev => prev.map(a => (a.id === agentId ? { ...a, ...update } : a)));
    });

    setRunning(false);
  };

  const doneCount = agents.filter(a => a.status === 'success' || a.status === 'error').length;
  const applicableCount = agents.filter(a => a.status !== 'skipped').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <Icon name="Sparkles" className="w-6 h-6 text-emerald-600" />
            <span>ทีม AI Agents</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ผู้ช่วย AI 10 คนที่ทำงานร่วมกัน (orchestrated) เพื่อร่างเอกสารและข้อความสำหรับแต่ละงาน
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">เลือกงาน</label>
          <select
            value={selectedJobId ?? ''}
            onChange={e => setSelectedJobId(e.target.value || null)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white"
            disabled={running}
          >
            {jobs.length === 0 && <option value="">ไม่มีงานในระบบ</option>}
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.id} — {j.customerName}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleRun}
          disabled={!selectedJob || running}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-semibold shadow transition-colors shrink-0"
        >
          <Icon name={running ? 'Loader2' : 'Play'} className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? `กำลังทำงาน (${doneCount}/${applicableCount})` : 'เริ่มทำงาน AI'}</span>
        </button>
      </div>

      {!selectedJob ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Icon name="Users" className="w-10 h-10 mb-3 opacity-30" />
          <p>ยังไม่มีงานให้เลือก — สร้างงานใหม่ก่อน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isActive={agent.status === 'loading'}
              onViewOutput={setViewingAgent}
            />
          ))}
        </div>
      )}

      <OutputModal agent={viewingAgent} onClose={() => setViewingAgent(null)} />

      <p className="text-xs text-slate-400 text-center">
        ผู้ช่วย {AGENT_DEFINITIONS.length} คนถูกจัดลำดับการทำงานเป็นขั้น (stages) โดย orchestrator —
        agent ที่ต้องพึ่งผลลัพธ์จาก agent อื่นจะรอจนกว่างานต้นทางจะเสร็จก่อนเริ่มทำงาน
      </p>
    </div>
  );
};
