import React, { useState } from 'react';
import {
  AlertTriangle, Droplets, Thermometer, Zap, Info,
  CheckCircle, X, Clock, Filter, ShieldAlert,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Controls';
import { StatusPill } from '../components/common/Gauges';

const TYPE_META = {
  leak:      { icon: Droplets,       label: 'Leak Detected',    color: 'red',    bg: 'bg-red-500/10 border-red-500/20' },
  overflow:  { icon: AlertTriangle,  label: 'Tank Overflow',    color: 'red',    bg: 'bg-red-500/10 border-red-500/20' },
  low_water: { icon: Droplets,       label: 'Low Water Level',  color: 'yellow', bg: 'bg-amber-500/10 border-amber-500/20' },
  dry_soil:  { icon: Zap,            label: 'Dry Soil',         color: 'yellow', bg: 'bg-amber-500/10 border-amber-500/20' },
  high_temp: { icon: Thermometer,    label: 'High Temperature', color: 'blue',   bg: 'bg-blue-500/10 border-blue-500/20' },
  default:   { icon: Info,           label: 'System Info',      color: 'blue',   bg: 'bg-blue-500/10 border-blue-500/20' },
};

const SEV_VARIANT = { critical: 'red', warning: 'yellow', info: 'blue' };

function AlertRow({ alert, onResolve, onDismiss }) {
  const meta = TYPE_META[alert.type] || TYPE_META.default;
  const Icon = meta.icon;

  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${meta.bg}
      ${alert.resolved ? 'opacity-40' : ''}`}>
      <div className={`p-2 rounded-lg flex-shrink-0
        ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-400'
        : alert.severity === 'warning'  ? 'bg-amber-500/20 text-amber-400'
        : 'bg-blue-500/20 text-blue-400'}`}>
        <Icon size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{meta.label}</p>
          <Badge variant={SEV_VARIANT[alert.severity] || 'blue'} size="xs">
            {alert.severity?.toUpperCase()}
          </Badge>
          {alert.resolved && <Badge variant="default" size="xs">RESOLVED</Badge>}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{alert.msg}</p>
        <div className="flex items-center gap-2 mt-2">
          <Clock size={11} className="text-[var(--text-muted)]" />
          <span className="text-[11px] text-[var(--text-muted)]">{new Date(alert.ts).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {!alert.resolved && (
          <button onClick={() => onResolve(alert.id)}
            className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
            title="Mark resolved">
            <CheckCircle size={14} />
          </button>
        )}
        <button onClick={() => onDismiss(alert.id)}
          className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

const FILTERS = ['All', 'Active', 'Critical', 'Warning', 'Info', 'Resolved'];

export default function AlertsPage() {
  const { alerts, resolveAlert, dismissAlert, triggerDry, triggerOverflow, triggerLeak } = useData();
  const [filter, setFilter] = useState('All');

  const filtered = alerts.filter(a => {
    if (filter === 'Active')   return !a.resolved;
    if (filter === 'Critical') return a.severity === 'critical' && !a.resolved;
    if (filter === 'Warning')  return a.severity === 'warning';
    if (filter === 'Info')     return a.severity === 'info';
    if (filter === 'Resolved') return a.resolved;
    return true;
  });

  const counts = {
    active:   alerts.filter(a => !a.resolved).length,
    critical: alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
    warning:  alerts.filter(a => a.severity === 'warning' && !a.resolved).length,
    resolved: alerts.filter(a => a.resolved).length,
  };

  return (
    <div className="space-y-6 max-w-[1200px]">

      {/* ── Summary Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Alerts',    count: counts.active,   color: 'text-red-500 font-bold', bg: 'border-red-500/20 bg-red-500/5' },
          { label: 'Critical',         count: counts.critical, color: 'text-red-500 font-bold', bg: 'border-red-500/20' },
          { label: 'Warnings',         count: counts.warning,  color: 'text-amber-500 font-bold',bg: 'border-amber-500/20' },
          { label: 'Resolved Today',   count: counts.resolved, color: 'text-emerald-500 font-bold',bg: 'border-emerald-500/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`glass-card p-4 border ${bg}`}>
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
            <p className={`text-3xl font-bold ${color} mt-1`}>{count}</p>
          </div>
        ))}
      </div>

      {/* ── Alert simulator ───────────────────────────────────────────── */}
      <Card accent="from-purple-500 to-pink-500">
        <CardHeader title="Alert Simulator" subtitle="Trigger alerts for demo purposes">
          <Badge variant="purple" size="xs">DEMO</Badge>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <button onClick={triggerLeak}     className="btn-danger flex items-center gap-2 text-xs">💧 Trigger Leak</button>
          <button onClick={triggerOverflow} className="btn-danger flex items-center gap-2 text-xs">🌊 Tank Overflow</button>
          <button onClick={triggerDry}      className="btn-primary flex items-center gap-2 text-xs">🌵 Dry Soil Alert</button>
        </div>
      </Card>

      {/* ── Alert list ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Alert History" subtitle={`${filtered.length} alerts`}>
          <div className="flex gap-1 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                  ${filter === f ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
        </CardHeader>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3 opacity-60" />
              <p className="text-slate-400 text-sm">No alerts in this category</p>
              <p className="text-slate-500 text-xs mt-1">System is running normally</p>
            </div>
          ) : (
            filtered.map(a => (
              <AlertRow key={a.id} alert={a} onResolve={resolveAlert} onDismiss={dismissAlert} />
            ))
          )}
        </div>

        {alerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/8 flex justify-end">
            <button
              onClick={() => alerts.forEach(a => dismissAlert(a.id))}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
              <X size={12} /> Clear all alerts
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
