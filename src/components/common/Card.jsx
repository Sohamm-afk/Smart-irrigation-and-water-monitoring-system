import React from 'react';

// Reusable glass card with optional gradient accent
export function Card({ children, className = '', accent = false }) {
  return (
    <div className={`glass-card p-5 relative overflow-hidden ${className}`}>
      {accent && (
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent}`} />
      )}
      {children}
    </div>
  );
}

// Section header inside a card
export function CardHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// Metric display
export function Metric({ label, value, unit, icon: Icon, color = 'text-[var(--text-primary)]', trend }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={14} className="text-[var(--text-muted)]" />}
        <span className="metric-label">{label}</span>
      </div>
      <div className={`flex items-end gap-1.5 ${color}`}>
        <span className="metric-value">{value}</span>
        {unit && <span className="text-sm text-[var(--text-muted)] mb-1">{unit}</span>}
      </div>
      {trend && (
        <span className={`text-[11px] font-medium ${trend.up ? 'text-red-500' : 'text-emerald-500'}`}>
          {trend.up ? '↑' : '↓'} {trend.label}
        </span>
      )}
    </div>
  );
}
