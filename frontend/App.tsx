import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AGENT_DEFINITIONS } from './constants';
import { AgentState, WorkflowState, Language } from './types';
import { runAgentTask } from './services/geminiService';
import { AgentCard } from './components/AgentCard';
import { OutputModal } from './components/OutputModal';
import { Icon } from './components/Icons';
import ReactMarkdown from 'react-markdown';

const INITIAL_AGENTS: AgentState[] = AGENT_DEFINITIONS.map(def => ({
  ...def,
  status: 'idle',
  output: null,
}));

const UI_TEXT = {
  en: {
    headerReady: "Multi-Agent System Ready",
    inputTitle: "What do you want to create content about?",
    inputPlaceholder: "e.g., The impact of artificial intelligence on modern healthcare, focusing on diagnostic tools...",
    startBtn: "Start Forge",
    stopBtn: "Stop Process",
    pipelineTitle: "Agent Pipeline",
    completeTitle: "Content Forge Complete",
    completeDesc: "Your multi-agent team has finished generating the content.",
    finalArticle: "Final Article",
    promoKit: "Promo Kit",
    presetsLabel: "Try a preset:",
    presets: [
      { label: "AI in Healthcare", value: "The impact of Artificial Intelligence on modern healthcare and diagnostic tools." },
      { label: "Remote Work", value: "The future of remote work: challenges, tools, and maintaining team culture." },
      { label: "Sustainable Tech", value: "How green technology and sustainable practices are reshaping the tech industry." }
    ]
  },
  th: {
    headerReady: "ระบบ AI พร้อมทำงาน",
    inputTitle: "คุณต้องการสร้างเนื้อหาเกี่ยวกับอะไร?",
    inputPlaceholder: "เช่น ผลกระทบของปัญญาประดิษฐ์ต่อการแพทย์สมัยใหม่...",
    startBtn: "เริ่มสร้างเนื้อหา",
    stopBtn: "หยุดการทำงาน",
    pipelineTitle: "ขั้นตอนการทำงานของ AI",
    completeTitle: "สร้างเนื้อหาเสร็จสมบูรณ์",
    completeDesc: "ทีม AI ของคุณได้สร้างเนื้อหาเสร็จเรียบร้อยแล้ว",
    finalArticle: "บทความฉบับสมบูรณ์",
    promoKit: "ชุดโปรโมท (โซเชียลมีเดีย)",
    presetsLabel: "ลองใช้หัวข้อตัวอย่าง:",
    presets: [
      { label: "AI ในการแพทย์", value: "ผลกระทบของปัญญาประดิษฐ์ (AI) ต่อการแพทย์สมัยใหม่และเครื่องมือวินิจฉัยโรค" },
      { label: "การทำงานทางไกล", value: "อนาคตของการทำงานทางไกล (Remote Work): ความท้าทาย เครื่องมือ และการรักษาวัฒนธรรมองค์กร" },
      { label: "เทคโนโลยีรักษ์โลก", value: "เทคโนโลยีสีเขียวและแนวทางปฏิบัติที่ยั่งยืนกำลังพลิกโฉมอุตสาหกรรมเทคโนโลยีอย่างไร" }
    ]
  }
};

