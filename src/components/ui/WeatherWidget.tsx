"use client";

import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, Eye } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  icon: string;
}

const weatherIcons = {
  'sunny': Sun,
  'cloudy': Cloud,
  'rainy': CloudRain,
  'snowy': CloudSnow,
};

const weatherConditions = {
  'sunny': { label: 'แดดจ้า', color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  'cloudy': { label: 'เมฆมาก', color: 'text-gray-500', bgColor: 'bg-gray-50' },
  'rainy': { label: 'ฝนตก', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  'snowy': { label: 'หิมะ', color: 'text-blue-200', bgColor: 'bg-blue-100' },
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate weather data fetch
    const fetchWeather = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock weather data
        const mockWeather: WeatherData = {
          temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
          condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
          humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
          windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
          visibility: Math.floor(Math.random() * 5) + 8, // 8-13 km
          icon: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
        };
        
        setWeather(mockWeather);
        setError(null);
      } catch {
        setError('ไม่สามารถโหลดข้อมูลสภาพอากาศได้');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh weather every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <Cloud className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500 text-sm">{error || 'ไม่พบข้อมูลสภาพอากาศ'}</p>
        </div>
      </div>
    );
  }

  const condition = weatherConditions[weather.condition as keyof typeof weatherConditions];
  const IconComponent = weatherIcons[weather.condition as keyof typeof weatherIcons] || Cloud;

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">สภาพอากาศ</h3>
        <div className={`p-2 rounded-lg ${condition.bgColor}`}>
          <IconComponent className={`${condition.color}`} size={20} />
        </div>
      </div>

      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {weather.temperature}°C
        </div>
        <div className={`text-sm font-medium ${condition.color}`}>
          {condition.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Droplets className="text-blue-500" size={14} />
          <span className="text-gray-600">ความชื้น</span>
          <span className="font-medium text-gray-900">{weather.humidity}%</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Wind className="text-gray-500" size={14} />
          <span className="text-gray-600">ลม</span>
          <span className="font-medium text-gray-900">{weather.windSpeed} km/h</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Eye className="text-gray-500" size={14} />
          <span className="text-gray-600">ทัศนวิสัย</span>
          <span className="font-medium text-gray-900">{weather.visibility} km</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Thermometer className="text-red-500" size={14} />
          <span className="text-gray-600">อุณหภูมิ</span>
          <span className="font-medium text-gray-900">{weather.temperature}°C</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
}
