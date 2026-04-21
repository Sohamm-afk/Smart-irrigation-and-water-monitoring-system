import React from 'react';

// Toggle switch component
export function Toggle({ checked, onChange, label, size = 'md', colorOn = 'bg-blue-500', disabled = false }) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`${s.track} rounded-full transition-colors duration-200
          ${checked ? colorOn : 'bg-slate-600'} border
          ${checked ? 'border-transparent' : 'border-white/10'}`} />
        <div className={`absolute top-0.5 left-0.5 ${s.thumb} rounded-full bg-white shadow-md
          transition-transform duration-200 ${checked ? s.translate : 'translate-x-0'}`} />
      </div>
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
    </label>
  );
}

// Vertical range slider
export function Slider({ value, onChange, min = 0, max = 100, step = 1, label, unit = '%', color = '#3b82f6' }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-sm font-bold text-white">{value}{unit}</span>
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-2 appearance-none rounded-full outline-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
          }}
        />
      </div>
    </div>
  );
}

// Badge variant component
export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    red: 'bg-red-500/15 text-red-400 border-red-500/25',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  };
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium border
      ${variants[variant] || variants.default} ${sizes[size] || sizes.sm}`}>
      {children}
    </span>
  );
}
