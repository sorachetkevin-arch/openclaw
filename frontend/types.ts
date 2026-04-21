export type AgentStatus = 'idle' | 'loading' | 'success' | 'error';
export type Language = 'en' | 'th';

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  description: string;
  systemInstruction: string;
  iconName: string;
  colorClass: string;
}

export interface AgentState extends AgentDefinition {
  status: AgentStatus;
  output: string | null;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface WorkflowState {
  topic: string;
  language: Language;
  isRunning: boolean;
  isComplete: boolean;
  agents: AgentState[];
  currentAgentIndex: number;
}
