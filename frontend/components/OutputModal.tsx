import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AgentState } from '../types';
import { Icon } from './Icons';

interface OutputModalProps {
  agent: AgentState | null;
  onClose: () => void;
}

export const OutputModal: React.FC<OutputModalProps> = ({ agent, onClose }) => {
  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${agent.colorClass} text-white`}>
          <div className="flex items-center space-x-3">
            <Icon name={agent.iconName} className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{agent.name}'s Output</h2>
              <p className="text-sm opacity-90">{agent.role}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow bg-slate-50">
          {agent.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start space-x-3">
              <Icon name="AlertCircle" className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold">Error during generation</h3>
                <p className="text-sm mt-1">{agent.error}</p>
              </div>
            </div>
          ) : agent.output ? (
            <div className="markdown-body bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <ReactMarkdown>{agent.output}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Icon name="FileText" className="w-12 h-12 mb-4 opacity-20" />
              <p>No output available yet.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
