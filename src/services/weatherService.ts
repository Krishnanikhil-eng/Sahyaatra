/**
 * Weather service for fetching high-precision live weather data using Open-Meteo.
 */
export interface ForecastItem {
  timestamp: number;
  temp: number;
  condition: string;
  icon: string;
  pop: number; // Probability of precipitation
}

export interface DailyForecast {
  date: string;
  dayName: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  icon: string;
}

export interface WeatherData {
  location: string;
  temperature: number | string;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  precipitation: number;
  icon: string;
  timestamp: number;
  hourly?: ForecastItem[];
  daily?: DailyForecast[];
}

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * WMO Weather interpretation codes (WW)
 * https://open-meteo.com/en/docs
 */
const WMO_MAP: Record<number, { condition: string; description: string; emojiDay: string; emojiNight: string }> = {
  0: { condition: 'Clear', description: 'Clear sky', emojiDay: '☀️', emojiNight: '🌙' },
  1: { condition: 'Mainly Clear', description: 'Mainly clear', emojiDay: '🌤️', emojiNight: '🌙' },
  2: { condition: 'Partly Cloudy', description: 'Partly cloudy', emojiDay: '⛅', emojiNight: '☁️' },
  3: { condition: 'Overcast', description: 'Overcast', emojiDay: '☁️', emojiNight: '☁️' },
  45: { condition: 'Mist', description: 'Fog', emojiDay: '🌫️', emojiNight: '🌫️' },
  48: { condition: 'Mist', description: 'Depositing rime fog', emojiDay: '🌫️', emojiNight: '🌫️' },
  51: { condition: 'Drizzle', description: 'Light drizzle', emojiDay: '🌦️', emojiNight: '🌦️' },
  53: { condition: 'Drizzle', description: 'Moderate drizzle', emojiDay: '🌦️', emojiNight: '🌦️' },
  55: { condition: 'Drizzle', description: 'Dense drizzle', emojiDay: '🌦️', emojiNight: '🌦️' },
  61: { condition: 'Rain', description: 'Slight rain', emojiDay: '🌧️', emojiNight: '🌧️' },
  63: { condition: 'Rain', description: 'Moderate rain', emojiDay: '🌧️', emojiNight: '🌧️' },
  65: { condition: 'Rain', description: 'Heavy rain', emojiDay: '🌧️', emojiNight: '🌧️' },
  80: { condition: 'Rain', description: 'Slight rain showers', emojiDay: '🌧️', emojiNight: '🌧️' },
  81: { condition: 'Rain', description: 'Moderate rain showers', emojiDay: '🌧️', emojiNight: '🌧️' },
  82: { condition: 'Rain', description: 'Violent rain showers', emojiDay: '🌧️', emojiNight: '🌧️' },
  95: { condition: 'Thunderstorm', description: 'Thunderstorm', emojiDay: '⛈️', emojiNight: '⛈️' },
  96: { condition: 'Thunderstorm', description: 'Thunderstorm with slight hail', emojiDay: '⛈️', emojiNight: '⛈️' },
  99: { condition: 'Thunderstorm', description: 'Thunderstorm with heavy hail', emojiDay: '⛈️', emojiNight: '⛈️' },
};

export class WeatherService {
  private static cache = new Map<string, { data: WeatherData; timestamp: number }>();
  private static CACHE_DURATION = 60 * 60 * 1000; // 60 minutes strictly

  /**
   * Get weather data for a location using precise latitude and longitude.
   * If coordinates are missing, it returns a safe "Unavailable" state without an API call.
   */
  static async getWeatherData(location: string, coords?: { lat: number, lon: number }): Promise<WeatherData> {
    // 1. Strict Coordinate Check
    if (!coords || coords.lat === undefined || coords.lon === undefined) {
      console.warn(`Weather skipped: No coordinates for location "${location}".`);
      return this.getFallbackWeather(location, 'Missing Coordinates');
    }

    const { lat, lon } = coords;
    const cacheKey = `${lat}-${lon}`;

    try {
      // 2. Check 60-min cache
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // 3. Construct API Request
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current: 'temperature_2m,weather_code,wind_speed_10m,is_day',
        hourly: 'temperature_2m,precipitation_probability,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto',
        windspeed_unit: 'kmh'
      });

      const res = await fetch(`${BASE_URL}?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch Open-Meteo data`);
      
