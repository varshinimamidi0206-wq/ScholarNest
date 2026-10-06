import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Loader2, 
  Plus, 
  AlertCircle,
  FileText,
  Calendar,
  Building
} from 'lucide-react';
import { applicationAPI, scholarshipAPI } from '../services/api';

const STATUS_OPTIONS = [
  'ALL',
  'SAVED',
  'INTERESTED',
  'DOCUMENTS_PREPARING',
  'READY_TO_APPLY',
  'APPLIED',
  'UNDER_REVIEW',
  'SELECTED',
  'REJECTED',
];

const STATUS_LABELS = {
  SAVED: 'Saved in Nest',
  INTERESTED: 'Interested',
  DOCUMENTS_PREPARING: 'Documents Preparing',
  READY_TO_APPLY: 'Ready to Apply',
  APPLIED: 'Submitted / Applied',
  UNDER_REVIEW: 'Under Review',
  SELECTED: 'Selected / Awarded',
  REJECTED: 'Rejected',
};

const STATUS_COLORS = {
  SAVED: 'bg-slate-100 text-slate-700 border-slate-200',
  INTERESTED: 'bg-sky-50 text-sky-700 border-sky-200',
  DOCUMENTS_PREPARING: 'bg-amber-50 text-amber-700 border-amber-200',
  READY_TO_APPLY: 'bg-blue-50 text-blue-700 border-blue-200',
  APPLIED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  UNDER_REVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
  SELECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Edit Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [editStatus, setEditStatus] = useState('INTERESTED');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchApps = async () => {
    try {
      const res = await applicationAPI.getApplications();
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleOpenEdit = (app) => {
    setSelectedApp(app);
    setEditStatus(app.status);
    setEditNotes(app.notes || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSavingEdit(true);

    try {
      const res = await applicationAPI.updateApplication(selectedApp.id, {
        status: editStatus,
        notes: editNotes,
      });
      if (res.data.success) {
        setApplications(prev => prev.map(a => a.id === selectedApp.id ? res.data.application : a));
        setSelectedApp(null);
        await fetchApps();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this application from your tracker?')) return;
    try {
      await applicationAPI.deleteApplication(id);
      setApplications(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to delete application.');
    }
  };

  const filteredApps = activeTab === 'ALL'
    ? applications
    : applications.filter(a => a.status === activeTab);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Application Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scholarship Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your progress across all 8 lifecycle stages from Saved to Selected.
          </p>
        </div>

        <Link
          to="/scholarships"
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Scholarship</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2 overflow-x-auto flex gap-1 shadow-2xs">
        {STATUS_OPTIONS.map((status) => {
          const count = status === 'ALL'
            ? applications.length
            : applications.filter(a => a.status === status).length;

          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === status
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{status === 'ALL' ? 'All Applications' : STATUS_LABELS[status] || status}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === status ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Application List */}
      {filteredApps.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Applications in this Stage</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse discovered scholarships and click "Track Application" to organize your submission timeline.
          </p>
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
          >
            Explore Scholarships
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[app.status] || 'bg-slate-100 text-slate-800'}`}>
                    {STATUS_LABELS[app.status] || app.status}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Updated: {new Date(app.updated_at || app.created_at).toLocaleDateString()}
                  </span>
                  {app.applied_at && (
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Submitted on: {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <Link
                  to={`/scholarships/${app.scholarship_id}`}
                  className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors block"
                >
                  {app.scholarship_name || 'Scholarship Scheme'}
                </Link>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {app.provider}
                  </span>
                  <span className="font-semibold text-slate-800">
                    INR {Number(app.amount).toLocaleString('en-IN')}
                  </span>
                  {app.deadline && (
                    <span className="flex items-center gap-1 text-rose-600">
                      <Clock className="w-3.5 h-3.5" />
                      Due: {app.deadline}
                    </span>
                  )}
                </div>

                {app.notes && (
                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100 mt-2">
                    <strong>Notes:</strong> {app.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => handleOpenEdit(app)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Status</span>
                </button>

                {app.official_url && (
                  <a
                    href={app.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg transition-colors"
                    title="Open official portal"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => handleDelete(app.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove application"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fade-in space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Update Application Progress
            </h3>
            <p className="text-xs text-slate-500">
              {selectedApp.scholarship_name}
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lifecycle Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="SAVED">SAVED - Bookmarked for future review</option>
                  <option value="INTERESTED">INTERESTED - Evaluating requirements</option>
                  <option value="DOCUMENTS_PREPARING">DOCUMENTS_PREPARING - Gathering certificates</option>
                  <option value="READY_TO_APPLY">READY_TO_APPLY - All documents verified</option>
                  <option value="APPLIED">APPLIED - Submitted to official portal</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW - Verified by committee</option>
                  <option value="SELECTED">SELECTED - Grant awarded!</option>
                  <option value="REJECTED">REJECTED - Ineligible / Not selected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Personal Notes / Reference Application Number
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Submitted on NSP with Ref ID 2026-X992..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {savingEdit ? 'Updating...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
