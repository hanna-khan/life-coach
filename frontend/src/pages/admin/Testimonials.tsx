import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiUrl } from '../../config/api.ts';

interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  videoUrl?: string;
  createdAt: string;
}

const API_URL = getApiUrl();

const AdminTestimonials: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });

  const fetchTestimonials = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (filters.status) {
        params.append('status', filters.status);
      }

      const response = await axios.get(`${API_URL}/testimonials/admin?${params.toString()}`, {
        headers: { 'x-auth-token': token || '' }
      });

      if (response.data.success) {
        setTestimonials(response.data.testimonials || []);
        setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
      }
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
      toast.error(error.response?.data?.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    fetchTestimonials(1);
  }, [fetchTestimonials]);

  const filteredTestimonials = useMemo(() => {
    if (!filters.type) {
      return testimonials;
    }

    return testimonials.filter((item) =>
      filters.type === 'video' ? !!item.videoUrl : !item.videoUrl
    );
  }, [testimonials, filters.type]);

  const summary = useMemo(() => {
    return {
      total: testimonials.length,
      visible: testimonials.filter((item) => item.status === 'approved').length,
      hidden: testimonials.filter((item) => item.status === 'rejected').length,
      pending: testimonials.filter((item) => item.status === 'pending').length
    };
  }, [testimonials]);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem('adminToken');
      const response = await axios.put(
        `${API_URL}/testimonials/${id}/status`,
        { status },
        { headers: { 'x-auth-token': token || '' } }
      );

      if (response.data.success) {
        toast.success(status === 'approved' ? 'Testimonial is now visible.' : 'Testimonial hidden from website.');
        await fetchTestimonials(pagination.current);
      }
    } catch (error: any) {
      console.error('Error updating testimonial status:', error);
      toast.error(error.response?.data?.message || 'Failed to update testimonial');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!window.confirm('Delete this testimonial permanently?')) {
      return;
    }

    try {
      setUpdatingId(id);
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`${API_URL}/testimonials/${id}`, {
        headers: { 'x-auth-token': token || '' }
      });

      if (response.data.success) {
        toast.success('Testimonial deleted.');
        await fetchTestimonials(pagination.current);
      }
    } catch (error: any) {
      console.error('Error deleting testimonial:', error);
      toast.error(error.response?.data?.message || 'Failed to delete testimonial');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
          <p className="text-gray-600 mt-2">
            Control what appears on website (video and text testimonials).
          </p>
        </div>
        <button
          onClick={() => fetchTestimonials(pagination.current)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Total: {summary.total}</span>
          <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">Visible: {summary.visible}</span>
          <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">Hidden: {summary.hidden}</span>
          <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending: {summary.pending}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option value="approved">Visible</option>
                <option value="rejected">Hidden</option>
                <option value="pending">Pending</option>
              </select>
              <svg className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <div className="relative">
              <select
                value={filters.type}
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All</option>
                <option value="video">Video</option>
                <option value="text">Text</option>
              </select>
              <svg className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => setFilters({ status: '', type: '' })}
            className="px-4 py-3 border border-red-200 bg-red-50 rounded-lg text-red-700 hover:bg-red-100 transition-colors font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">All Testimonials</h3>
          <span className="text-sm text-gray-600">Total: {pagination.total}</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading testimonials...</div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No testimonials found.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTestimonials.map((item) => (
              <div key={item._id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                      {item.videoUrl ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Video</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Text</span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.status === 'approved' ? 'Visible' : item.status === 'rejected' ? 'Hidden' : 'Pending'}
                      </span>
                    </div>
                    {item.role && <p className="text-sm text-gray-600">{item.role}</p>}
                    <p className="text-gray-700 leading-relaxed">"{item.content}"</p>
                    {item.videoUrl && (
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm text-primary-700 hover:text-primary-900 underline"
                      >
                        Open video
                      </a>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'approved' ? (
                      <button
                        onClick={() => updateStatus(item._id, 'rejected')}
                        disabled={updatingId === item._id}
                        className="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 disabled:opacity-50"
                      >
                        Hide
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(item._id, 'approved')}
                        disabled={updatingId === item._id}
                        className="px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50"
                      >
                        Show
                      </button>
                    )}
                    <button
                      onClick={() => deleteTestimonial(item._id)}
                      disabled={updatingId === item._id}
                      className="px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Page {pagination.current} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchTestimonials(pagination.current - 1)}
                disabled={pagination.current <= 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchTestimonials(pagination.current + 1)}
                disabled={pagination.current >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials;
