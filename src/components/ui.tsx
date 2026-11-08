import React from 'react';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Dispatch status pill — single source of truth for status colours    */
/* ------------------------------------------------------------------ */

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  loading: { label: 'Loading', cls: 'badge-warning' },
  ready: { label: 'Ready', cls: 'badge-info' },
  completed: { label: 'Completed', cls: 'badge-success' },
};

export const StatusBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  const s = STATUS_MAP[status || 'loading'] || STATUS_MAP.loading;
  return (
    <span className={`badge ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {s.label}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Stat card                                                           */
/* ------------------------------------------------------------------ */

export type StatTone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_ICON: Record<StatTone, string> = {
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
  info: 'bg-indigo-50 text-indigo-600',
  neutral: 'bg-slate-100 text-slate-600',
};

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  desc?: React.ReactNode;
  icon: LucideIcon;
  tone?: StatTone;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, desc, icon: Icon, tone = 'brand' }) => (
  <div className="card p-5 flex items-start justify-between gap-4 min-w-0">
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-bold text-slate-500 truncate">{title}</p>
      <p className="text-2xl font-black text-slate-900 leading-tight tabular-nums">{value}</p>
      {desc && <p className="text-2xs text-slate-400 leading-snug">{desc}</p>}
    </div>
    <div className={`shrink-0 grid place-items-center w-10 h-10 rounded-lg ${TONE_ICON[tone]}`}>
      <Icon size={20} />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Card header                                                         */
/* ------------------------------------------------------------------ */

interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, icon: Icon, actions, className = '' }) => (
  <div className={`card-header ${className}`}>
    <div className="flex items-start gap-3 min-w-0">
      {Icon && (
        <div className="shrink-0 grid place-items-center w-9 h-9 rounded-lg bg-brand-50 text-brand-700">
          <Icon size={18} />
        </div>
      )}
      <div className="min-w-0">
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

/* ------------------------------------------------------------------ */
/* Meta field (label + value)                                          */
/* ------------------------------------------------------------------ */

export const MetaField: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({
  label,
  children,
  className = '',
}) => (
  <div className={`min-w-0 ${className}`}>
    <span className="meta-label">{label}</span>
    <div className="meta-value break-words">{children}</div>
  </div>
);
