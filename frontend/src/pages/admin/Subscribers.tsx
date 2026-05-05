import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getApiUrl } from '../../config/api.ts';

interface Subscriber {
  _id: string;
  name: string;
  email: string;
  source?: string;
  createdAt: string;
}

type ExportFormat = 'csv' | 'excel' | 'pdf';

const API_URL = getApiUrl();

const AdminSubscribers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchSubscribers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { 'x-auth-token': token }
      };

      const response = await axios.get(`${API_URL}/subscribers?page=${page}&limit=20`, config);
      if (response.data.success) {
        setSubscribers(response.data.subscribers || []);
        setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
      }
    } catch (error: any) {
      console.error('Error fetching subscribers:', error);
      toast.error(error.response?.data?.message || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers(1);
  }, [fetchSubscribers]);

  const fetchAllSubscribers = async (): Promise<Subscriber[]> => {
    const token = localStorage.getItem('adminToken');
    const config = { headers: { 'x-auth-token': token } };
    const response = await axios.get(`${API_URL}/subscribers?page=1&limit=100000`, config);
    if (response.data.success) {
      return response.data.subscribers || [];
    }
    return [];
  };

  const handleExport = async (format: ExportFormat) => {
    setExporting(true);
    setShowExportModal(false);
    try {
      const all = await fetchAllSubscribers();
      if (all.length === 0) {
        toast.error('No subscribers to export.');
        return;
      }

      const rows = all.map((s) => ({
        Name: s.name,
        Email: s.email,
        Source: s.source || 'website',
        'Subscribed At': new Date(s.createdAt).toLocaleString(),
      }));

      if (format === 'csv') {
        const headers = Object.keys(rows[0]);
        const csvContent =
          headers.join(',') +
          '\n' +
          rows
            .map((r) =>
              headers
                .map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`)
                .join(',')
            )
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        triggerDownload(blob, 'subscribers.csv');
        toast.success('CSV downloaded!');
      } else if (format === 'excel') {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Subscribers');
        XLSX.writeFile(wb, 'subscribers.xlsx');
        toast.success('Excel file downloaded!');
      } else if (format === 'pdf') {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16);
        doc.text('Newsletter Subscribers', 14, 15);
        doc.setFontSize(10);
        doc.text(`Exported on ${new Date().toLocaleString()}  •  Total: ${all.length}`, 14, 22);
        autoTable(doc, {
          startY: 28,
          head: [['Name', 'Email', 'Source', 'Subscribed At']],
          body: rows.map((r) => [r.Name, r.Email, r.Source, r['Subscribed At']]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [79, 70, 229] },
          alternateRowStyles: { fillColor: [245, 245, 255] },
        });
        doc.save('subscribers.pdf');
        toast.success('PDF downloaded!');
      }
    } catch (err: any) {
      console.error('Export error:', err);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-gray-600 mt-2">All newsletter subscribers with name and email.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
        <p className="text-sm text-gray-600">Total Subscribers</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{pagination.total}</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900">Subscriber List</h3>
            {loading && <span className="text-sm text-gray-500">Loading...</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchSubscribers(pagination.current)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              disabled={exporting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Exporting…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Export
                </>
              )}
            </button>
          </div>
        </div>

        {!loading && subscribers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No subscribers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subscriber.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {subscriber.source || 'website'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(subscriber.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-700">
              Page {pagination.current} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchSubscribers(pagination.current - 1)}
                disabled={pagination.current <= 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchSubscribers(pagination.current + 1)}
                disabled={pagination.current >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Format Modal */}
      {showExportModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-1">Export Subscribers</h2>
            <p className="text-sm text-gray-500 mb-6">Choose a format to download</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-semibold text-gray-800">CSV</p>
                  <p className="text-xs text-gray-500">Comma-separated values, works with any spreadsheet</p>
                </div>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-left"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-semibold text-gray-800">Excel (.xlsx)</p>
                  <p className="text-xs text-gray-500">Microsoft Excel / Google Sheets format</p>
                </div>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition-all text-left"
              >
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-semibold text-gray-800">PDF</p>
                  <p className="text-xs text-gray-500">Formatted document, ideal for printing</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="mt-5 w-full py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminSubscribers;
