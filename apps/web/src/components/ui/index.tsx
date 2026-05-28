// ─── VETRA UI COMPONENTS ───────────────────────
// Design system: Stripe / Linear / Vercel style

import { ReactNode } from 'react';

// ── Button ──────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonStyles: Record<ButtonVariant, string> = {
  primary:   'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  ghost:     'bg-transparent hover:bg-slate-100 text-slate-600 border border-slate-200',
  danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
  success:   'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200',
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-sm rounded-xl',
};

export function Button({
  children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button',
}: {
  children: ReactNode; variant?: ButtonVariant; size?: ButtonSize;
  className?: string; disabled?: boolean; onClick?: () => void; type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 
        disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500
        ${buttonStyles[variant]} ${buttonSizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

// ── Card ────────────────────────────────────────
export function Card({ children, className = '', hover = false }: {
  children: ReactNode; className?: string; hover?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm 
      ${hover ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
      transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

// ── Badge ───────────────────────────────────────
type BadgeVariant = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
const badgeStyles: Record<BadgeVariant, string> = {
  blue:   'bg-blue-50 text-blue-700 border-blue-200',
  green:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  red:    'bg-red-50 text-red-600 border-red-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
  gray:   'bg-slate-100 text-slate-600 border-slate-200',
};

export function Badge({ children, variant = 'gray' }: {
  children: ReactNode; variant?: BadgeVariant;
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles[variant]}`}>
      {children}
    </span>
  );
}

// ── Input ───────────────────────────────────────
export function Input({ label, error, ...props }: {
  label?: string; error?: string;
  [key: string]: any;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-gray-700 tracking-wide">{label}</label>}
      <input
        {...props}
        className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-gray-900
          placeholder:text-gray-400 outline-none transition-all duration-150
          focus:border-blue-500 focus:ring-3 focus:ring-blue-100
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'}
          ${props.className || ''}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function SkeletonCard() {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </Card>
  );
}

// ── Stat Card ────────────────────────────────────
export function StatCard({ label, value, icon, trend, color = 'blue' }: {
  label: string; value: string | number; icon: string;
  trend?: string; color?: 'blue' | 'green' | 'purple' | 'amber';
}) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-emerald-50 text-emerald-600',
    purple: 'bg-violet-50 text-violet-600',
    amber:  'bg-amber-50 text-amber-600',
  };
  return (
    <Card hover>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${colors[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </Card>
  );
}

// ── Score Bar ─────────────────────────────────────
export function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${textColor}`}>{score}</span>
    </div>
  );
}

// ── Empty State ───────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: string; title: string; description: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}

// ── Credits Badge ─────────────────────────────────
export function CreditsBadge({ credits }: { credits: number }) {
  const isLow = credits <= 2;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
      ${isLow ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-red-500' : 'bg-blue-500'}`} />
      {isLow ? `${credits} consulta${credits !== 1 ? 's' : ''} restante${credits !== 1 ? 's' : ''}` : `${credits} consultas`}
    </div>
  );
}
