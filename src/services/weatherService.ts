// Weather service for fetching live weather data
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  icon: string;
  timestamp: number;
}

export interface WeatherError {
  message: string;
  code: string;
}

// OpenWeatherMap API configuration
const API_KEY = '1087a37ed1ba2f0c9527657c587361c2'; // You'll need to get this from OpenWeatherMap
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Fallback weather data for demo purposes
const FALLBACK_WEATHER: WeatherData = {
  location: 'Unknown',
  temperature: 25,
  condition: 'Clear',
  description: 'Clear sky',
  humidity: 60,
  windSpeed: 5,
  pressure: 1013,
  visibility: 10,
  uvIndex: 3,
  icon: '01d',
  timestamp: Date.now()
};

// Weather condition mapping
const WEATHER_CONDITIONS: Record<string, { icon: string; description: string }> = {
  'clear': { icon: '☀️', description: 'Clear sky' },
  'clouds': { icon: '☁️', description: 'Cloudy' },
  'rain': { icon: '🌧️', description: 'Rainy' },
  'drizzle': { icon: '🌦️', description: 'Drizzle' },
  'thunderstorm': { icon: '⛈️', description: 'Thunderstorm' },
  'snow': { icon: '❄️', description: 'Snow' },
  'mist': { icon: '🌫️', description: 'Misty' },
  'fog': { icon: '🌫️', description: 'Foggy' },
  'haze': { icon: '🌫️', description: 'Hazy' },
  'dust': { icon: '💨', description: 'Dusty' },
  'sand': { icon: '💨', description: 'Sandy' },
  'ash': { icon: '🌋', description: 'Ash' },
  'squall': { icon: '💨', description: 'Squall' },
  'tornado': { icon: '🌪️', description: 'Tornado' }
};

export class WeatherService {
  private static cache = new Map<string, { data: WeatherData; timestamp: number }>();
  private static CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Get weather data for a location
  static async getWeatherData(location: string): Promise<WeatherData> {
    try {
      // Check cache first
      const cached = this.cache.get(location);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // For demo purposes, return mock data
      // In production, you would use the OpenWeatherMap API
      const weatherData = await this.getMockWeatherData(location);

      // Cache the result
      this.cache.set(location, { data: weatherData, timestamp: Date.now() });

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return { ...FALLBACK_WEATHER, location };
    }
  }

  // Mock weather data for demo purposes
  private static async getMockWeatherData(location: string): Promise<WeatherData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate realistic weather data based on location
    const conditions = Object.keys(WEATHER_CONDITIONS);
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const conditionData = WEATHER_CONDITIONS[randomCondition];

    // Generate temperature based on location (rough approximation)
    let baseTemp = 25; // Default temperature
    if (location.toLowerCase().includes('himalaya') || location.toLowerCase().includes('sikkim') || location.toLowerCase().includes('ladakh')) {
      baseTemp = 5; // Cold regions
    } else if (location.toLowerCase().includes('rajasthan') || location.toLowerCase().includes('gujarat')) {
      baseTemp = 35; // Hot regions
    } else if (location.toLowerCase().includes('kerala') || location.toLowerCase().includes('goa')) {
      baseTemp = 28; // Coastal regions
    }

    const temperature = baseTemp + Math.floor(Math.random() * 10) - 5;
    const humidity = 40 + Math.floor(Math.random() * 40);
    const windSpeed = Math.floor(Math.random() * 15) + 2;
    const pressure = 1000 + Math.floor(Math.random() * 30);
    const visibility = 5 + Math.floor(Math.random() * 10);
    const uvIndex = Math.floor(Math.random() * 8) + 1;

    return {
      location,
      temperature,
      condition: conditionData.description,
      description: conditionData.description,
      humidity,
      windSpeed,
      pressure,
      visibility,
      uvIndex,
      icon: conditionData.icon,
      timestamp: Date.now()
    };
  }

  // Get weather icon based on condition
  static getWeatherIcon(condition: string): string {
    const normalizedCondition = condition.toLowerCase();
    for (const [key, value] of Object.entries(WEATHER_CONDITIONS)) {
      if (normalizedCondition.includes(key)) {
        return value.icon;
      }
    }
    return '☀️'; // Default icon
  }

  // Format temperature
  static formatTemperature(temp: number): string {
    return `${Math.round(temp)}°C`;
  }

  // Format wind speed
  static formatWindSpeed(speed: number): string {
    return `${speed} km/h`;
  }

  // Format pressure
  static formatPressure(pressure: number): string {
    return `${pressure} hPa`;
  }

  // Format visibility
  static formatVisibility(visibility: number): string {
    return `${visibility} km`;
  }

  // Get UV index description
  static getUVIndexDescription(uvIndex: number): string {
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
