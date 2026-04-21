import React from 'react';

// Animated circular gauge using SVG
export function CircularGauge({
  value = 0,
  max = 100,
  size = 180,
  strokeWidth = 12,
  color = '#06b6d4',
  trackColor = 'var(--border-main)',
  label = '',
  unit = '%',
  children,
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const pct = Math.min(1, Math.max(0, value / max));
  const dash = pct * circumference;
  const center = size / 2;

  // Color by value for water level
  const getColor = () => {
    if (label === 'Tank Level') {
      if (value >= 70) return '#10b981'; // green
      if (value >= 30) return '#f59e0b'; // amber
      return '#ef4444'; // red
    }
    return color;
  };
  const arcColor = getColor();

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={trackColor} strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={arcColor} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span className="text-3xl font-bold text-[var(--text-primary)] leading-none">{Math.round(value)}</span>
        <span className="text-xs text-[var(--text-muted)] font-medium">{unit}</span>
        {label && <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1">{label}</span>}
      </div>
    </div>
  );
}

// Thin horizontal progress bar
export function ProgressBar({ value, max = 100, color = 'from-cyan-500 to-blue-500', height = 'h-2', showLabel = false, label = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>{label}</span>
          <span className="font-medium text-[var(--text-primary)]">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-[var(--border-main)] overflow-hidden`}>
        <div
          className={`${height} rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// Status pill indicator
export function StatusPill({ status, onLabel = 'ON', offLabel = 'OFF' }) {
  const isOn = status === onLabel || status === true;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors
      ${isOn
        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
        : 'bg-red-500/15 text-red-500 border-red-500/30'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOn ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      {isOn ? onLabel : offLabel}
    </span>
  );
}
