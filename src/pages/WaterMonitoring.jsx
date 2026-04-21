import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Droplets, Activity, TrendingUp, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Controls';
import { ProgressBar } from '../components/common/Gauges';

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs shadow-2xl">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}{unit}
        </p>
      ))}
    </div>
  );
};

const tabs = ['Daily', 'Weekly', 'Monthly'];

export default function WaterMonitoringPage() {
  const { tankHistory, flowHistory, dailyUsage, monthlyUsage, sensors } = useData();
  const [activeTab, setActiveTab] = useState('Daily');

  const weeklyData = dailyUsage;
  const totalToday = dailyUsage.reduce((s, d) => s + d.usage, 0);
  const avgDaily = Math.round(totalToday / dailyUsage.length);

  return (
    <div className="space-y-6 max-w-[1600px]">

      {/* ── Top stat row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Droplets,  label: 'Tank Level',   value: `${sensors.waterLevel}%`,   color: 'text-cyan-400', bar: sensors.waterLevel, barColor: 'from-cyan-500 to-blue-500' },
          { icon: Activity,  label: 'Flow Rate',    value: `${sensors.flowRate} L/min`, color: 'text-blue-400' },
          { icon: TrendingUp,label: 'Avg Daily Use', value: `${avgDaily} L`,            color: 'text-indigo-400' },
          { icon: Calendar,  label: 'Total (7d)',   value: `${totalToday} L`,           color: 'text-purple-400' },
        ].map(({ icon: Icon, label, value, color, bar, barColor }) => (
          <Card key={label} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon size={15} className={color} />
              <span className="text-xs text-[var(--text-muted)]">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {bar !== undefined && <ProgressBar value={bar} color={barColor} />}
          </Card>
        ))}
      </div>

      {/* ── Tank Level History ─────────────────────────────────────────── */}
      <Card accent="from-cyan-500 to-blue-500">
        <CardHeader title="Tank Level History" subtitle="Last 24 hours (hourly readings)">
          <Badge variant="cyan">Live</Badge>
        </CardHeader>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={tankHistory}>
            <defs>
              <linearGradient id="tankGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip content={<CustomTooltip unit="%" />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#22d3ee" 
              strokeWidth={3} 
              fill="url(#tankGrad)" 
              name="Level" 
              animationDuration={2500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Flow Rate Analytics ────────────────────────────────────────── */}
      <Card accent="from-blue-500 to-indigo-500">
        <CardHeader title="Flow Rate Analytics" subtitle="Real-time water flow monitoring (L/min)">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)]">Current:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{sensors.flowRate} L/min</span>
          </div>
        </CardHeader>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={flowHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} unit=" L/m" />
            <Tooltip content={<CustomTooltip unit=" L/min" />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#60a5fa" 
              strokeWidth={3} 
              dot={false} 
              name="Flow" 
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Usage Trends (tabs) ────────────────────────────────────────── */}
      <Card accent="from-indigo-500 to-purple-500">
        <CardHeader title="Usage Trends" subtitle="Water consumption analysis">
          <div className="flex gap-1 p-1 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150
                  ${activeTab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]'}`}>
                {t}
              </button>
            ))}
          </div>
        </CardHeader>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={activeTab === 'Monthly' ? monthlyUsage : weeklyData} barGap={4}>
            <defs>
              <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#818cf8" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
            <XAxis dataKey={activeTab === 'Monthly' ? 'day' : 'day'} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} unit="L" />
            <Tooltip content={<CustomTooltip unit="L" />} />
            <Bar dataKey="usage" fill="url(#usageGrad)" radius={[4,4,0,0]} name="Usage(L)" />
            {activeTab !== 'Monthly' && (
              <Bar dataKey="predicted" fill="rgba(99,102,241,0.25)" radius={[4,4,0,0]} name="Predicted" />
            )}
            <Legend formatter={v => <span className="text-xs text-[var(--text-muted)]">{v}</span>} />
          </BarChart>
        </ResponsiveContainer>

        {/* Annotation row */}
        <div className="mt-4 pt-4 border-t border-[var(--border-main)] grid grid-cols-3 gap-4">
          {[
            { label: 'Min', value: Math.min(...weeklyData.map(d => d.usage)) + 'L' },
            { label: 'Avg', value: avgDaily + 'L' },
            { label: 'Max', value: Math.max(...weeklyData.map(d => d.usage)) + 'L' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
              <p className="text-base font-bold text-[var(--text-primary)] mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
