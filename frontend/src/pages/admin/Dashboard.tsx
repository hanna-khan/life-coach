import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import AnimatedContainer from '../../components/Animation/AnimatedContainer.tsx';
import { fadeInUp, scaleIn, chartAnimation } from '../../utils/animations.ts';
import LoadingSpinner from '../../components/Animation/LoadingSpinner.tsx';
import toast from 'react-hot-toast';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = API_BASE + (API_BASE.endsWith('/api') ? '' : '/api');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0, // From User table
    totalBlogs: 0, // From Blog table
    totalBookings: 0, // From Booking table
    totalRevenue: 0, // All-time revenue from Booking table
    monthlyRevenue: 0, // Current month revenue from Booking table
    monthlyGrowth: 0,
    activeUsers: 0,
    pendingBookings: 0, // From Booking table
    confirmedBookings: 0, // From Booking table
    publishedBlogs: 0, // From Blog table
    draftBlogs: 0, // From Blog table
    totalContacts: 0,
    newContacts: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);
  const [bookingStatusData, setBookingStatusData] = useState({
    completed: 0,
    pending: 0,
    cancelled: 0
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const config = {
          headers: { 'x-auth-token': token }
        };
        
        const [dashboardRes, analyticsRes] = await Promise.all([
          axios.get(`${API_URL}/admin/dashboard`, config),
          axios.get(`${API_URL}/admin/analytics`, config)
        ]);

        if (dashboardRes.data.success) {
          const dashboardData = dashboardRes.data.dashboard;
          const statsData = dashboardData.stats;

          setStats({
            totalUsers: statsData.totalUsers || 0, // From User table
            totalBlogs: statsData.totalBlogs || 0, // From Blog table
            totalBookings: statsData.totalBookings || 0, // From Booking table
            totalRevenue: statsData.totalRevenue || statsData.monthlyRevenue || 0, // All-time revenue from Booking table
            monthlyRevenue: statsData.monthlyRevenue || 0, // Current month revenue from Booking table
            monthlyGrowth: statsData.monthlyGrowth || 0,
            activeUsers: statsData.totalUsers || 0,
            pendingBookings: statsData.pendingBookings || 0, // From Booking table
            confirmedBookings: statsData.confirmedBookings || 0, // From Booking table
            publishedBlogs: statsData.publishedBlogs || 0, // From Blog table
            draftBlogs: statsData.draftBlogs || 0, // From Blog table
            totalContacts: statsData.totalContacts || 0,
            newContacts: statsData.newContacts || 0
          });

          // Set recent bookings
          if (dashboardData.recentActivities?.bookings) {
            setRecentBookings(dashboardData.recentActivities.bookings);
          }

          // Use booking status breakdown from API
          if (statsData.bookingStatusBreakdown) {
            setBookingStatusData({
              completed: statsData.bookingStatusBreakdown.completed || 0,
              pending: statsData.bookingStatusBreakdown.pending || 0,
              cancelled: statsData.bookingStatusBreakdown.cancelled || 0
            });
          } else {
            // Fallback calculation
            const total = statsData.totalBookings || 0;
            const pending = statsData.pendingBookings || 0;
            const confirmed = statsData.confirmedBookings || 0;
            setBookingStatusData({
              completed: confirmed,
              pending: pending,
              cancelled: total - confirmed - pending
            });
          }
        }

        if (analyticsRes.data.success) {
          const analytics = analyticsRes.data.analytics;
          
          // Process monthly revenue for chart
          if (analytics.monthlyRevenue && analytics.monthlyRevenue.length > 0) {
            const revenueData = analytics.monthlyRevenue.map((item: any) => item.revenue || 0);
            setMonthlyRevenueData(revenueData);
          } else {
            setMonthlyRevenueData([]);
          }
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Revenue Line Chart Data - Dynamic
  const getMonthLabels = (count: number): string[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const labels: string[] = [];
    for (let i = count - 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      labels.push(months[monthIndex]);
    }
    return labels;
  };

  const revenueChartData = {
    labels: monthlyRevenueData.length > 0 
      ? getMonthLabels(monthlyRevenueData.length)
      : getMonthLabels(6),
    datasets: [
      {
        label: 'Revenue ($)',
        data: monthlyRevenueData.length > 0 
          ? monthlyRevenueData 
          : Array(6).fill(0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Booking Status Doughnut Chart - Dynamic
  const bookingStatusChartData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [
          bookingStatusData.completed,
          bookingStatusData.pending,
          bookingStatusData.cancelled
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        {/* Header */}
        <motion.div 
          className="mb-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
        </motion.div>

        {/* Stats Cards */}
        <AnimatedContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            variants={scaleIn}
            whileHover="hover"
            custom={0}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</h3>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  ${stats.monthlyRevenue.toLocaleString()} this month (+{stats.monthlyGrowth}%)
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Total Users Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            variants={scaleIn}
            whileHover="hover"
            custom={1}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}</h3>
                <p className="text-sm text-gray-500 mt-2">{stats.totalUsers} total users</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Total Bookings Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            variants={scaleIn}
            whileHover="hover"
            custom={2}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalBookings}</h3>
                <p className="text-sm text-yellow-600 mt-2">{stats.pendingBookings} pending</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Total Blogs Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            variants={scaleIn}
            whileHover="hover"
            custom={3}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Blogs</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalBlogs}</h3>
                <p className="text-sm text-gray-500 mt-2">{stats.publishedBlogs} published, {stats.draftBlogs} drafts</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </AnimatedContainer>

        {/* Charts Row */}
        <AnimatedContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Line Chart */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            variants={chartAnimation}
            custom={0}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <div style={{ height: '300px' }}>
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </motion.div>

          {/* Booking Status Doughnut Chart */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            variants={chartAnimation}
            custom={1}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
            <div style={{ height: '300px' }}>
              <Doughnut data={bookingStatusChartData} options={chartOptions} />
            </div>
          </motion.div>
        </AnimatedContainer>

        {/* Recent Activity */}
        <AnimatedContainer className="mt-8">
          {/* Recent Bookings */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            variants={fadeInUp}
            custom={0}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.slice(0, 5).map((booking, index) => {
                  const timeAgo = booking.createdAt 
                    ? new Date(booking.createdAt).toLocaleDateString()
                    : 'Recently';
                  return (
                <motion.div 
                      key={booking._id || index} 
                  className="flex items-center justify-between py-3 border-b last:border-0"
                  variants={fadeInUp}
                      custom={index}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {(booking.clientName || booking.name || booking.userName || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                          <p className="font-medium text-gray-900">
                            {booking.clientName || booking.name || booking.userName || 'User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.serviceType || 'Session'} - ${booking.price || 0}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{timeAgo}</span>
                </motion.div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No recent bookings</p>
              )}
            </div>
          </motion.div>
        </AnimatedContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;