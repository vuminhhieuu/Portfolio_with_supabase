import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BookingStats = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchStats();
    fetchRevenueData();
  }, [period]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('status, service, price');

      if (error) throw error;

      const stats = {
        total: data.length,
        completed: data.filter(b => b.status === 'completed').length,
        cancelled: data.filter(b => b.status === 'cancelled').length,
        pending: data.filter(b => b.status === 'pending').length,
        confirmed: data.filter(b => b.status === 'confirmed').length,
        totalRevenue: data.reduce((sum, b) => sum + (b.price || 0), 0),
        byService: {}
      };

      // Group by service
      data.forEach(booking => {
        if (!stats.byService[booking.service]) {
          stats.byService[booking.service] = {
            count: 0,
            revenue: 0
          };
        }
        stats.byService[booking.service].count++;
        stats.byService[booking.service].revenue += booking.price || 0;
      });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const { data, error } = await supabase
        .from('revenue_tracking')
        .select('*')
        .eq('period_type', period)
        .order('period_start', { ascending: true })
        .limit(12);

      if (error) throw error;

      const chartData = {
        labels: data.map(d => formatDate(d.period_start)),
        datasets: [
          {
            label: 'Doanh Thu',
            data: data.map(d => d.total_revenue),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Số Lượng Đặt Lịch',
            data: data.map(d => d.total_bookings),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      };

      setRevenueData(chartData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    switch (period) {
      case 'monthly':
        return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      case 'weekly':
        return `Tuần ${getWeekNumber(date)}`;
      case 'daily':
        return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
      default:
        return dateString;
    }
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) return <div>Đang tải thống kê...</div>;
  if (!stats) return null;

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Thống Kê Đặt Lịch</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
        >
          <option value="monthly">Theo Tháng</option>
          <option value="weekly">Theo Tuần</option>
          <option value="daily">Theo Ngày</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-sm text-gray-400">Tổng số</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-sm text-green-400">Hoàn thành</p>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-sm text-yellow-400">Chờ xử lý</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-sm text-red-400">Đã hủy</p>
          <p className="text-2xl font-bold text-red-400">{stats.cancelled}</p>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-semibold mb-3">Tổng Doanh Thu</h4>
        <p className="text-3xl font-bold text-green-400">
          {formatCurrency(stats.totalRevenue)}
        </p>
      </div>

      {revenueData && (
        <div className="mb-8 bg-gray-800 p-4 rounded">
          <h4 className="font-semibold mb-4">Biểu Đồ Doanh Thu</h4>
          <Line data={revenueData} />
        </div>
      )}

      <div>
        <h4 className="font-semibold mb-3">Theo Dịch Vụ</h4>
        <div className="space-y-2">
          {Object.entries(stats.byService).map(([service, data]) => (
            <div key={service} className="bg-gray-800 p-3 rounded">
              <div className="flex justify-between items-center">
                <span>{service}</span>
                <span className="font-semibold">{data.count} lượt</span>
              </div>
              <div className="text-sm text-green-400 mt-1">
                Doanh thu: {formatCurrency(data.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingStats;