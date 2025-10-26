import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import AnimatedContainer from '../../components/Animation/AnimatedContainer.tsx';
import { fadeInUp, scaleIn, chartAnimation } from '../../utils/animations.ts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalBlogs: 45,
    totalBookings: 189,
    totalRevenue: 45680,
    monthlyGrowth: 15.3,
    activeUsers: 892,
    pendingBookings: 12,
    completedBookings: 177
  });

  // Revenue Line Chart Data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [8500, 9200, 7800, 11200, 9800, 12800, 15200, 13400, 16800, 18900, 20100, 22800],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Weekly Bookings Bar Chart
  const bookingsChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Bookings',
        data: [12, 19, 8, 15, 22, 18, 14],
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  // Booking Status Doughnut Chart
  const bookingStatusData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [177, 12, 8],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // User Growth Line Chart
  const userGrowthData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'New Users',
        data: [45, 62, 58, 89],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
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
                  +{stats.monthlyGrowth}% this month
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
                <p className="text-sm text-gray-500 mt-2">{stats.activeUsers} active</p>
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
                <p className="text-sm text-gray-500 mt-2">Published articles</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </AnimatedContainer>

        {/* Charts Row 1 */}
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

          {/* Weekly Bookings Bar Chart */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            variants={chartAnimation}
            custom={1}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Bookings</h3>
            <div style={{ height: '300px' }}>
              <Bar data={bookingsChartData} options={chartOptions} />
            </div>
          </motion.div>
        </AnimatedContainer>

        {/* Charts Row 2 */}
        <AnimatedContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Status Doughnut Chart */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            variants={chartAnimation}
            custom={0}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
            <div style={{ height: '250px' }}>
              <Doughnut data={bookingStatusData} options={chartOptions} />
            </div>
          </motion.div>

          {/* User Growth Chart */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2"
            variants={chartAnimation}
            custom={1}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 4 Weeks)</h3>
            <div style={{ height: '250px' }}>
              <Line data={userGrowthData} options={chartOptions} />
            </div>
          </motion.div>
        </AnimatedContainer>

        {/* Recent Activity */}
        <AnimatedContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Bookings */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            variants={fadeInUp}
            custom={0}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <motion.div 
                  key={item} 
                  className="flex items-center justify-between py-3 border-b last:border-0"
                  variants={fadeInUp}
                  custom={item}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      U{item}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">User {item}</p>
                      <p className="text-sm text-gray-500">Session booked</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{item}h ago</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            variants={fadeInUp}
            custom={1}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
            <div className="space-y-4">
              <motion.div 
                className="flex items-center justify-between"
                variants={fadeInUp}
                custom={0}
              >
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-semibold text-gray-900">12.5%</span>
              </motion.div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '12.5%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              
              <motion.div 
                className="flex items-center justify-between mt-4"
                variants={fadeInUp}
                custom={1}
              >
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="font-semibold text-gray-900">94%</span>
              </motion.div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-green-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '94%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
              
              <motion.div 
                className="flex items-center justify-between mt-4"
                variants={fadeInUp}
                custom={2}
              >
                <span className="text-gray-600">Blog Engagement</span>
                <span className="font-semibold text-gray-900">78%</span>
              </motion.div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '78%' }}
                  transition={{ duration: 1, delay: 0.9 }}
                />
              </div>
            </div>
          </motion.div>
        </AnimatedContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;