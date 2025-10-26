"use client";

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar
} from 'lucide-react';
import { showSuccess, showConfirm, showToast } from '../../lib/sweetalert';
import { SkeletonDashboard, SkeletonCard, Skeleton } from '../../components/ui/Skeleton';
import { useLoading } from '../../components/providers/LoadingProvider';
import { WeatherWidget, LoanChart } from '../../components/ui';
import { getDashboardStats, getRecentActivities, type DashboardStats, type RecentActivity } from '@/app/actions/dashboard';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { startLoading, stopLoading } = useLoading();

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      try {
        startLoading("กำลังโหลดข้อมูลแดชบอร์ด...");
        setError(null);
        
        // ดึงข้อมูลสถิติและกิจกรรมล่าสุดพร้อมกัน
        const [statsData, activitiesData] = await Promise.all([
          getDashboardStats(),
          getRecentActivities(10)
        ]);
        
        setDashboardStats(statsData);
        setRecentActivities(activitiesData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        showToast('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้', 'error');
      } finally {
        setIsLoading(false);
        stopLoading();
      }
    };

    loadData();
  }, []); // ลบ dependency ออกเพื่อป้องกันการ refresh ซ้ำ




  const handleDelete = async () => {
    const result = await showConfirm(
      'ยืนยันการลบ',
      'คุณต้องการลบรายการนี้หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้',
      'ลบ',
      'ยกเลิก'
    );
    
    if (result.isConfirmed) {
      startLoading("กำลังลบข้อมูล...");
      
      // Simulate delete delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      stopLoading();
      showSuccess('รายการถูกลบเรียบร้อยแล้ว');
    }
  };

  // Create stats cards from real data
  const createStatsCards = (stats: DashboardStats) => [
    {
      title: 'พนักงานทั้งหมด',
      value: stats.totalEmployees.toLocaleString(),
      change: `${stats.activeEmployees} ใช้งาน`,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'ทรัพย์สินทั้งหมด',
      value: stats.totalAssets.toLocaleString(),
      change: `${stats.activeAssets} ใช้งานได้`,
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      title: 'การยืมทั้งหมด',
      value: stats.totalLoans.toLocaleString(),
      change: `${stats.openLoans + stats.useLoans} กำลังยืม`,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'การยืมเกินกำหนด',
      value: stats.overdueLoans.toLocaleString(),
      change: stats.overdueLoans > 0 ? 'ต้องติดตาม' : 'ไม่มี',
      icon: Calendar,
      color: stats.overdueLoans > 0 ? 'bg-red-500' : 'bg-orange-500'
    }
  ];

  // Show skeleton loading while data is loading
  if (isLoading) {
    return <SkeletonDashboard />;
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="text-gray-600 mt-2">ยินดีต้อนรับกลับ! นี่คือสิ่งที่เกิดขึ้นวันนี้</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-red-500 text-sm">กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  // Show dashboard with real data
  if (!dashboardStats) {
    return <SkeletonDashboard />;
  }

  const stats = createStatsCards(dashboardStats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-600 mt-2">ยินดีต้อนรับกลับ! นี่คือสิ่งที่เกิดขึ้นวันนี้</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => showToast(`ค่า ${stat.value} เพิ่มขึ้น ${stat.change} จากเดือนที่แล้ว`, 'info')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change} จากเดือนที่แล้ว</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan Chart */}
        <div className="lg:col-span-1">
          <LoanChart />
        </div>

        {/* Weather Widget */}
        <div className="lg:col-span-1">
          <WeatherWidget />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
          <button
            onClick={handleDelete}
            className="text-sm text-red-600 hover:text-red-700"
          >
            ลบทั้งหมด
          </button>
        </div>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => {
              const timeAgo = new Date(activity.createdAt).toLocaleString('th-TH', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              return (
                <div 
                  key={activity.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${
                    activity.isRead ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                  onClick={() => showToast(activity.message, 'info')}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.isRead ? 'bg-gray-400' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{timeAgo}</p>
                  </div>
                  {!activity.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">ไม่มีกิจกรรมล่าสุด</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
