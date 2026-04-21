import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Droplets, Leaf, Settings2,
  Bell, LogOut, ChevronLeft, ChevronRight,
  Wifi, WifiOff, Activity, Gauge,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const navItems = [
  { to: '/',           label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/monitoring', label: 'Water Monitoring', icon: Droplets },
  { to: '/irrigation', label: 'Smart Irrigation', icon: Leaf },
  { to: '/control',    label: 'Control Panel',   icon: Gauge },
  { to: '/alerts',     label: 'Alerts',          icon: Bell },
  { to: '/settings',   label: 'Settings',        icon: Settings2 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { sensors, simMode, alerts } = useData();
  const navigate = useNavigate();

  const unresolved = alerts.filter(a => !a.resolved).length;

  return (
    <aside
      className={`sidebar-bg flex flex-col h-screen sticky top-0 transition-all duration-300 z-30
        ${collapsed ? 'w-[72px]' : 'w-60'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[var(--border-main)] min-h-[72px]`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-glow-cyan">
          <Droplets size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-[var(--text-primary)] leading-tight">SmartWater</p>
            <p className="text-[10px] text-[var(--text-muted)] font-medium tracking-wider uppercase">Monitoring</p>
          </div>
        )}
      </div>

      {/* Simulation badge */}
      {!collapsed && (
        <div className="px-4 py-2">
          <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg
            ${simMode
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
            }`}>
            {simMode ? <WifiOff size={10} /> : <Wifi size={10} />}
            {simMode ? 'SIM MODE' : 'LIVE'}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link relative ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
            {/* Alert badge on Alerts link */}
            {label === 'Alerts' && unresolved > 0 && (
              <span className={`absolute flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full
                ${collapsed ? 'top-1 right-1 w-4 h-4' : 'ml-auto w-5 h-5'}`}>
                {unresolved > 9 ? '9+' : unresolved}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System status mini */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-[var(--border-main)]">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">System</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-secondary)]">Motor</span>
              <span className={`status-dot ${sensors.motorStatus === 'ON' ? 'online' : 'offline'}`} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-secondary)]">Pump</span>
              <span className={`status-dot ${sensors.pumpStatus === 'ON' ? 'online' : 'offline'}`} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-secondary)]">Leak</span>
              <span className={`status-dot ${sensors.leak ? 'offline' : 'online'}`} />
            </div>
          </div>
        </div>
      )}

      {/* User + logout */}
      <div className={`border-t border-[var(--border-main)] p-3 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">
            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate">{user?.displayName || 'Demo User'}</p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email || 'demo@smartwater.io'}</p>
          </div>
        )}
        {!collapsed && (
          <button onClick={() => { logout(); navigate('/login'); }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
            title="Logout">
            <LogOut size={14} />
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--bg-surface)] border border-[var(--border-main)]
          flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
