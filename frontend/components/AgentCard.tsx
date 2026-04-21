import React from 'react';
import { AgentState } from '../types';
import { Icon } from './Icons';

interface AgentCardProps {
  agent: AgentState;
  isActive: boolean;
  onViewOutput: (agent: AgentState) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, isActive, onViewOutput }) => {
  const getStatusStyles = () => {
    switch (agent.status) {
      case 'idle':
        return 'border-slate-200 bg-white text-slate-400';
      case 'loading':
        return `border-${agent.colorClass.split('-')[1]}-500 bg-white shadow-lg ring-4 ring-${agent.colorClass.split('-')[1]}-100`;
      case 'success':
        return 'border-green-200 bg-green-50/50 text-green-900 shadow-sm hover:shadow-md';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-900 shadow-sm';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  const getStatusIcon = () => {
    switch (agent.status) {
      case 'idle':
        return <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-300">{agent.id.charAt(0).toUpperCase()}</div>;
      case 'loading':
        return <Icon name="Loader2" className={`w-6 h-6 animate-spin text-${agent.colorClass.split('-')[1]}-500`} />;
      case 'success':
        return <Icon name="CheckCircle" className="w-6 h-6 text-green-500" />;
      case 'error':
        return <Icon name="AlertCircle" className="w-6 h-6 text-red-500" />;
    }
  };

  const duration = agent.startTime && agent.endTime 
    ? ((agent.endTime - agent.startTime) / 1000).toFixed(1) + 's' 
    : null;

  return (
    <div className={`relative flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 ${getStatusStyles()} ${isActive ? 'scale-105 z-20 -translate-y-1' : 'scale-100'}`}>
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl text-white shadow-sm ${agent.status === 'idle' ? 'bg-slate-300' : agent.colorClass}`}>
            <Icon name={agent.iconName} className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-base ${agent.status === 'idle' ? 'text-slate-500' : 'text-slate-800'}`}>{agent.name}</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 text-slate-500">{agent.role}</p>
          </div>
        </div>
        <div>
          {getStatusIcon()}
        </div>
      </div>

      <p className={`text-sm mt-2 flex-grow leading-relaxed ${agent.status === 'idle' ? 'text-slate-400' : 'text-slate-600'}`}>
        {agent.description}
      </p>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs font-mono font-medium text-slate-500">
          {agent.status === 'loading' && <span className={`text-${agent.colorClass.split('-')[1]}-600 animate-pulse`}>Processing...</span>}
          {agent.status === 'success' && duration && <span className="text-green-600">Done in {duration}</span>}
          {agent.status === 'error' && <span className="text-red-500">Failed</span>}
          {agent.status === 'idle' && <span>Waiting</span>}
        </div>
        
        <button
          onClick={() => onViewOutput(agent)}
          disabled={!agent.output}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
            agent.output 
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm' 
              : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent'
          }`}
        >
          View Output
        </button>
      </div>
    </div>
  );
};
