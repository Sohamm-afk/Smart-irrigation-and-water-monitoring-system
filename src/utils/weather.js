// Weather utility using Open-Meteo (free, no API key required)
// Default location: Mumbai, India

const MUMBAI_LAT = 19.0760;
const MUMBAI_LON = 72.8777;
const CACHE_KEY = 'swms_weather';
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

export async function fetchWeather(lat = MUMBAI_LAT, lon = MUMBAI_LON) {
  // Check cache first
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  } catch {}

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=precipitation_sum,weathercode,temperature_2m_max,temperature_2m_min` +
      `&current_weather=true&timezone=Asia%2FKolkata&forecast_days=3`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');
    const json = await res.json();

    const data = {
      current: json.current_weather,
      today: {
        code: json.daily.weathercode[0],
        precip: json.daily.precipitation_sum[0],
        maxTemp: json.daily.temperature_2m_max[0],
        minTemp: json.daily.temperature_2m_min[0],
      },
      tomorrow: {
        code: json.daily.weathercode[1],
        precip: json.daily.precipitation_sum[1],
        maxTemp: json.daily.temperature_2m_max[1],
      },
      dayAfter: {
        code: json.daily.weathercode[2],
        precip: json.daily.precipitation_sum[2],
        maxTemp: json.daily.temperature_2m_max[2],
      },
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    return data;
  } catch (err) {
    console.warn('Weather fetch failed, using fallback:', err.message);
    // Fallback data for demo
    return {
      current: { temperature: 31, windspeed: 14, weathercode: 0 },
      today: { code: 0, precip: 0, maxTemp: 34, minTemp: 26 },
      tomorrow: { code: 80, precip: 12.5, maxTemp: 29 },
      dayAfter: { code: 61, precip: 5, maxTemp: 28 },
    };
  }
}

// Map WMO weather code to label and emoji
export function weatherCodeLabel(code) {
  if (code <= 3)  return { label: 'Clear / Partly Cloudy', icon: '☀️', rainy: false };
  if (code <= 49) return { label: 'Foggy / Hazy', icon: '🌫️', rainy: false };
  if (code <= 69) return { label: 'Drizzle / Rain', icon: '🌧️', rainy: true };
  if (code <= 79) return { label: 'Snow / Sleet', icon: '❄️', rainy: false };
  if (code <= 99) return { label: 'Rain Showers', icon: '⛈️', rainy: true };
  return { label: 'Unknown', icon: '🌡️', rainy: false };
}

// Should we skip irrigation?
export function shouldSkipIrrigation(weather) {
  if (!weather) return false;
  return (
    weather.today?.precip > 2 ||
    weather.tomorrow?.precip > 5
  );
}
