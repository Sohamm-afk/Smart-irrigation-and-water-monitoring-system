import React from 'react';
import { Power, Zap, ToggleLeft, AlertTriangle, CheckCircle, Activity, Gauge, Thermometer, Droplets } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Card, CardHeader } from '../components/common/Card';
import { Toggle, Slider, Badge } from '../components/common/Controls';
import { StatusPill, CircularGauge, ProgressBar } from '../components/common/Gauges';

function ControlCard({ title, subtitle, children, accent }) {
  return (
    <Card accent={accent} className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

export default function ControlPanelPage() {
  const {
    sensors, toggleMotor, togglePump, setMode, setThreshold,
    triggerDry, triggerOverflow, triggerLeak, resetDemo,
  } = useData();

  return (
    <div className="space-y-6 max-w-[1600px]">

      {/* ── Status summary bar ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Motor',    status: sensors.motorStatus, ok: sensors.motorStatus === 'ON' },
          { label: 'Pump',     status: sensors.pumpStatus,  ok: sensors.pumpStatus === 'ON' },
          { label: 'Leak',     status: sensors.leak ? 'DETECTED' : 'CLEAR', ok: !sensors.leak },
          { label: 'Tank',     status: sensors.tankOverflow ? 'OVERFLOW' : sensors.lowWaterLevel ? 'LOW' : 'NORMAL', ok: !sensors.tankOverflow && !sensors.lowWaterLevel },
        ].map(({ label, status, ok }) => (
          <div key={label} className={`glass-card p-4 text-center border-l-4 transition-all
            ${!ok ? 'border-l-red-500 bg-red-500/5' : 'border-l-emerald-500 bg-emerald-500/5'}`}>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{label}</p>
            <StatusPill status={status} onLabel={ok ? status : 'CLEAR'} offLabel={!ok ? status : 'OFF'} />
          </div>
        ))}
      </div>

      {/* ── Main Controls ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* Motor Control */}
        <ControlCard title="Motor Control" subtitle="Main water pump motor" accent="from-blue-500 to-cyan-500">
          <div className="flex items-center justify-center py-4">
            <button
              onClick={toggleMotor}
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1
                font-bold text-sm transition-all duration-300 border-2 shadow-lg
                ${sensors.motorStatus === 'ON'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-glow-green'
                  : 'bg-red-500/20 border-red-500/50 text-red-400'
                }`}
            >
              <Power size={28} />
              {sensors.motorStatus}
            </button>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Motor is <strong className={sensors.motorStatus === 'ON' ? 'text-emerald-500' : 'text-red-500'}>{sensors.motorStatus}</strong>
              {sensors.motorStatus === 'ON' ? ' — System running normally' : ' — No water flow'}
            </p>
          </div>
        </ControlCard>

        {/* Pump Control */}
        <ControlCard title="Irrigation Pump" subtitle="Soil irrigation pump" accent="from-emerald-500 to-teal-500">
          <div className="flex items-center justify-center py-4">
            <button
              onClick={togglePump}
              disabled={sensors.mode === 'AUTO'}
              className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1
                font-bold text-sm transition-all duration-300 border-2 shadow-lg
                ${sensors.pumpStatus === 'ON'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-glow-green'
                  : 'bg-slate-700/50 border-slate-600 text-slate-400'
                }
                ${sensors.mode === 'AUTO' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Zap size={28} />
              {sensors.pumpStatus}
            </button>
          </div>
          {sensors.mode === 'AUTO' && (
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
              <p className="text-xs text-blue-400">Auto mode active — pump auto-controlled</p>
            </div>
          )}
        </ControlCard>

        {/* Mode & Threshold */}
        <ControlCard title="System Mode & Threshold" subtitle="Automation settings" accent="from-amber-500 to-orange-500">
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Auto Mode</p>
                <p className="text-xs text-[var(--text-muted)]">Automatic irrigation logic</p>
              </div>
              <Toggle
                checked={sensors.mode === 'AUTO'}
                onChange={v => setMode(v ? 'AUTO' : 'MANUAL')}
                colorOn="bg-blue-500"
              />
            </div>
            <Slider
              value={sensors.threshold}
              onChange={setThreshold}
              min={10} max={90} step={5}
              label="Moisture Threshold"
              color="#f59e0b"
            />
          </div>
        </ControlCard>
      </div>

      {/* ── Live Sensor Readings ─────────────────────────────────────── */}
      <Card accent="from-slate-600 to-slate-700">
        <CardHeader title="Live Sensor Readings" subtitle="All sensors at a glance" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: Droplets,    label: 'Water Level',   value: sensors.waterLevel,    unit: '%',    gauge: true, color: '#22d3ee' },
            { icon: Gauge,       label: 'Flow Rate',     value: sensors.flowRate,      unit: 'L/min', gauge: false },
            { icon: Activity,    label: 'Soil Moisture', value: sensors.soilMoisture,  unit: '%',    gauge: true, color: '#10b981' },
            { icon: Thermometer, label: 'Temperature',   value: sensors.temperature,   unit: '°C',   gauge: false },
          ].map(({ icon: Icon, label, value, unit, gauge, color }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              {gauge ? (
                <CircularGauge value={value} size={100} strokeWidth={9} color={color} label={label} unit={unit} />
              ) : (
                <div className="flex flex-col items-center glass-card p-4 rounded-2xl w-full">
                  <Icon size={20} className="text-[var(--text-muted)] mb-2" />
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
                  <p className="text-xs text-[var(--text-muted)]">{unit}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">{label}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Demo Simulation Triggers ─────────────────────────────────── */}
      <Card accent="from-purple-500 to-pink-500">
        <CardHeader title="Demo Simulation Triggers" subtitle="Manually trigger scenarios for testing / viva demo">
          <Badge variant="purple" size="xs">DEMO</Badge>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={triggerDry}
            className="p-3 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20
              text-orange-400 text-xs font-semibold transition-all text-center space-y-1">
            <div>🌵</div>
            <div>Dry Soil</div>
            <div className="text-[10px] text-orange-300/70">Moisture → 10%</div>
          </button>
          <button onClick={triggerOverflow}
            className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20
              text-red-400 text-xs font-semibold transition-all text-center space-y-1">
            <div>🌊</div>
            <div>Tank Overflow</div>
            <div className="text-[10px] text-red-300/70">Level → 97%</div>
          </button>
          <button onClick={triggerLeak}
            className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20
              text-amber-400 text-xs font-semibold transition-all text-center space-y-1">
            <div>💧</div>
            <div>Leak Detected</div>
            <div className="text-[10px] text-amber-300/70">Flow spike triggered</div>
          </button>
          <button onClick={resetDemo}
            className="p-3 rounded-xl border border-slate-500/30 bg-slate-500/10 hover:bg-slate-500/20
              text-slate-400 text-xs font-semibold transition-all text-center space-y-1">
            <div>🔄</div>
            <div>Reset All</div>
            <div className="text-[10px] text-slate-300/70">Restore defaults</div>
          </button>
        </div>
      </Card>

      {/* ── Emergency Stop ────────────────────────────────────────────── */}
      <Card className="border-red-500/30">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 font-bold" />
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">Emergency Stop</p>
              <p className="text-xs text-[var(--text-muted)]">Cuts all power — motor, pump, and irrigation immediately</p>
            </div>
          </div>
          <button
            onClick={() => { setMode('MANUAL'); if (sensors.pumpStatus === 'ON') togglePump(); if (sensors.motorStatus === 'ON') toggleMotor(); }}
            className="btn-danger px-8 py-3 sm:ml-auto uppercase tracking-wider text-xs font-bold"
          >
            ⛔ Emergency Stop
          </button>
        </div>
      </Card>
    </div>
  );
}
