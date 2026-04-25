import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Booking {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  message?: string;
  meetingLink?: string;
  frequency?: 'one-time' | 'after-3-mins' | '1-day' | 'weekly' | 'biweekly' | 'monthly';
  totalSessions?: number;
  currentSession?: number;
  sessionsCompleted?: number;
  nextSessionDate?: string;
  lastSessionCompletedAt?: string;
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10
  });

  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);

  // Fetch bookings from API
  const fetchBookings = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await axios.get(`/api/bookings?${params.toString()}`);
      
      if (response.data.success) {
        setBookings(response.data.bookings || []);
        setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceType: 'Life Coaching Session',
    preferredDate: '',
    preferredTime: '09:00',
    duration: 60,
    price: 150,
    status: 'pending' as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    paymentStatus: 'pending' as 'pending' | 'paid' | 'refunded',
    message: '',
    meetingLink: ''
  });

  const serviceTypes = [
    'Initial Consultation',
    'Life Coaching Session',
    'Career Guidance',
    'Relationship Coaching',
    'Goal Setting Session'
  ];

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  // Reset form to empty state
  const resetForm = () => {
    setEditingBooking(null);
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      serviceType: 'Life Coaching Session',
      preferredDate: '',
      preferredTime: '09:00',
      duration: 60,
      price: 150,
      status: 'pending',
      paymentStatus: 'pending',
      message: '',
      meetingLink: ''
    });
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      if (editingBooking) {
        // Update existing booking
        const response = await axios.put(`/api/bookings/${editingBooking._id}`, formData);
        
        if (response.data.success) {
          toast.success('Booking updated successfully');
          await fetchBookings();
          setShowModal(false);
          resetForm();
        }
      } else {
        // Create new booking
        const response = await axios.post('/api/bookings', formData);
        
        if (response.data.success) {
          toast.success('Booking created successfully');
          await fetchBookings();
          setShowModal(false);
          resetForm();
        }
      }
    } catch (error: any) {
      console.error('Error saving booking:', error);
      toast.error(error.response?.data?.message || 'Failed to save booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    // Format date for input field (YYYY-MM-DD)
    const dateStr = new Date(booking.preferredDate).toISOString().split('T')[0];
    
    setFormData({
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      serviceType: booking.serviceType,
      preferredDate: dateStr,
      preferredTime: booking.preferredTime,
      duration: booking.duration,
      price: booking.price,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      message: booking.message || '',
      meetingLink: booking.meetingLink || ''
    });
    setShowModal(true);
  };


  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/bookings/${id}`);
      
      if (response.data.success) {
        toast.success('Booking deleted successfully');
        await fetchBookings();
      }
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      toast.error(error.response?.data?.message || 'Failed to delete booking');
    }
  };

  const handleCompleteSession = async (booking: Booking) => {
    if (!booking.totalSessions || booking.totalSessions <= 1) {
      toast.error('This is not a multi-session package');
      return;
    }

    if (booking.sessionsCompleted && booking.sessionsCompleted >= booking.totalSessions) {
      toast.error('All sessions have been completed');
      return;
    }

    setCompletingBooking(booking);
    setShowCompleteModal(true);
  };

  const confirmCompleteSession = async () => {
    if (!completingBooking) return;

    try {
      const response = await axios.post(`/api/bookings/${completingBooking._id}/complete-session`);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setShowCompleteModal(false);
        setCompletingBooking(null);
        await fetchBookings();
      }
    } catch (error: any) {
      console.error('Error completing session:', error);
      toast.error(error.response?.data?.message || 'Failed to complete session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Manage client bookings and appointments</p>
        </div>
        {/* <motion.button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </motion.svg>
          <span>Add New Booking</span>
        </motion.button> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{bookings.filter(b => b.status === 'pending').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-semibold text-gray-900">{bookings.filter(b => b.status === 'confirmed').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${bookings
                  .filter(b => b.paymentStatus === 'paid')
                  .reduce((sum, booking) => sum + (booking.price || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">All Bookings</h3>
          {loading && (
            <div className="flex items-center text-gray-500">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          )}
        </div>
        {loading && bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No bookings found</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting Link</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.clientName}</div>
                      <div className="text-sm text-gray-500">{booking.clientEmail}</div>
                      <div className="text-sm text-gray-500">{booking.clientPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.serviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.preferredDate 
                        ? new Date(booking.preferredDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">{booking.preferredTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.duration} min</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.totalSessions && booking.totalSessions > 1 ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {booking.sessionsCompleted || 0}/{booking.totalSessions}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.frequency === 'weekly' ? 'Weekly' : booking.frequency === 'biweekly' ? 'Bi-Weekly' : booking.frequency === 'monthly' ? 'Monthly' : booking.frequency === 'after-3-mins' ? 'After 3 Mins' : booking.frequency === '1-day' ? '1 Day' : 'One Time'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Single</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.meetingLink ? (
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-800 hover:underline flex items-center space-x-1"
                        title={booking.meetingLink}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>View Link</span>
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">No link</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {booking.totalSessions && booking.totalSessions > 1 && booking.sessionsCompleted < booking.totalSessions && booking.paymentStatus === 'paid' && (
                        <button
                          onClick={() => handleCompleteSession(booking)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Complete Session & Send Next Email"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(booking)}
                        className="text-primary-600 hover:text-primary-900 p-2 rounded-lg hover:bg-primary-50 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} bookings
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed top-0 right-0 h-screen w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-[100] overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Sticky Header */}
            <div className="sticky bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBooking ? 'Edit Booking' : 'Create New Booking'}
                </h2>
                <motion.button
                  onClick={handleSidebarClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>

            <div className="p-6">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Phone</label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {serviceTypes.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link (optional)</label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://zoom.us/j/123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (optional)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <motion.button
                  type="button"
                  onClick={handleSidebarClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={submitting ? {} : { scale: 1.02, y: -1 }}
                  whileTap={submitting ? {} : { scale: 0.98 }}
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingBooking ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    editingBooking ? 'Update Booking' : 'Create Booking'
                  )}
                </motion.button>
              </div>
            </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Session Confirmation Modal */}
      <AnimatePresence>
        {showCompleteModal && completingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0  flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCompleteModal(false);
              setCompletingBooking(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Session</h3>
                <p className="text-gray-600">
                  Mark session {completingBooking.sessionsCompleted ? completingBooking.sessionsCompleted + 1 : 1} as complete and send email for next session?
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-700">
                    <p><strong>Client:</strong> {completingBooking.clientName}</p>
                    <p><strong>Sessions:</strong> {completingBooking.sessionsCompleted || 0}/{completingBooking.totalSessions}</p>
                    <p><strong>Frequency:</strong> {completingBooking.frequency === 'weekly' ? 'Weekly' : completingBooking.frequency === 'biweekly' ? 'Bi-Weekly' : completingBooking.frequency === 'monthly' ? 'Monthly' : completingBooking.frequency === 'after-3-mins' ? 'After 3 Mins' : completingBooking.frequency === '1-day' ? '1 Day' : 'One Time'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setCompletingBooking(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCompleteSession}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBookings;