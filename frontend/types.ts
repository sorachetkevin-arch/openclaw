export type InsectType = 'cockroach' | 'termite' | 'rat' | 'mosquito' | 'ant' | 'bedbugs' | 'fly' | 'other';

export type PropertyType = 'house' | 'townhouse' | 'condo' | 'office' | 'restaurant' | 'factory';

export type JobStatus = 'new' | 'quoted' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled';

export type ContactSource = 'line' | 'facebook' | 'phone' | 'walk-in' | 'referral';

export type View = 'dashboard' | 'jobs' | 'new-booking' | 'calculator' | 'job-detail';

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

export interface CalcPrefill {
  insects: InsectType[];
  property: PropertyType;
  area: number;
}

export interface AgentState {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  colorClass: string;
  iconName: string;
  output?: string;
  error?: string;
  startTime?: number;
  endTime?: number;
}
