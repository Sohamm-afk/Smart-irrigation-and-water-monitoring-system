import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Sun, Moon, Activity, Play, Square } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';

const pageTitles = {
  '/':           { title: 'Dashboard',       sub: 'System overview & real-time monitoring' },
  '/monitoring': { title: 'Water Monitoring', sub: 'Tank levels, flow rates & usage analytics' },
  '/irrigation': { title: 'Smart Irrigation', sub: 'Soil moisture, pump control & automation' },
  '/control':    { title: 'Control Panel',   sub: 'Motor, pump & system controls' },
  '/alerts':     { title: 'Alerts',          sub: 'System notifications & incident history' },
  '/settings':   { title: 'Settings',        sub: 'Preferences, simulation & integrations' },
};

export default function Header() {
  const { isDark, toggle } = useTheme();
  const { alerts, simMode, setSimMode } = useData();
  const location = useLocation();
  const [showAlerts, setShowAlerts] = useState(false);

  const unresolved = alerts.filter(a => !a.resolved).slice(0, 5);
  const info = pageTitles[location.pathname] || pageTitles['/'];

  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-[var(--bg-main)]/70 border-b border-[var(--border-main)] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page title */}
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">{info.title}</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{info.sub}</p>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Sim mode toggle */}
          <button
            onClick={() => setSimMode(s => !s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${simMode
                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25 hover:bg-amber-500/25'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25'
              }`}
          >
            <Activity size={12} />
            {simMode ? 'Simulation' : 'Live'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-muted)]
              hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all duration-200"
            title="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Alert bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(s => !s)}
              className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-muted)]
                hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all duration-200 relative"
            >
              <Bell size={16} />
              {unresolved.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {/* Dropdown */}
            {showAlerts && (
              <div className="absolute right-0 top-12 w-80 glass-card shadow-2xl z-50 p-3 space-y-2 border border-[var(--border-main)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[var(--text-muted)]">Recent Alerts</p>
                  <Link to="/alerts" className="text-xs text-blue-400 hover:underline"
                    onClick={() => setShowAlerts(false)}>View all</Link>
                </div>
                {unresolved.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-3">No active alerts</p>
                ) : unresolved.map(a => (
                  <div key={a.id} className={`flex items-start gap-2 p-2 rounded-lg border text-xs
                    ${a.severity === 'critical'
                      ? 'bg-red-500/10 border-red-500/20'
                      : a.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'}`}>
                    <span className={`mt-0.5 status-dot flex-shrink-0
                      ${a.severity === 'critical' ? 'offline' : a.severity === 'warning' ? 'warning' : 'online'}`} />
                    <div>
                      <p className="text-[var(--text-secondary)]">{a.msg}</p>
                      <p className="text-[var(--text-muted)] mt-0.5">{new Date(a.ts).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown overlay */}
      {showAlerts && (
        <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
      )}
    </header>
  );
}
