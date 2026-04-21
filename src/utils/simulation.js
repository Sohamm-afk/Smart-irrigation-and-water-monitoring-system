// Simulation Engine
// Generates realistic mock IoT data for demo mode.
// Simulates sensor fluctuations, alert triggers, time-series history.

const STORAGE_KEY = 'swms_data';

// ---------------------------------------------------------------------------
// Default sensor snapshot
// ---------------------------------------------------------------------------
export const defaultSensorData = {
  waterLevel: 72,
  flowRate: 11.4,
  soilMoisture: 28,
  temperature: 31.5,
  pumpStatus: 'ON',
  mode: 'AUTO',
  threshold: 30,
  leak: false,
  tankOverflow: false,
  lowWaterLevel: false,
  motorStatus: 'ON',
};

// ---------------------------------------------------------------------------
// Generate 24-hour time-series array (hourly points)
// ---------------------------------------------------------------------------
export function generateHourlyHistory(baseValue, variance, hours = 24) {
  const now = Date.now();
  return Array.from({ length: hours }, (_, i) => {
    const ts = now - (hours - 1 - i) * 3600 * 1000;
    const label = new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    const value = Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance * 2));
    return { time: label, value: Math.round(value * 10) / 10, ts };
  });
}

// Generate 7-day daily history
export function generateDailyHistory(baseUsage = 95, days = 7) {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return labels.map((day, i) => ({
    day,
    usage: Math.round(baseUsage + (Math.random() - 0.5) * 30),
    predicted: Math.round(baseUsage + 5 + (Math.random() - 0.5) * 20),
  }));
}

// Generate 30-day monthly history
export function generateMonthlyHistory() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `Apr ${i + 1}`,
    usage: Math.round(80 + Math.random() * 60),
  }));
}

// ---------------------------------------------------------------------------
// Smart Prediction — simple linear regression on last 7 days usage
// ---------------------------------------------------------------------------
export function predictNextDayUsage(history) {
  if (!history || history.length < 2) return 110;
  const n = history.length;
  const xMean = (n - 1) / 2;
  const yMean = history.reduce((s, h) => s + h.usage, 0) / n;
  let num = 0, den = 0;
  history.forEach((h, i) => {
    num += (i - xMean) * (h.usage - yMean);
    den += (i - xMean) ** 2;
  });
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  const prediction = slope * n + intercept;
  return Math.max(40, Math.round(prediction));
}

// ---------------------------------------------------------------------------
// Advanced Leak Detection — abnormal flow pattern
// ---------------------------------------------------------------------------
export function detectLeak(flowHistory, pumpStatus, motorStatus) {
  if (!flowHistory || flowHistory.length < 3) return false;
  const lastThree = flowHistory.slice(-3);
  const avgFlow = lastThree.reduce((s, h) => s + h.value, 0) / 3;
  // Leak: high flow when pump/motor should be OFF
  if ((pumpStatus === 'OFF' && motorStatus === 'OFF') && avgFlow > 3) return true;
  // Leak: sudden spike - 3× the median
  const sorted = [...flowHistory.map(h => h.value)].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const current = flowHistory[flowHistory.length - 1].value;
  if (current > median * 3 && current > 20) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Tick function — slightly mutate sensor values each interval
// ---------------------------------------------------------------------------
export function tickSensorData(current) {
  const fluctuate = (val, max, min, step) =>
    Math.max(min, Math.min(max, val + (Math.random() - 0.49) * step));

  const soilMoisture = fluctuate(current.soilMoisture, 100, 0, 1.5);
  const waterLevel = fluctuate(current.waterLevel, 100, 0, 0.8);
  const flowRate = current.motorStatus === 'ON'
    ? fluctuate(current.flowRate, 25, 2, 1.2)
    : fluctuate(0.5, 2, 0, 0.3);
  const temperature = fluctuate(current.temperature, 45, 18, 0.3);

  // AUTO logic: pump on if moisture < threshold
  let pumpStatus = current.pumpStatus;
  if (current.mode === 'AUTO') {
    pumpStatus = soilMoisture < current.threshold ? 'ON' : 'OFF';
  }

  return {
    ...current,
    soilMoisture: Math.round(soilMoisture * 10) / 10,
    waterLevel: Math.round(waterLevel * 10) / 10,
    flowRate: Math.round(flowRate * 10) / 10,
    temperature: Math.round(temperature * 10) / 10,
    pumpStatus,
    leak: waterLevel > 10 && flowRate > 18,
    tankOverflow: waterLevel >= 95,
    lowWaterLevel: waterLevel <= 15,
  };
}

// ---------------------------------------------------------------------------
// Peak usage hour detection
// ---------------------------------------------------------------------------
export function detectPeakHour(hourlyUsage) {
  if (!hourlyUsage || !hourlyUsage.length) return '08:00';
  const peak = hourlyUsage.reduce((max, h) => h.value > max.value ? h : max, hourlyUsage[0]);
  return peak.time;
}

// ---------------------------------------------------------------------------
// Water usage comparison (today vs yesterday)
// ---------------------------------------------------------------------------
export function usageInsight(dailyHistory) {
  if (!dailyHistory || dailyHistory.length < 2) return null;
  const today = dailyHistory[dailyHistory.length - 1].usage;
  const yesterday = dailyHistory[dailyHistory.length - 2].usage;
  if (today === yesterday) return { diff: 0, label: 'Same as yesterday' };
  const diff = Math.abs(Math.round(((today - yesterday) / yesterday) * 100));
  if (today > yesterday) return { diff, label: `${diff}% more than yesterday`, up: true };
  return { diff, label: `${diff}% less than yesterday`, up: false };
}
