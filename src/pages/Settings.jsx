import React from 'react';
import { Settings, Wifi, WifiOff, Moon, Sun, Database, RefreshCw, Info } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader } from '../components/common/Card';
import { Toggle, Badge } from '../components/common/Controls';
import { isFirebaseConfigured } from '../firebase/config.js';

export default function SettingsPage() {
  const { simMode, setSimMode, resetDemo, sensors } = useData();
  const { isDark, toggle } = useTheme();

  return (
    <div className="space-y-6 max-w-[900px]">

      {/* ── Appearance ──────────────────────────────────────────────── */}
      <Card accent="from-slate-500 to-slate-600">
        <CardHeader title="Appearance" subtitle="UI preferences" />
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]">
            <div className="flex items-center gap-3">
              {isDark ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-400" />}
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Dark Mode</p>
                <p className="text-xs text-[var(--text-muted)]">{isDark ? 'Dark theme active' : 'Light theme active'}</p>
              </div>
            </div>
            <Toggle checked={isDark} onChange={toggle} colorOn="bg-indigo-500" />
          </div>
        </div>
      </Card>

      {/* ── Data Source ──────────────────────────────────────────────── */}
      <Card accent="from-blue-500 to-cyan-500">
        <CardHeader title="Data Source" subtitle="Simulation vs Firebase" />
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]">
            <div className="flex items-center gap-3">
              {simMode ? <WifiOff size={16} className="text-amber-400" /> : <Wifi size={16} className="text-emerald-400" />}
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Simulation Mode</p>
                <p className="text-xs text-[var(--text-muted)]">Generate fake sensor data locally</p>
              </div>
            </div>
            <Toggle checked={simMode} onChange={setSimMode} colorOn="bg-amber-500" />
          </div>

          <div className={`p-3 rounded-xl border text-xs
            ${isFirebaseConfigured
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-slate-700/30 border-slate-600/30 text-slate-400'}`}>
            <div className="flex items-center gap-2">
              <Database size={13} />
              <span className="font-medium">Firebase:</span>
              <Badge variant={isFirebaseConfigured ? 'green' : 'default'} size="xs">
                {isFirebaseConfigured ? 'Connected' : 'Not Configured'}
              </Badge>
            </div>
            {!isFirebaseConfigured && (
              <p className="mt-2 text-slate-500">
                Add Firebase credentials to <code className="bg-white/10 px-1 rounded">.env</code> to enable real-time sync.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* ── Current Sensor Values (readonly) ────────────────────────── */}
      <Card accent="from-slate-600 to-slate-700">
        <CardHeader title="Current Sensor Snapshot" subtitle="Live values from context" />
        <div className="font-mono text-xs bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-main)]">
          <pre className="text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">
{JSON.stringify({
  waterLevel: sensors.waterLevel,
  flowRate: sensors.flowRate,
  soilMoisture: sensors.soilMoisture,
  temperature: sensors.temperature,
  pumpStatus: sensors.pumpStatus,
  motorStatus: sensors.motorStatus,
  mode: sensors.mode,
  threshold: sensors.threshold,
  leak: sensors.leak,
  tankOverflow: sensors.tankOverflow,
  lowWaterLevel: sensors.lowWaterLevel,
}, null, 2)}
          </pre>
        </div>
      </Card>

      {/* ── Reset ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Reset" subtitle="Restore all values to default" />
        <button
          onClick={resetDemo}
          className="flex items-center gap-2 btn-ghost text-red-400 border-red-500/20 hover:bg-red-500/10"
        >
          <RefreshCw size={14} />
          Reset to Default Values
        </button>
      </Card>

      {/* ── About ──────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-start gap-3">
          <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--text-muted)] space-y-1">
            <p className="font-semibold text-[var(--text-primary)]">Smart Water Monitoring & Irrigation System</p>
            <p>IoT Dashboard v1.0 · React 18 + Vite · Firebase Realtime DB · Open-Meteo Weather</p>
            <p>Simulation mode: <span className="text-amber-500 font-bold">ON</span> · Weather: Mumbai, India · Prediction: Linear Regression</p>
            <p className="text-[var(--text-muted)] opacity-60 pt-1">Built for college project evaluation · All sensor data simulated for demo</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
