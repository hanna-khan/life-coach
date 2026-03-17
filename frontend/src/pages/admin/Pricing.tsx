import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

interface PricingPackage {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  frequency: 'one-time' | 'after-3-mins' | '1-day' | 'weekly' | 'biweekly' | 'monthly';
  sessions: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdminPricing: React.FC = () => {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PricingPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    frequency: 'one-time' as 'one-time' | 'after-3-mins' | '1-day' | 'weekly' | 'biweekly' | 'monthly',
    sessions: 1,
    features: '',
    isPopular: false,
    isActive: true
  });

  // Reset form to empty state
  const resetForm = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      frequency: 'one-time' as 'one-time' | 'after-3-mins' | '1-day' | 'weekly' | 'biweekly' | 'monthly',
      sessions: 1,
      features: '',
      isPopular: false,
      isActive: true
    });
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setShowModal(false);
    resetForm();
  };

  // Fetch packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/pricing/admin/all');
        if (response.data.success) {
          setPackages(response.data.packages);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side required validation with clear messages
    if (!formData.name.trim()) {
      toast.error('Package name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }
    if (!formData.duration || formData.duration <= 0) {
      toast.error('Duration must be greater than 0 minutes');
      return;
    }
    if (!formData.sessions || formData.sessions <= 0) {
      toast.error('Number of sessions must be at least 1');
      return;
    }
    if (!formData.features.trim()) {
      toast.error('Please add at least one feature');
      return;
    }

    try {
      setSubmitting(true);
      
      const packageData = {
        ...formData,
        features: formData.features.split('\n').filter(f => f.trim())
      };

      if (editingPackage) {
        // Update existing package
        const response = await axios.put(`/api/pricing/${editingPackage._id}`, packageData);
        if (response.data.success) {
          setPackages(packages.map(pkg => 
            pkg._id === editingPackage._id 
              ? response.data.package
              : pkg
          ));
        }
      } else {
        // Create new package
        const response = await axios.post('/api/pricing', packageData);
        if (response.data.success) {
          setPackages([response.data.package, ...packages]);
        }
      }

      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving package:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pkg: PricingPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      frequency: pkg.frequency || 'one-time',
      sessions: pkg.sessions || 1,
      features: pkg.features.join('\n'),
      isPopular: pkg.isPopular,
      isActive: pkg.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`/api/pricing/${id}`);
      if (response.data.success) {
        setPackages(packages.filter(pkg => pkg._id !== id));
      }
    } catch (error: any) {
      console.error('Error deleting package:', error);
    }
  };

  const toggleActive = async (id: string) => {
    const pkg = packages.find(p => p._id === id);
    if (!pkg) return;

    try {
      const response = await axios.put(`/api/pricing/${id}`, { isActive: !pkg.isActive });
      if (response.data.success) {
        setPackages(packages.map(p => 
          p._id === id 
            ? { ...p, isActive: !p.isActive }
            : p
        ));
      }
    } catch (error: any) {
      console.error('Error updating package status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Packages</h1>
          <p className="text-gray-600 mt-2">Manage your service packages and pricing</p>
        </div>
        <motion.button
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
          <span>Add New Package</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Packages</p>
              <p className="text-2xl font-semibold text-gray-900">{packages.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Active Packages</p>
              <p className="text-2xl font-semibold text-gray-900">{packages.filter(p => p.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Popular Packages</p>
              <p className="text-2xl font-semibold text-gray-900">{packages.filter(p => p.isPopular).length}</p>
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
              <p className="text-sm font-medium text-gray-600">Avg. Price</p>
              <p className="text-2xl font-semibold text-gray-900">${Math.round(packages.reduce((sum, pkg) => sum + pkg.price, 0) / packages.length)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No packages found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
          <motion.div
            key={pkg._id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden ${
              pkg.isPopular ? 'ring-2 ring-primary-500' : ''
            } ${!pkg.isActive ? 'opacity-60' : ''}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {pkg.isPopular && (
              <div className="bg-primary-600 text-white text-center py-2 text-sm font-medium">
                Most Popular
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{pkg.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleActive(pkg._id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pkg.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900">${pkg.price}</div>
                <div className="text-gray-600">{pkg.duration} minutes</div>
                <div className="mt-2 text-sm text-gray-500">
                  {pkg.sessions > 1 ? `${pkg.sessions} sessions` : '1 session'} • {pkg.frequency === 'one-time' ? 'One Time' : pkg.frequency === 'after-3-mins' ? 'After 3 Mins' : pkg.frequency === '1-day' ? '1 Day' : pkg.frequency === 'weekly' ? 'Weekly' : pkg.frequency === 'biweekly' ? 'Bi-Weekly' : 'Monthly'}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pkg._id)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
            </motion.div>
          ))}
        </div>
      )}

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
                  {editingPackage ? 'Edit Package' : 'Create New Package'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'one-time' | 'after-3-mins' | '1-day' | 'weekly' | 'biweekly' | 'monthly' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="one-time">One Time</option>
                    <option value="after-3-mins">After 3 Mins (Testing)</option>
                    <option value="1-day">1 Day (Testing)</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Sessions <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sessions}
                    onChange={(e) => setFormData({ ...formData, sessions: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Features (one per line) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={6}
                  placeholder="30-minute session&#10;Goal assessment&#10;Action plan outline&#10;Follow-up email"
                  required
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPopular" className="ml-2 block text-sm text-gray-900">
                    Popular Package
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active Package
                  </label>
                </div>
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
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  whileHover={{ scale: submitting ? 1 : 1.02, y: submitting ? 0 : -1 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{editingPackage ? 'Update Package' : 'Create Package'}</span>
                </motion.button>
              </div>
            </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPricing;
