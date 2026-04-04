import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Droplets, Wind, Eye, Thermometer, Gauge, Sun, RefreshCw, MapPin, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { WeatherService, WeatherData, ForecastItem, DailyForecast } from '../services/weatherService';

interface WeatherWidgetProps {
  location: string;
  lat?: number;
  lon?: number;
  className?: string;
  showDetails?: boolean;
}

export function WeatherWidget({ location, lat, lon, className = '', showDetails = true }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'temp' | 'precip' | 'wind'>('temp');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWeatherData();
  }, [location, lat, lon]);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      const coords = (lat !== undefined && lon !== undefined) ? { lat, lon } : undefined;
      const weatherData = await WeatherService.getWeatherData(location, coords);
      setWeather(weatherData);
    } catch (err) {
      setError('Failed to load weather data');
      console.error('Weather loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadWeatherData();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className} animate-pulse`}>
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-gray-600 font-medium text-lg">Loading local weather...</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-gray-800 mb-2">Weather data unavailable</h4>
          <p className="text-gray-600 mb-6 max-w-xs mx-auto">We couldn't fetch weather for "{location}". {error || 'Please check your connection.'}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-all flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const isDataUnavailable = weather.temperature === '--';

  // Graph Data
  const hourlyData = weather.hourly || [];
  const maxHourlyTemp = Math.max(...hourlyData.map(h => h.temp), 1);
  const minHourlyTemp = Math.min(...hourlyData.map(h => h.temp), 0);
  const range = maxHourlyTemp - minHourlyTemp || 10;

  return (
    <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 ${className}`}>
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 opacity-80" />
            <h2 className="text-2xl font-bold tracking-tight">{weather.location}</h2>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-white/20 rounded-full transition-transform active:scale-95"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        <p className="text-blue-100 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' })} • {weather.condition}
        </p>
      </div>

      {isDataUnavailable ? (
        <div className="p-12 text-center flex flex-col items-center">
          <AlertCircle className="w-16 h-16 text-blue-400 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Local Weather Station Offline</h3>
          <p className="text-gray-500 mb-8 max-w-sm text-lg">
            Detailed forecast for this specific beach is currently unavailable. 
            We're showing general regional data instead.
          </p>
          <div className="flex items-center space-x-4 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
             <div className="text-lg font-bold text-blue-600">Showing: Regional Overview</div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-center">
            <div className="flex items-center space-x-6">
              <span className="text-8xl select-none" title={weather.condition}>{weather.icon}</span>
              <div>
                <div className="flex items-start">
                  <span className="text-7xl font-bold text-gray-900 tracking-tighter">
                    {weather.temperature}
                  </span>
                  <span className="text-3xl font-medium text-gray-500 mt-2 ml-1">°C</span>
                </div>
                <div className="text-xl text-gray-600 font-medium capitalize mt-1">
                  {weather.condition}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-gray-50 rounded-2xl p-5 border border-gray-100">
               <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Precipitation</span>
                  <div className="flex items-center text-gray-800 font-semibold">
                    <Droplets className="w-4 h-4 mr-2 text-blue-500" />
                    {weather.precipitation}%
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Humidity</span>
                  <div className="flex items-center text-gray-800 font-semibold">
                    <Droplets className="w-4 h-4 mr-2 text-cyan-500" />
                    {weather.humidity}%
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Wind</span>
                  <div className="flex items-center text-gray-800 font-semibold">
                    <Wind className="w-4 h-4 mr-2 text-teal-500" />
                    {weather.windSpeed} km/h
                  </div>
               </div>
               <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Pressure</span>
                  <div className="flex items-center text-gray-800 font-semibold">
                    <Gauge className="w-4 h-4 mr-2 text-purple-500" />
                    {weather.pressure} hPa
                  </div>
               </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mb-4 border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('temp')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'temp' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Temperature
              {activeTab === 'temp' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('precip')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'precip' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Precipitation
              {activeTab === 'precip' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('wind')}
              className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'wind' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Wind
              {activeTab === 'wind' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
            </button>
          </div>

          {/* Hourly Forecast & Graph */}
          <div className="relative mb-8 group">
            <div 
              ref={scrollRef}
              className="flex items-end space-x-0 overflow-x-auto pb-4 no-scrollbar"
              style={{ height: '180px' }}
            >
              {activeTab === 'temp' && (
                <div className="absolute top-8 left-0 right-0 pointer-events-none px-4">
                  <svg className="w-full h-24 overflow-visible" viewBox="0 0 800 100" preserveAspectRatio="none">
                    <path
                      d={`M ${hourlyData.map((h, i) => `${i * 100 + 50},${80 - ((h.temp - minHourlyTemp) / range) * 60}`).join(' L ')}`}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {hourlyData.map((h, i) => (
                      <circle 
                        key={i}
                        cx={i * 100 + 50} 
                        cy={80 - ((h.temp - minHourlyTemp) / range) * 60} 
                        r="4" 
                        fill="#3b82f6"
                        stroke="white"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                </div>
              )}

              {hourlyData.map((hour, idx) => (
                <div key={idx} className="flex-shrink-0 w-24 flex flex-col items-center justify-between h-full pt-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {idx === 0 ? 'Now' : new Date(hour.timestamp).getHours() + ':00'}
                  </span>
                  <div className="text-2xl my-2 select-none">{hour.icon}</div>
                  <div className="mt-auto h-24 flex flex-col items-center justify-center">
                    {activeTab === 'temp' && (
                      <span className="text-sm font-bold text-gray-800 z-10">{hour.temp}°</span>
                    )}
                    {activeTab === 'precip' && (
                      <span className="text-xs font-bold text-blue-600">{hour.pop}%</span>
                    )}
                    {activeTab === 'wind' && (
                      <span className="text-[10px] font-bold text-teal-600">{weather.windSpeed}k</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Forecast Row */}
          <div className="bg-gray-50 rounded-2xl p-2 border border-gray-100">
            <div className="flex items-center overflow-x-auto no-scrollbar">
              {weather.daily?.map((day, idx) => (
                <div 
                  key={idx} 
                  className={`flex-shrink-0 w-1/5 min-w-[80px] p-4 flex flex-col items-center border-r last:border-0 border-gray-200 transition-colors hover:bg-white rounded-xl ${idx === 0 ? 'bg-blue-50/50' : ''}`}
                >
                  <span className="text-xs font-bold text-gray-600 uppercase mb-2">
                    {idx === 0 ? 'Today' : day.dayName}
                  </span>
                  <span className="text-3xl mb-3 select-none">{day.icon}</span>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-900">{day.maxTemp}°</span>
                    <span className="text-xs font-medium text-gray-500">{day.minTemp}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-gray-400 px-2 font-medium">
             <span>Data provided by OpenWeatherMap</span>
             <span>Last sync: {new Date(weather.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact weather widget for smaller spaces (Sidebar/Cards)
export function CompactWeatherWidget({ location, className = '' }: { location: string; className?: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeatherData();
  }, [location]);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const weatherData = await WeatherService.getWeatherData(location);
      setWeather(weatherData);
    } catch (err) {
      console.error('Weather loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow p-4 ${className} animate-pulse`}>
         <div className="h-10 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (!weather || weather.temperature === '--') {
    return (
      <div className={`bg-gray-50 rounded-2xl p-4 flex items-center space-x-3 border border-gray-100 ${className}`}>
        <AlertCircle className="w-5 h-5 text-gray-400" />
        <span className="text-xs font-bold text-gray-500">Weather unavailable</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-md border border-gray-50 flex items-center justify-between hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-center space-x-3">
        <span className="text-3xl select-none">{weather.icon}</span>
        <div>
          <div className="text-xl font-bold text-gray-900">{weather.temperature}°C</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{weather.condition}</div>
        </div>
      </div>
      <div className="text-right flex flex-col justify-center border-l border-gray-100 pl-4 h-8">
        <div className="text-[10px] font-bold text-gray-400">NEXT 24H</div>
        <div className="text-xs font-black text-blue-600">
          {weather.hourly && weather.hourly[0] ? `${weather.hourly[0].temp}°` : '--'}
          <ChevronRight className="w-3 h-3 inline ml-1 opacity-50" />
        </div>
      </div>
    </div>
  );
}
