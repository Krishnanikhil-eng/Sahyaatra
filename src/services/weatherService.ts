// Weather service for fetching live weather data
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

export interface WeatherError {
  message: string;
  code: string;
}

// OpenWeatherMap API configuration
const API_KEY = (import.meta.env as any)?.VITE_OPENWEATHER_API_KEY || 'f91a99c76fe1f3dabb0b977a520d752f'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Weather condition mapping to emojis
const WEATHER_EMOJIS: Record<string, string> = {
  'clear': '☀️',
  'clouds': '☁️',
  'rain': '🌧️',
  'drizzle': '🌦️',
  'thunderstorm': '⛈️',
  'snow': '❄️',
  'mist': '🌫️',
  'fog': '🌫️',
  'haze': '🌫️',
  'smoke': '🌫️',
  'dust': '🌫️',
  'sand': '🌫️',
  'ash': '🌫️',
  'squall': '💨',
  'tornado': '🌪️'
};

export class WeatherService {
  private static cache = new Map<string, { data: WeatherData; timestamp: number }>();
  private static CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  // Normalize location input
  private static normalizeLocation(location: string): string {
    if (!location) return 'Unknown';
    let normalized = location.split(',')[0].trim();
    if (normalized.toLowerCase().includes('jammu') && normalized.toLowerCase().includes('kashmir')) {
      return 'Jammu';
    }
    return normalized;
  }

  // Get dynamic fallback weather
  private static getFallbackWeather(location: string): WeatherData {
    return {
      location: location || 'Unknown',
      temperature: '--',
      condition: 'Unavailable',
      description: 'Weather data could not be fetched',
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

  // Get emoji based on condition
  static getWeatherIcon(condition: string): string {
    const normalizedCondition = condition.toLowerCase();
    for (const [key, emoji] of Object.entries(WEATHER_EMOJIS)) {
      if (normalizedCondition.includes(key)) {
        return emoji;
      }
    }
    return '🌍';
  }

  // Get weather data for a location (Current + Forecast)
  static async getWeatherData(location: string): Promise<WeatherData> {
    const originalLocation = location;
    const normalizedLoc = this.normalizeLocation(location);

    try {
      // Check cache first
      const cached = this.cache.get(normalizedLoc);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // 1. Fetch Current Weather
      const currentRes = await fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(normalizedLoc)}&appid=${API_KEY}&units=metric`
      );

      if (!currentRes.ok) throw new Error(`Current API error: ${currentRes.statusText}`);
      const currentData = await currentRes.json();

      // 2. Fetch Forecast Data (5 day / 3 hour)
      const forecastRes = await fetch(
        `${BASE_URL}/forecast?q=${encodeURIComponent(normalizedLoc)}&appid=${API_KEY}&units=metric`
      );

      let hourly: ForecastItem[] = [];
      let daily: DailyForecast[] = [];

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        
        // Map Hourly (next 24 hours)
        hourly = forecastData.list.slice(0, 8).map((item: any) => ({
          timestamp: item.dt * 1000,
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          icon: this.getWeatherIcon(item.weather[0].main),
          pop: Math.round(item.pop * 100)
        }));

        // Group into Daily
        const dailyGroups: Record<string, any[]> = {};
        forecastData.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000).toLocaleDateString();
          if (!dailyGroups[date]) dailyGroups[date] = [];
          dailyGroups[date].push(item);
        });

        daily = Object.keys(dailyGroups).slice(0, 5).map(dateStr => {
          const dayItems = dailyGroups[dateStr];
          const temps = dayItems.map(i => i.main.temp);
          const dateObj = new Date(dayItems[0].dt * 1000);
          
          return {
            date: dateStr,
            dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
            minTemp: Math.round(Math.min(...temps)),
            maxTemp: Math.round(Math.max(...temps)),
            condition: dayItems[Math.floor(dayItems.length / 2)].weather[0].main,
            icon: this.getWeatherIcon(dayItems[Math.floor(dayItems.length / 2)].weather[0].main)
          };
        });
      }
      
      const weatherData: WeatherData = {
        location: currentData.name,
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6),
        pressure: currentData.main.pressure,
        visibility: Math.round(currentData.visibility / 1000),
        uvIndex: 0,
        precipitation: hourly[0]?.pop || 0,
        icon: this.getWeatherIcon(currentData.weather[0].main),
        timestamp: Date.now(),
        hourly,
        daily
      };

      this.cache.set(normalizedLoc, { data: weatherData, timestamp: Date.now() });
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return this.getFallbackWeather(originalLocation);
    }
  }

  // Helper to format day name
  static formatDay(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', { weekday: 'short' });
  }

  // Format temperature
  static formatTemperature(temp: number | string): string {
    if (typeof temp === 'string') return temp;
    return `${temp}°C`;
  }

  // Format wind speed
  static formatWindSpeed(speed: number): string {
    if (speed === 0) return '-- km/h';
    return `${speed} km/h`;
  }

  // Format pressure
  static formatPressure(pressure: number): string {
    if (pressure === 0) return '-- hPa';
    return `${pressure} hPa`;
  }

  // Format visibility
  static formatVisibility(visibility: number): string {
    if (visibility === 0) return '-- km';
    return `${visibility} km`;
  }

  // Get UV index description
  static getUVIndexDescription(uvIndex: number): string {
    if (uvIndex === 0) return 'N/A';
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  }

  // Clear cache
  static clearCache(): void {
    this.cache.clear();
  }
}
