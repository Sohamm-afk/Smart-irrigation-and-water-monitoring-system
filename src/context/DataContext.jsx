import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  defaultSensorData,
  generateHourlyHistory,
  generateDailyHistory,
  generateMonthlyHistory,
  tickSensorData,
  detectLeak,
  predictNextDayUsage,
  detectPeakHour,
  usageInsight,
} from '../utils/simulation';
import { fetchWeather, shouldSkipIrrigation } from '../utils/weather';
import { isFirebaseConfigured, db } from '../firebase/config';

const DataContext = createContext();

// Alert ID counter
let alertIdCounter = 1;

export function DataProvider({ children }) {
  // ─── Sensor state ────────────────────────────────────────────────
  const [sensors, setSensors] = useState(defaultSensorData);

  // ─── Time-series history ──────────────────────────────────────────
  const [tankHistory, setTankHistory] = useState(() => generateHourlyHistory(72, 8));
  const [flowHistory, setFlowHistory] = useState(() => generateHourlyHistory(11, 5));
  const [moistureHistory, setMoistureHistory] = useState(() => generateHourlyHistory(28, 10));
  const [dailyUsage, setDailyUsage] = useState(() => generateDailyHistory());
  const [monthlyUsage] = useState(() => generateMonthlyHistory());

  // ─── Weather ─────────────────────────────────────────────────────
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // ─── Alerts ──────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState([]);

  // ─── Simulation controls ──────────────────────────────────────────
  const [simMode, setSimMode] = useState(true);
  const tickRef = useRef(null);

  // ─── Computed ────────────────────────────────────────────────────
  const prediction = predictNextDayUsage(dailyUsage);
  const peakHour  = detectPeakHour(flowHistory);
  const insight   = usageInsight(dailyUsage);
  const skipIrrigation = shouldSkipIrrigation(weather);

  // ─── Load weather once ────────────────────────────────────────────
  useEffect(() => {
    fetchWeather().then(w => {
      setWeather(w);
      setWeatherLoading(false);
    });
  }, []);

  // ─── Simulation tick ─────────────────────────────────────────────
  useEffect(() => {
    if (!simMode) return;
    tickRef.current = setInterval(() => {
      setSensors(prev => {
        const next = tickSensorData(prev);

        // Append to histories (keep last 24 points)
        const timeLabel = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
        const appendPoint = (arr, val) => [...arr.slice(-23), { time: timeLabel, value: val, ts: Date.now() }];
        setTankHistory(h => appendPoint(h, next.waterLevel));
        setFlowHistory(h => appendPoint(h, next.flowRate));
        setMoistureHistory(h => appendPoint(h, next.soilMoisture));

        // Check for alerts
        checkAndAddAlerts(next, prev);
        return next;
      });
    }, 3000);

    return () => clearInterval(tickRef.current);
  }, [simMode]);

  // ─── Alert engine ────────────────────────────────────────────────
  function checkAndAddAlerts(next, prev) {
    const now = Date.now();
    const pushAlert = (type, msg, severity) => {
      setAlerts(a => {
        // Deduplicate: no same type within 30s
        const recent = a.find(x => x.type === type && now - x.ts < 30000);
        if (recent) return a;
        return [{ id: alertIdCounter++, type, msg, severity, ts: now, resolved: false }, ...a].slice(0, 50);
      });
    };

    if (next.leak && !prev.leak)
      pushAlert('leak', 'Abnormal flow detected — possible pipe leak!', 'critical');
    if (next.tankOverflow && !prev.tankOverflow)
      pushAlert('overflow', 'Tank overflow warning! Level ≥ 95%', 'critical');
    if (next.lowWaterLevel && !prev.lowWaterLevel)
      pushAlert('low_water', 'Water level critically low (≤ 15%)', 'warning');
    if (next.soilMoisture < next.threshold - 5 && prev.soilMoisture >= prev.threshold)
      pushAlert('dry_soil', `Soil too dry (${next.soilMoisture}%) — irrigation triggered`, 'warning');
    if (next.temperature > 42 && prev.temperature <= 42)
      pushAlert('high_temp', `High temperature alert: ${next.temperature}°C`, 'info');
  }

  const resolveAlert = (id) =>
    setAlerts(a => a.map(x => x.id === id ? { ...x, resolved: true } : x));

  const dismissAlert = (id) =>
    setAlerts(a => a.filter(x => x.id !== id));

  // ─── Manual overrides ────────────────────────────────────────────
  const updateSensor = (key, value) =>
    setSensors(prev => ({ ...prev, [key]: value }));

  const setMode = (mode) => updateSensor('mode', mode);
  const setThreshold = (t) => updateSensor('threshold', t);
  const togglePump = () =>
    setSensors(prev => ({ ...prev, pumpStatus: prev.pumpStatus === 'ON' ? 'OFF' : 'ON' }));
  const toggleMotor = () =>
    setSensors(prev => ({ ...prev, motorStatus: prev.motorStatus === 'ON' ? 'OFF' : 'ON' }));

  // ─── Demo triggers ───────────────────────────────────────────────
  const triggerDry = () => setSensors(prev => ({ ...prev, soilMoisture: 10 }));
  const triggerOverflow = () => setSensors(prev => ({ ...prev, waterLevel: 97 }));
  const triggerLeak = () => setSensors(prev => ({ ...prev, leak: true, flowRate: 22 }));
  const resetDemo = () => {
    setSensors(defaultSensorData);
    setAlerts([]);
  };

  return (
    <DataContext.Provider value={{
      sensors, setSensors, updateSensor,
      tankHistory, flowHistory, moistureHistory, dailyUsage, monthlyUsage,
      weather, weatherLoading, skipIrrigation,
      alerts, resolveAlert, dismissAlert,
      prediction, peakHour, insight,
      simMode, setSimMode,
      setMode, setThreshold, togglePump, toggleMotor,
      triggerDry, triggerOverflow, triggerLeak, resetDemo,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
