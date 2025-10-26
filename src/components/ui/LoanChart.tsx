"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import { getMonthlyLoanData, type MonthlyLoanData } from '@/app/actions/dashboard';

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface LoanChartProps {
  year?: number;
}

export default function LoanChart({ year = new Date().getFullYear() }: LoanChartProps) {
  const [chartData, setChartData] = useState<MonthlyLoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(year);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMonthlyLoanData(selectedYear);
        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setError(error instanceof Error ? error.message : 'ไม่สามารถดึงข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);



  const chartOptions = {
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      fontFamily: 'Inter, sans-serif'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: chartData.map(item => item.month),
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: '#374151'
        }
      }
    },
    yaxis: {
      title: {
        text: 'จำนวนการยืม',
        style: {
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          colors: '#374151'
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          colors: '#374151'
        }
      }
    },
    fill: {
      opacity: 1,
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E']
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
        color: '#000000'
      },
      y: {
        formatter: function (val: number) {
          return val + " การยืม"
        }
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4
    },
    colors: ['#3B82F6'],
    theme: {
      mode: 'light' as const,
      palette: 'palette1',
      monochrome: {
        enabled: false,
        color: '#3B82F6',
        shadeTo: 'light' as const,
        shadeIntensity: 0.65
      }
    }
  };

  const series = [{
    name: 'จำนวนการยืม',
    data: chartData.map(item => item.count)
  }];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">จำนวนการยืมในแต่ละเดือน</h3>
        </div>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">จำนวนการยืมในแต่ละเดือน</h3>
        </div>
        <div className="h-64 bg-red-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  // สร้างรายการปีให้เลือก (5 ปีย้อนหลัง)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <style jsx global>{`
        .apexcharts-toolbar {
          color: #374151 !important;
        }
        .apexcharts-toolbar svg {
          fill: #374151 !important;
        }
        .apexcharts-toolbar .apexcharts-toolbar-icon {
          color: #374151 !important;
        }
        .apexcharts-toolbar .apexcharts-toolbar-icon svg {
          fill: #374151 !important;
        }
        .apexcharts-menu {
          background: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
        .apexcharts-menu-item {
          color: #374151 !important;
        }
        .apexcharts-menu-item:hover {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }
        .apexcharts-legend {
          color: #374151 !important;
        }
        .apexcharts-legend-text {
          color: #374151 !important;
        }
        .apexcharts-tooltip {
          color: #000000 !important;
        }
        .apexcharts-tooltip .apexcharts-tooltip-text {
          color: #000000 !important;
        }
        .apexcharts-tooltip .apexcharts-tooltip-text-y-label {
          color: #000000 !important;
        }
        .apexcharts-tooltip .apexcharts-tooltip-text-y-value {
          color: #000000 !important;
        }
      `}</style>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">จำนวนการยืมในแต่ละเดือน</h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

      </div>
      
      <div className="h-64">
        {typeof window !== 'undefined' && (
          <Chart
            options={chartOptions}
            series={series}
            type="bar"
            height={350}
          />
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>แสดงจำนวนการยืมในแต่ละเดือนของปี {selectedYear}</p>
        <p>รวมทั้งหมด: {chartData.reduce((sum, item) => sum + item.count, 0)} การยืม</p>
      </div>
    </div>
  );
}
