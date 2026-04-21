import React, { useState } from 'react';
import { Droplets, Eye, EyeOff, LogIn, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { loginDemo } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDemo = () => {
    setLoading(true);
    setTimeout(() => {
      loginDemo();
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(var(--text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--text-muted) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Droplets size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">SmartWater</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">IoT Monitoring & Irrigation Dashboard</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 space-y-5 border border-[var(--border-main)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Sign In</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Access your monitoring dashboard</p>
          </div>

          {/* Demo login highlight */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300 mb-2">
              <Activity size={12} />
              <span className="font-bold">Demo Credentials</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Email: <span className="text-[var(--text-primary)] font-bold">demo@smartwater.io</span></p>
            <p className="text-xs text-[var(--text-muted)]">Password: <span className="text-[var(--text-primary)] font-bold">demo123</span></p>
          </div>

          {/* Email field (visual only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Email</label>
            <input
              type="email"
              defaultValue="demo@smartwater.io"
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-primary)] text-sm
                focus:outline-none focus:border-blue-500/50 transition-all font-medium"
              placeholder="you@example.com"
            />
          </div>

          {/* Password field (visual only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)]">Password</label>
            <PasswordInput />
          </div>

          {/* Sign in button */}
          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600
              text-white font-semibold text-sm hover:from-cyan-500 hover:to-blue-500
              transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>

          <p className="text-center text-xs text-[var(--text-muted)]">
            In simulation mode, any credentials will log you in.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] opacity-60 mt-6">
          Smart Water Monitoring System · IoT Dashboard v1.0
        </p>
      </div>
    </div>
  );
}

function PasswordInput() {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        defaultValue="demo123"
        className="w-full px-3 py-2.5 pr-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-primary)] text-sm
          focus:outline-none focus:border-blue-500/50 transition-all font-medium"
        placeholder="Password"
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