      const data = await res.json();
      if (!data.current) throw new Error('Invalid response format: Missing current data');

      // 4. Transform Current Data
      const current = data.current;
      const currentWmo = WMO_MAP[current.weather_code] || { condition: 'Unknown', description: 'Unknown', emojiDay: '🌍', emojiNight: '🌍' };
      
      // 5. Transform Hourly Data (Timeline)
      // Find the index that corresponds to the current hour
      const now = new Date();
      const currentHourUTC = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime();
      
      let startIndex = data.hourly.time.findIndex((t: string) => new Date(t).getTime() >= currentHourUTC);
      if (startIndex === -1) startIndex = 0;

      const hourly: ForecastItem[] = data.hourly.time.slice(startIndex, startIndex + 12).map((time: string, idx: number) => {
        const absoluteIdx = startIndex + idx;
        const hWmo = WMO_MAP[data.hourly.weather_code[absoluteIdx]] || { condition: 'Cloudy', emojiDay: '☁️' };
        const hTime = new Date(time);
        const hIsDay = hTime.getHours() >= 6 && hTime.getHours() <= 18;
        
        return {
          timestamp: hTime.getTime(),
          temp: Math.round(data.hourly.temperature_2m[absoluteIdx]),
          condition: hWmo.condition,
          icon: hIsDay ? hWmo.emojiDay : (hWmo.emojiNight || hWmo.emojiDay),
          pop: Math.round(data.hourly.precipitation_probability[absoluteIdx])
        };
      });

      // 6. Transform Daily Data
      const daily: DailyForecast[] = data.daily.time.slice(0, 5).map((time: string, idx: number) => {
        const dWmo = WMO_MAP[data.daily.weather_code[idx]] || { condition: 'Cloudy', emojiDay: '☁️' };
        const dDate = new Date(time);
        
        return {
          date: time,
          dayName: dDate.toLocaleDateString('en-US', { weekday: 'short' }),
          minTemp: Math.round(data.daily.temperature_2m_min[idx]),
          maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
          condition: dWmo.condition,
          icon: dWmo.emojiDay
        };
      });

      // 7. Assemble WeatherData Object
      const weatherData: WeatherData = {
        location: location,
        temperature: Math.round(current.temperature_2m),
        condition: currentWmo.condition,
        description: currentWmo.description,
        humidity: data.hourly.relative_humidity_2m ? data.hourly.relative_humidity_2m[0] : 0, 
        windSpeed: Math.round(current.wind_speed_10m),
        pressure: Math.round(data.hourly.pressure_msl ? data.hourly.pressure_msl[0] : 1013),
        visibility: 10, // Default to 10km for now as Open-Meteo needs specific models for visibility
        uvIndex: 0,
        precipitation: Math.round(data.daily.precipitation_probability_max[0]),
        icon: current.is_day ? currentWmo.emojiDay : (currentWmo.emojiNight || currentWmo.emojiDay),
        timestamp: Date.now(),
        hourly,
        daily
      };

      // 8. Cache for 60m
      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      return weatherData;

    } catch (error) {
      console.error('Weather Service Error:', error);
      return this.getFallbackWeather(location, 'Weather Service Restricted');
    }
  }

  /**
   * Returns a safe "Weather Unavailable" UI state without crashing.
   */
  private static getFallbackWeather(location: string, reason: string): WeatherData {
    return {
      location,
      temperature: '--',
      condition: 'Unavailable',
      description: reason,
      humidity: 0,
      windSpeed: 0,
      pressure: 0,
      visibility: 0,
      uvIndex: 0,
      precipitation: 0,
      icon: '⚠️',
      timestamp: Date.now(),
      hourly: [],
      daily: []
    };
  }

  // Formatting helpers to maintain UI consistency
  static formatTemperature(temp: number | string): string {
    if (typeof temp === 'string') return temp;
    return `${temp}°C`;
  }

  static formatWindSpeed(speed: number): string {
    return speed === 0 ? '-- km/h' : `${speed} km/h`;
  }

  static formatPressure(pressure: number): string {
    return pressure === 0 ? '-- hPa' : `${pressure} hPa`;
  }

  static formatVisibility(visibility: number): string {
    return visibility === 0 ? '-- km' : `${visibility} km`;
  }

  static clearCache(): void {
    this.cache.clear();
  }
}


