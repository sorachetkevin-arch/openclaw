import React from 'react';
import { JobStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';

interface Props {
  status: JobStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const colorClass = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colorClass} ${sizeClass} whitespace-nowrap`}>
      {label}
    </span>
  );
};
