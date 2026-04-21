import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext();

// Demo user for simulation mode
const DEMO_USER = { uid: 'demo-001', email: 'demo@smartwater.io', displayName: 'Demo User' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Auto-login with demo account in simulation mode
      const savedUser = sessionStorage.getItem('swms_user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
      setLoading(false);
      return;
    }
    const unsub = auth.onAuthStateChanged(u => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  // Simulation login
  const loginDemo = () => {
    setUser(DEMO_USER);
    sessionStorage.setItem('swms_user', JSON.stringify(DEMO_USER));
  };

  const logout = async () => {
    if (isFirebaseConfigured) await auth.signOut();
    setUser(null);
    sessionStorage.removeItem('swms_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
