import React from 'react';
import {
  Droplets, Activity, TrendingUp, TrendingDown, Zap,
  Thermometer, CloudRain, AlertTriangle, BarChart2, Clock,
  ArrowUpRight, ArrowDownRight, Brain,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useData } from '../context/DataContext';
import { Card, CardHeader } from '../components/common/Card';
import { CircularGauge, ProgressBar, StatusPill } from '../components/common/Gauges';
import { Badge } from '../components/common/Controls';
import { weatherCodeLabel } from '../utils/weather';

// ── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs shadow-2xl">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>{p.value}{unit}</p>
      ))}
    </div>
  );
};

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, unit, color, detail, trend }) {
  return (
    <Card accent={color} className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color}/20 border border-[var(--border-main)]`}>
          <Icon size={18} className="text-[var(--text-primary)] dark:text-white" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center text-xs font-medium ${trend >= 0 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="metric-label">{label}</p>
        <p className="metric-value">
          {value} <span className="text-sm text-[var(--text-muted)] font-normal">{unit}</span>
        </p>
        {detail && <p className="text-xs text-[var(--text-secondary)] mt-1">{detail}</p>}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const {
    sensors, tankHistory, flowHistory, dailyUsage,
    prediction, peakHour, insight,
    alerts, weather, weatherLoading, skipIrrigation,
  } = useData();

  const activeAlerts = alerts.filter(a => !a.resolved);
  const wx = weather ? weatherCodeLabel(weather.today?.code || 0) : null;

  return (
    <div className="space-y-6 max-w-[1600px]">

      {/* ── System Alert Banner ─────────────────────────────────────── */}
      {activeAlerts.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 animate-pulse" />
          <span className="text-red-600 dark:text-red-300 font-bold">{activeAlerts[0].msg}</span>
          <Badge variant="red" size="xs">{activeAlerts.length} active</Badge>
        </div>
      )}

      {/* ── Top row: Gauge + Stat cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Water Level Gauge */}
        <Card accent="from-cyan-500 to-blue-500" className="sm:col-span-2 lg:col-span-1 flex flex-col items-center justify-center gap-4 py-6">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider self-start">Tank Water Level</p>
          <CircularGauge value={sensors.waterLevel} label="Tank Level" size={160} strokeWidth={14} />
          <div className="w-full space-y-1.5 border-t border-[var(--border-main)] pt-4 mt-2">
            <ProgressBar value={sensors.waterLevel} color="from-cyan-500 to-blue-500" showLabel label="Fill" />
            <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
              <span>Empty</span>
              <StatusPill status={sensors.waterLevel >= 95 ? 'OVERFLOW' : sensors.waterLevel <= 15 ? 'LOW' : 'OK'} onLabel="OK" offLabel={sensors.waterLevel >= 95 ? 'OVERFLOW' : 'LOW'} />
              <span>Full</span>
            </div>
          </div>
        </Card>

        <StatCard icon={Activity}    label="Flow Rate"   value={sensors.flowRate}    unit="L/min" color="from-blue-500 to-indigo-500"   trend={2} />
        <StatCard icon={Thermometer} label="Temperature" value={sensors.temperature} unit="°C"    color="from-orange-500 to-red-500"    />
        <StatCard icon={Droplets}    label="Soil Moisture" value={sensors.soilMoisture} unit="%"  color="from-emerald-500 to-teal-500"
          detail={sensors.soilMoisture < sensors.threshold ? '🌱 Dry — pump active' : '✅ Adequate moisture'} />
      </div>

      {/* ── Middle row: Charts + Smart insights ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Daily usage bar chart */}
        <Card accent="from-blue-500 to-cyan-500" className="lg:col-span-2">
          <CardHeader title="Daily Water Usage" subtitle="7-day overview with predictions">
            <Badge variant="blue">Last 7 Days</Badge>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyUsage} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit="L" />
              <Tooltip content={<CustomTooltip unit="L" />} />
              <Bar dataKey="usage"     fill="url(#blueGrad)"   radius={[4,4,0,0]} name="Actual" />
              <Bar dataKey="predicted" fill="rgba(99,102,241,0.3)" radius={[4,4,0,0]} name="Predicted" strokeDasharray="4 2" />
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Smart insights panel */}
        <div className="flex flex-col gap-4">

          {/* Prediction */}
          <Card accent="from-indigo-500 to-purple-500" className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Brain size={16} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">Smart Prediction</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Linear regression model</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{prediction} <span className="text-sm text-[var(--text-muted)]">L</span></p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Expected tomorrow</p>
            {insight && (
              <div className={`mt-3 flex items-center gap-2 text-xs font-medium px-2 py-1.5 rounded-lg
                ${insight.up ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {insight.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {insight.label}
              </div>
            )}
          </Card>

          {/* Peak Hour */}
          <Card accent="from-amber-500 to-orange-500" className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-amber-500" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">Peak Usage Hour</p>
            </div>
            <p className="text-2xl font-bold text-amber-500">{peakHour}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Highest consumption today</p>
          </Card>

          {/* Weather */}
          <Card accent="from-sky-500 to-blue-500" className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain size={14} className="text-sky-500 font-bold" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">Weather</p>
            </div>
            {weatherLoading ? (
              <div className="animate-pulse space-y-1">
                <div className="h-4 bg-[var(--border-main)] rounded w-3/4" />
                <div className="h-3 bg-[var(--border-main)] rounded w-1/2" />
              </div>
            ) : wx ? (
              <>
                <p className="text-lg font-bold text-[var(--text-primary)]">{wx.icon} {weather?.current?.temperature}°C</p>
                <p className="text-xs text-[var(--text-secondary)]">{wx.label}</p>
                {skipIrrigation && (
                  <Badge variant="blue" size="xs" className="mt-2">Rain expected → Irrigation paused</Badge>
                )}
              </>
            ) : null}
          </Card>
        </div>
      </div>

      {/* ── Flow Rate Area Chart ─────────────────────────────────────── */}
      <Card accent="from-cyan-500 to-teal-500">
        <CardHeader title="Live Flow Rate" subtitle="Real-time water flow (L/min)">
          <div className="flex items-center gap-2">
            <StatusPill status={sensors.motorStatus} />
            <Badge variant={sensors.leak ? 'red' : 'green'}>
              {sensors.leak ? '⚠️ Leak Detected' : '✅ No Leak'}
            </Badge>
          </div>
        </CardHeader>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={flowHistory}>
            <defs>
              <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} unit=" L/m" />
            <Tooltip content={<CustomTooltip unit=" L/min" />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#06b6d4" 
              strokeWidth={3} 
              fill="url(#flowGrad)" 
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── System Status Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Motor',    value: sensors.motorStatus,  ok: sensors.motorStatus === 'ON' },
          { label: 'Pump',     value: sensors.pumpStatus,   ok: sensors.pumpStatus === 'ON' },
          { label: 'Mode',     value: sensors.mode,         ok: true },
          { label: 'Leak',     value: sensors.leak ? 'YES' : 'NO', ok: !sensors.leak },
          { label: 'Overflow', value: sensors.tankOverflow ? 'YES' : 'NO', ok: !sensors.tankOverflow },
          { label: 'Low Water',value: sensors.lowWaterLevel ? 'YES' : 'NO', ok: !sensors.lowWaterLevel },
        ].map(({ label, value, ok }) => (
          <div key={label} className={`glass-card px-3 py-3 text-center border-l-4 transition-all
            ${!ok ? 'border-l-red-500 bg-red-500/5' : 'border-l-emerald-500 bg-emerald-500/5'}`}>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
            <p className={`text-sm font-bold mt-1 ${ok ? 'text-emerald-500' : 'text-red-500 font-black'}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