export default function App() {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<Language>('th');
  const [workflow, setWorkflow] = useState<WorkflowState>({
    topic: '',
    language: 'th',
    isRunning: false,
    isComplete: false,
    agents: INITIAL_AGENTS,
    currentAgentIndex: -1,
  });
  const [selectedAgent, setSelectedAgent] = useState<AgentState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const t = UI_TEXT[language];

  // Scroll to bottom of results when complete
  const resultsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (workflow.isComplete) {
      resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [workflow.isComplete]);

  const handleStart = async () => {
    if (!topic.trim()) return;

    // Reset state
    setWorkflow({
      topic,
      language,
      isRunning: true,
      isComplete: false,
      agents: INITIAL_AGENTS.map(a => ({ ...a, status: 'idle', output: null, error: undefined })),
      currentAgentIndex: 0,
    });

    abortControllerRef.current = new AbortController();
    let currentContext = topic;
    let currentAgents = [...INITIAL_AGENTS];

    const langInstruction = language === 'th' 
      ? '\n\nIMPORTANT: You MUST write your entire response in Thai language (ภาษาไทย). Ensure natural phrasing and correct grammar.' 
      : '\n\nIMPORTANT: You MUST write your entire response in English.';

    for (let i = 0; i < currentAgents.length; i++) {
      if (abortControllerRef.current.signal.aborted) break;

      // Set current agent to loading
      setWorkflow(prev => {
        const newAgents = [...prev.agents];
        newAgents[i] = { ...newAgents[i], status: 'loading', startTime: Date.now() };
        return { ...prev, agents: newAgents, currentAgentIndex: i };
      });

      try {
        const agentDef = currentAgents[i];
        // The first agent uses the topic as input. Subsequent agents use the previous agent's output as context.
        const input = i === 0 
          ? `${topic}${langInstruction}` 
          : `Please process the following material according to your role.${langInstruction}`;
        const context = i === 0 ? undefined : currentContext;

        const result = await runAgentTask(agentDef.systemInstruction, input, context);
        
        currentContext = result; // Pass output to next agent

        // Update success state
        setWorkflow(prev => {
          const newAgents = [...prev.agents];
          newAgents[i] = { 
            ...newAgents[i], 
            status: 'success', 
            output: result,
            endTime: Date.now()
          };
          return { ...prev, agents: newAgents };
        });

      } catch (error: any) {
        console.error(`Agent ${currentAgents[i].name} failed:`, error);
        // Update error state and halt workflow
        setWorkflow(prev => {
          const newAgents = [...prev.agents];
          newAgents[i] = { 
            ...newAgents[i], 
            status: 'error', 
            error: error.message,
            endTime: Date.now()
          };
          return { ...prev, agents: newAgents, isRunning: false };
        });
        break; // Stop the pipeline on error
      }
    }

    if (!abortControllerRef.current.signal.aborted) {
      setWorkflow(prev => ({ ...prev, isRunning: false, isComplete: prev.agents.every(a => a.status === 'success') }));
    }
  };

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setWorkflow(prev => ({ ...prev, isRunning: false }));
    }
  }, []);

  const finalOutput = workflow.agents[workflow.agents.length - 1]?.output;
  const editorOutput = workflow.agents.find(a => a.id === 'editor')?.output;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
              <Icon name="PenTool" className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ContentForge <span className="text-indigo-600 font-black">AI</span></h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              {t.headerReady}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col space-y-8">
        
        {/* Input Section - Redesigned for better UX */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <Icon name="Sparkles" className="w-6 h-6 mr-2 text-indigo-500" />
                {t.inputTitle}
              </h2>
              
              {/* Language Selector */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                <Icon name="Globe" className="w-4 h-4 text-slate-500 ml-2 mr-1" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  disabled={workflow.isRunning}
                  className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer py-1.5 pr-8 pl-2 disabled:opacity-50"
                >
                  <option value="th">🇹🇭 ภาษาไทย</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full h-32 px-4 py-4 rounded-xl border-2 border-slate-200 focus:ring-0 focus:border-indigo-500 resize-none transition-colors text-slate-700 text-lg shadow-inner bg-slate-50 focus:bg-white"
                disabled={workflow.isRunning}
              />
            </div>

            {/* Presets & Actions Row */}
            <div className="mt-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-500 font-medium">{t.presetsLabel}</span>
                {t.presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTopic(preset.value)}
                    disabled={workflow.isRunning}
                    className="text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors border border-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="w-full lg:w-auto flex justify-end">
                {!workflow.isRunning ? (
                  <button
                    onClick={handleStart}
                    disabled={!topic.trim()}
                    className="w-full lg:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap text-lg"
                  >
                    <Icon name="Play" className="w-5 h-5 mr-2" />
                    {t.startBtn}
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="w-full lg:w-auto h-12 px-8 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-all flex items-center justify-center whitespace-nowrap text-lg"
                  >
                    <Icon name="Loader2" className="w-5 h-5 mr-2 animate-spin" />
                    {t.stopBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pipeline Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Icon name="RefreshCw" className="w-5 h-5 mr-2 text-indigo-500" />
            {t.pipelineTitle}
          </h2>
          
          <div className="relative">
            {/* Connecting Line Background */}
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-100 -translate-y-1/2 hidden lg:block rounded-full z-0"></div>
            
            {/* Animated Progress Line */}
            {workflow.isRunning && (
               <div 
                 className="absolute top-1/2 left-0 h-1.5 bg-indigo-500 -translate-y-1/2 hidden lg:block rounded-full z-0 transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                 style={{ width: `${(workflow.currentAgentIndex / (workflow.agents.length - 1)) * 100}%` }}
               ></div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {workflow.agents.map((agent, index) => (
                <div key={agent.id} className="relative">
                  {/* Mobile connecting line */}
                  {index !== workflow.agents.length - 1 && (
                    <div className="absolute left-1/2 bottom-[-24px] w-0.5 h-6 bg-slate-200 -translate-x-1/2 lg:hidden"></div>
                  )}
                  <AgentCard 
                    agent={agent} 
                    isActive={workflow.isRunning && workflow.currentAgentIndex === index}
                    onViewOutput={setSelectedAgent}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Results Section */}
        {workflow.isComplete && editorOutput && finalOutput && (
          <section className="mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700" ref={resultsEndRef}>
            <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <Icon name="CheckCircle" className="w-8 h-8 mr-3 text-indigo-200" />
                    {t.completeTitle}
                  </h2>
                  <p className="text-indigo-100 mt-1 text-sm md:text-base">{t.completeDesc}</p>
                </div>
              </div>
              
              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Article */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                      <Icon name="FileText" className="w-6 h-6 mr-2 text-emerald-500" />
                      {t.finalArticle}
                    </h3>
                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">By Penelope & Mr. Redline</span>
                  </div>
                  <div className="markdown-body bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm max-h-[800px] overflow-y-auto">
                    <ReactMarkdown>{editorOutput}</ReactMarkdown>
                  </div>
                </div>

                {/* Social Media Kit */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                      <Icon name="Share2" className="w-6 h-6 mr-2 text-purple-500" />
                      {t.promoKit}
                    </h3>
                    <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200">By Nova</span>
                  </div>
                  <div className="markdown-body bg-purple-50/30 p-6 rounded-xl border border-purple-100 shadow-sm max-h-[800px] overflow-y-auto">
                    <ReactMarkdown>{finalOutput}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Modals */}
      <OutputModal 
        agent={selectedAgent} 
        onClose={() => setSelectedAgent(null)} 
      />
    </div>
  );
}
