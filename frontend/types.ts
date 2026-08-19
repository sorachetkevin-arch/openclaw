export type InsectType = 'cockroach' | 'termite' | 'rat' | 'mosquito' | 'ant' | 'bedbugs' | 'fly' | 'other';

export type PropertyType = 'house' | 'townhouse' | 'condo' | 'office' | 'restaurant' | 'factory';

export type JobStatus = 'new' | 'quoted' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled';

export type ContactSource = 'line' | 'facebook' | 'phone' | 'walk-in' | 'referral';

export type View = 'dashboard' | 'jobs' | 'new-booking' | 'calculator' | 'job-detail' | 'agents';

export interface Job {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerLineId?: string;
  address: string;
  insectTypes: InsectType[];
  propertyType: PropertyType;
  areaM2: number;
  problemDescription: string;
  status: JobStatus;
  estimatedPrice: number;
  finalPrice?: number;
  scheduledDate?: string;
  completedDate?: string;
  technician?: string;
  notes?: string;
  source: ContactSource;
  warrantyMonths?: number;
  followUpDate?: string;
}

export interface PriceBreakdown {
  insectBreakdown: { type: InsectType; label: string; price: number }[];
  subtotal: number;
  propertyLabel: string;
  propertyMultiplier: number;
  total: number;
}

export type AgentStatus = 'idle' | 'loading' | 'success' | 'error' | 'skipped';

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  description: string;
  iconName: string;
  colorClass: string;
  systemInstruction: string;
  /** Which other agent outputs (by id) this agent should receive as previousContext, if they ran. */
  dependsOn: string[];
  /** Whether this agent should run at all for a given job (e.g. report agents only for completed jobs). */
  isApplicable: (job: Job) => boolean;
  /** Builds the task input text sent to the model for this job. */
  buildInput: (job: Job) => string;
}

export interface AgentState {
  id: string;
  name: string;
  role: string;
  description: string;
  iconName: string;
  colorClass: string;
  status: AgentStatus;
  output: string | null;
  error: string | null;
  startTime: number | null;
  endTime: number | null;
}
