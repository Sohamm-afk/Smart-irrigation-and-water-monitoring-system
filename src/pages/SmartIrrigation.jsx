import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Leaf, Thermometer, Zap, CloudRain, Clock, Play, Square,
  AlertTriangle, CheckCircle, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card, CardHeader } from '../components/common/Card';
import { CircularGauge, ProgressBar, StatusPill } from '../components/common/Gauges';
import { Toggle, Slider, Badge } from '../components/common/Controls';
import { weatherCodeLabel, shouldSkipIrrigation } from '../utils/weather';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs shadow-2xl">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}%</p>
      ))}
    </div>
  );
};

export default function SmartIrrigationPage() {
  const {
    sensors, moistureHistory,
    setMode, setThreshold, togglePump,
    weather, weatherLoading, skipIrrigation,
  } = useData();

  const [schedule, setSchedule] = useState({ enabled: false, time: '06:00' });
  const [schedDays, setSchedDays] = useState(['Mon', 'Wed', 'Fri']);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const wx = weather ? weatherCodeLabel(weather.today?.code || 0) : null;
  const tomorrow = weather ? weatherCodeLabel(weather.tomorrow?.code || 0) : null;

  const autoLogicActive = sensors.mode === 'AUTO' && sensors.soilMoisture < sensors.threshold;
  const pumpWouldRun = !skipIrrigation && (
    sensors.mode === 'MANUAL'
      ? sensors.pumpStatus === 'ON'
      : sensors.soilMoisture < sensors.threshold
  );

  return (
    <div className="space-y-6 max-w-[1600px]">

      {/* ── Weather Skip Banner ──────────────────────────────────────── */}
      {skipIrrigation && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/25">
          <CloudRain size={16} className="text-sky-500 font-bold" />
          <div>
            <span className="text-sky-600 dark:text-sky-300 font-bold text-sm">Rain Expected — Irrigation Paused</span>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Precipitation forecast: today {weather?.today?.precip}mm / tomorrow {weather?.tomorrow?.precip}mm
            </p>
          </div>
          <Badge variant="blue" size="xs" className="ml-auto">WEATHER SMART</Badge>
        </div>
      )}

      {/* ── Top sensor cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Soil moisture gauge */}
        <Card accent="from-emerald-500 to-teal-500" className="flex flex-col items-center py-5 gap-3">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider self-start">Soil Moisture</p>
          <CircularGauge
            value={sensors.soilMoisture}
            size={150}
            strokeWidth={13}
            color="#10b981"
            label="Moisture"
          />
          <ProgressBar
            value={sensors.soilMoisture}
            color={sensors.soilMoisture < sensors.threshold ? 'from-red-500 to-orange-500' : 'from-emerald-500 to-teal-500'}
            showLabel label="Level"
          />
          <p className={`text-xs font-medium ${sensors.soilMoisture < sensors.threshold ? 'text-red-400' : 'text-emerald-400'}`}>
            {sensors.soilMoisture < sensors.threshold ? '🔴 Below threshold — Pump active' : '🟢 Adequate moisture'}
          </p>
        </Card>

        {/* Temperature */}
        <Card accent="from-orange-500 to-red-500" className="flex flex-col gap-4 justify-center py-5">
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 self-start">
            <Thermometer size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="metric-label">Temperature</p>
            <p className="text-4xl font-bold text-orange-500">{sensors.temperature}°<span className="text-xl">C</span></p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {sensors.temperature > 40 ? '🌡️ Very hot — increased evaporation' : '✅ Normal range'}
            </p>
          </div>
        </Card>

        {/* Pump Status */}
        <Card accent={sensors.pumpStatus === 'ON' ? 'from-emerald-500 to-cyan-500' : 'from-red-500 to-rose-500'} className="flex flex-col gap-4 justify-center py-5">
          <div className={`p-3 rounded-xl self-start ${sensors.pumpStatus === 'ON' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
            <Zap size={20} className={sensors.pumpStatus === 'ON' ? 'text-emerald-500' : 'text-red-500'} />
          </div>
          <div>
            <p className="metric-label">Pump Status</p>
            <div className="mt-1"><StatusPill status={sensors.pumpStatus} /></div>
            <p className="text-xs text-[var(--text-muted)] mt-3">Mode: <span className="text-[var(--text-primary)] font-bold">{sensors.mode}</span></p>
            {autoLogicActive && (
              <p className="text-xs text-emerald-500 font-bold mt-1 animate-pulse">⚡ Auto-triggered (moisture low)</p>
            )}
          </div>
        </Card>

        {/* Weather Card */}
        <Card accent="from-sky-500 to-blue-500" className="flex flex-col gap-3 py-5">
          <div className="flex items-center gap-2">
            <CloudRain size={16} className="text-sky-500 font-bold" />
            <p className="text-xs font-semibold text-[var(--text-primary)]">Weather Forecast</p>
          </div>
          {weatherLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-5 bg-[var(--border-main)] rounded w-2/3" />
              <div className="h-3 bg-[var(--border-main)] rounded w-1/2" />
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Today {wx?.icon}</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">{weather?.current?.temperature}°C</p>
                <p className="text-xs text-[var(--text-muted)]">{wx?.label} · {weather?.today?.precip}mm rain</p>
              </div>
              <div className="border-t border-[var(--border-main)] pt-2">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">TOMORROW</p>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
                  {tomorrow?.icon} {weather?.tomorrow?.maxTemp}°C · {weather?.tomorrow?.precip}mm
                </p>
                {tomorrow?.rainy && <Badge variant="blue" size="xs" className="mt-1">Rain → Skip irrigation</Badge>}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ── Moisture History Chart ───────────────────────────────────── */}
      <Card accent="from-emerald-500 to-teal-500">
        <CardHeader title="Soil Moisture Trend" subtitle="Last 24 hours">
          <Badge variant="green">Live</Badge>
        </CardHeader>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={moistureHistory}>
            <defs>
              <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={sensors.threshold} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: `Threshold ${sensors.threshold}%`, fill: '#f59e0b', fontSize: 11, fontWeight: 'bold' }} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              strokeWidth={3} 
              fill="url(#moistGrad)" 
              name="Moisture" 
              animationDuration={2200}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Controls Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Pump & Mode controls */}
        <Card accent="from-blue-500 to-indigo-500">
          <CardHeader title="Irrigation Controls" subtitle="Manual override & mode" />

          <div className="space-y-5">
            {/* Mode toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)]">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Auto Mode</p>
                <p className="text-xs text-[var(--text-muted)]">Pump auto-triggers on threshold</p>
              </div>
              <Toggle
                checked={sensors.mode === 'AUTO'}
                onChange={v => setMode(v ? 'AUTO' : 'MANUAL')}
                colorOn="bg-blue-600"
              />
            </div>

            {/* Pump toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)]">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Pump</p>
                <p className="text-xs text-[var(--text-muted)]">{sensors.mode === 'AUTO' ? 'Controlled by auto mode' : 'Manual control'}</p>
              </div>
              <Toggle
                checked={sensors.pumpStatus === 'ON'}
                onChange={() => togglePump()}
                colorOn="bg-emerald-600"
                disabled={sensors.mode === 'AUTO'}
              />
            </div>

            {/* Start / Stop buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setMode('MANUAL'); }}
                disabled={sensors.pumpStatus === 'ON'}
                className={`btn-success flex-1 py-3 group
                  ${sensors.pumpStatus === 'ON' ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
              >
                <div className="flex items-center gap-2 group-hover:scale-110 transition-transform">
                  <Play size={16} fill="white" />
                  <span className="uppercase tracking-wider text-[10px]">Start Irrigation</span>
                </div>
              </button>
              <button
                onClick={() => { togglePump(); }}
                disabled={sensors.pumpStatus === 'OFF'}
                className={`btn-danger flex-1 py-3 group
                  ${sensors.pumpStatus === 'OFF' ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
              >
                <div className="flex items-center gap-2 group-hover:scale-110 transition-transform">
                  <Square size={16} fill="white" />
                  <span className="uppercase tracking-wider text-[10px]">Stop Pump</span>
                </div>
              </button>
            </div>
          </div>
        </Card>

        {/* Threshold slider */}
        <Card accent="from-amber-500 to-orange-500">
          <CardHeader title="Moisture Threshold" subtitle="Auto-irrigation trigger point" />
          <div className="space-y-6 py-2">
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-36 h-36">
                <CircularGauge
                  value={sensors.threshold}
                  size={144}
                  strokeWidth={12}
                  color="#f59e0b"
                  label="Threshold"
                />
              </div>
            </div>
            <Slider
              value={sensors.threshold}
              onChange={v => setThreshold(v)}
              min={10}
              max={90}
              step={5}
              label="Set Threshold"
              unit="%"
              color="#f59e0b"
            />
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-600 dark:text-amber-300">
                <span className="font-semibold">Logic:</span> If moisture ({sensors.soilMoisture}%) &lt; threshold ({sensors.threshold}%) → Pump <span className="font-bold text-emerald-500">ON</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Smart Scheduling */}
        <Card accent="from-purple-500 to-indigo-500">
          <CardHeader title="Smart Schedule" subtitle="Auto-irrigate at set times" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary)]">Enable Schedule</p>
              <Toggle
                checked={schedule.enabled}
                onChange={v => setSchedule(s => ({ ...s, enabled: v }))}
                colorOn="bg-purple-600"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-[var(--text-muted)]">Time</p>
              <input
                type="time"
                value={schedule.time}
                onChange={e => setSchedule(s => ({ ...s, time: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]
                  text-[var(--text-primary)] text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-[var(--text-muted)]">Active Days</p>
              <div className="flex flex-wrap gap-1.5">
                {days.map(d => (
                  <button key={d}
                    onClick={() => setSchedDays(prev =>
                      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
                    )}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all
                      ${schedDays.includes(d)
                        ? 'bg-purple-600 text-white'
                        : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)] hover:bg-[var(--bg-surface)]'}`}
                  >{d}</button>
                ))}
              </div>
            </div>

            {schedule.enabled && (
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-[11px] text-purple-600 dark:text-purple-300 font-medium">
                  ⏱️ Scheduled at <strong>{schedule.time}</strong> on {schedDays.join(', ')}
                  {skipIrrigation ? ' · ⛅ Skipped (rain forecast)' : ''}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
