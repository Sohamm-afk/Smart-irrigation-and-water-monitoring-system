import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Droplets, Thermometer, Zap, Info } from 'lucide-react';
import { useData } from '../../context/DataContext';

const alertIcons = {
  leak: Droplets,
  overflow: AlertTriangle,
  low_water: Droplets,
  dry_soil: Zap,
  high_temp: Thermometer,
  default: Info,
};

const alertColors = {
  critical: 'border-red-500/50 bg-red-950/60',
  warning: 'border-amber-500/50 bg-amber-950/60',
  info: 'border-blue-500/50 bg-blue-950/60',
};

const iconColors = {
  critical: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

function Toast({ alert, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const Icon = alertIcons[alert.type] || alertIcons.default;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(alert.id), 310);
  };

  useEffect(() => {
    // Auto-dismiss info alerts after 6s
    if (alert.severity === 'info') {
      const t = setTimeout(handleDismiss, 6000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border backdrop-blur-xl shadow-2xl
      ${alertColors[alert.severity] || alertColors.info}
      ${visible ? 'toast-enter' : 'toast-exit'}`}
      style={{ minWidth: 300, maxWidth: 360 }}>
      <div className={`p-1.5 rounded-lg bg-white/5 flex-shrink-0 ${iconColors[alert.severity]}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold capitalize ${iconColors[alert.severity]}`}>
          {alert.severity === 'critical' ? '🚨 Critical Alert' : alert.severity === 'warning' ? '⚠️ Warning' : 'ℹ️ Info'}
        </p>
        <p className="text-sm text-slate-200 mt-0.5 leading-snug">{alert.msg}</p>
        <p className="text-[10px] text-slate-500 mt-1">{new Date(alert.ts).toLocaleTimeString()}</p>
      </div>
      <button onClick={handleDismiss}
        className="text-slate-500 hover:text-white transition-colors p-0.5 flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { alerts, dismissAlert } = useData();

  // Only show the latest 4 unresolved alerts as toasts
  const activeToasts = alerts
    .filter(a => !a.resolved)
    .slice(0, 4);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 pointer-events-none">
      {activeToasts.map(a => (
        <div key={a.id} className="pointer-events-auto">
          <Toast alert={a} onDismiss={dismissAlert} />
        </div>
      ))}
    </div>
  );
}
