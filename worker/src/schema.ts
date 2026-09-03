/**
 * Shared domain vocabulary and validation.
 * Mirrors frontend/types.ts — keep the two in sync when the model changes.
 */

export const INSECT_TYPES = [
  'cockroach', 'termite', 'rat', 'mosquito', 'ant', 'bedbugs', 'fly', 'other',
] as const;

export const PROPERTY_TYPES = [
  'house', 'townhouse', 'condo', 'office', 'restaurant', 'factory',
] as const;

export const JOB_STATUSES = [
  'new', 'quoted', 'confirmed', 'scheduled', 'completed', 'cancelled',
] as const;

export const CONTACT_SOURCES = [
  'line', 'facebook', 'phone', 'walk-in', 'referral',
] as const;

export type InsectType = (typeof INSECT_TYPES)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type JobStatus = (typeof JOB_STATUSES)[number];
export type ContactSource = (typeof CONTACT_SOURCES)[number];

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
  updatedAt?: string;
}

/** Database row shape (snake_case, JSON-encoded arrays). */
export interface JobRow {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_line_id: string | null;
  address: string;
  insect_types: string;
  property_type: string;
  area_m2: number;
  problem_description: string;
  status: string;
  estimated_price: number;
  final_price: number | null;
  scheduled_date: string | null;
  completed_date: string | null;
  technician: string | null;
  notes: string | null;
  source: string;
  warranty_months: number | null;
  follow_up_date: string | null;
  updated_at: string;
}

export function rowToJob(row: JobRow): Job {
  const job: Job = {
    id: row.id,
    createdAt: row.created_at,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    address: row.address,
    insectTypes: parseInsectTypes(row.insect_types),
    propertyType: row.property_type as PropertyType,
    areaM2: row.area_m2,
    problemDescription: row.problem_description,
    status: row.status as JobStatus,
    estimatedPrice: row.estimated_price,
    source: row.source as ContactSource,
    updatedAt: row.updated_at,
  };

  // Optional fields are omitted rather than set to null, so the payload round
  // trips cleanly through the frontend's `Job` type.
  if (row.customer_line_id !== null) job.customerLineId = row.customer_line_id;
  if (row.final_price !== null) job.finalPrice = row.final_price;
  if (row.scheduled_date !== null) job.scheduledDate = row.scheduled_date;
  if (row.completed_date !== null) job.completedDate = row.completed_date;
  if (row.technician !== null) job.technician = row.technician;
  if (row.notes !== null) job.notes = row.notes;
  if (row.warranty_months !== null) job.warrantyMonths = row.warranty_months;
  if (row.follow_up_date !== null) job.followUpDate = row.follow_up_date;

  return job;
}

function parseInsectTypes(raw: string): InsectType[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isInsectType) : [];
  } catch {
    return [];
  }
}

const isInsectType = (v: unknown): v is InsectType =>
  typeof v === 'string' && (INSECT_TYPES as readonly string[]).includes(v);

export interface FieldError {
  field: string;
  message: string;
}

type Body = Record<string, unknown>;

/**
 * Validates a create or patch payload.
 * `partial` skips required-field checks so PATCH can send only what changed.
 */
export function validateJob(body: Body, { partial }: { partial: boolean }): FieldError[] {
  const errors: FieldError[] = [];
  const has = (k: string) => body[k] !== undefined && body[k] !== null;
  const require = (k: string) => {
    if (!partial && !has(k)) errors.push({ field: k, message: 'is required' });
  };

  for (const field of ['customerName', 'customerPhone', 'address', 'propertyType', 'source']) {
    require(field);
  }
  if (!partial && !has('areaM2')) errors.push({ field: 'areaM2', message: 'is required' });

  for (const field of ['customerName', 'customerPhone', 'address'] as const) {
    if (has(field) && String(body[field]).trim() === '') {
      errors.push({ field, message: 'must not be empty' });
    }
  }

  if (has('customerPhone')) {
    // Thai numbers are 9-10 digits; accept common separators and a +66 prefix.
    const digits = String(body.customerPhone).replace(/[\s()+-]/g, '').replace(/^66/, '0');
    if (!/^0\d{8,9}$/.test(digits)) {
      errors.push({ field: 'customerPhone', message: 'must be a valid Thai phone number' });
    }
  }

  if (has('areaM2')) {
    const area = Number(body.areaM2);
    if (!Number.isFinite(area) || area <= 0) {
      errors.push({ field: 'areaM2', message: 'must be a number greater than 0' });
    }
  }

  for (const [field, price] of [
    ['estimatedPrice', body.estimatedPrice],
    ['finalPrice', body.finalPrice],
  ] as const) {
    if (price !== undefined && price !== null) {
      const n = Number(price);
      if (!Number.isFinite(n) || n < 0) {
        errors.push({ field, message: 'must be a number of 0 or more' });
      }
    }
  }

  if (has('warrantyMonths')) {
    const months = Number(body.warrantyMonths);
    if (!Number.isInteger(months) || months < 0) {
      errors.push({ field: 'warrantyMonths', message: 'must be a whole number of 0 or more' });
    }
  }

  if (has('insectTypes')) {
    const list = body.insectTypes;
    if (!Array.isArray(list) || !list.every(isInsectType)) {
      errors.push({
        field: 'insectTypes',
        message: `must be an array of: ${INSECT_TYPES.join(', ')}`,
      });
    } else if (!partial && list.length === 0) {
      errors.push({ field: 'insectTypes', message: 'must select at least one pest' });
    }
  } else if (!partial) {
    errors.push({ field: 'insectTypes', message: 'must select at least one pest' });
  }

  checkEnum(errors, body, 'propertyType', PROPERTY_TYPES);
  checkEnum(errors, body, 'status', JOB_STATUSES);
  checkEnum(errors, body, 'source', CONTACT_SOURCES);

  for (const field of ['createdAt', 'scheduledDate', 'completedDate'] as const) {
    if (has(field) && Number.isNaN(Date.parse(String(body[field])))) {
      errors.push({ field, message: 'must be an ISO 8601 date-time' });
    }
  }
  if (has('followUpDate') && !/^\d{4}-\d{2}-\d{2}$/.test(String(body.followUpDate))) {
    errors.push({ field: 'followUpDate', message: 'must be a YYYY-MM-DD date' });
  }

  return errors;
}

function checkEnum(
  errors: FieldError[],
  body: Body,
  field: string,
  allowed: readonly string[],
): void {
  const value = body[field];
  if (value === undefined || value === null) return;
  if (!allowed.includes(String(value))) {
    errors.push({ field, message: `must be one of: ${allowed.join(', ')}` });
  }
}
