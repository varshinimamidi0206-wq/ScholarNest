import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  Bookmark, 
  Clock, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  TrendingUp, 
  ChevronRight,
  ShieldAlert,
  Award
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ScholarshipCard from '../components/ScholarshipCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardAPI.getDashboard()
      .then(res => {
        if (res.data.success) {
          setData(res.data.dashboard);
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading your ScholarNest Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
          <h3 className="font-bold text-base">Error Loading Dashboard</h3>
          <p className="text-xs mt-1">{error || 'Server returned an invalid response.'}</p>
        </div>
      </div>
    );
  }

  const profileComp = data.profileCompletion ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>ScholarNest Student Hub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {data.userName || user?.name || 'Scholar'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Your personalized scholarship matching engine is active. We found{' '}
            <strong className="text-sky-300 font-semibold">{data.totalMatchingScholarships} scholarships</strong>{' '}
            matching your current academic, income, and category credentials.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/scholarships"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              <span>Find My Scholarships</span>
            </Link>

            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 transition-all"
            >
              <span>Update Profile ({profileComp}%)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Profile Completion Bar in Banner */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">Profile Readiness:</span>
            <div className="w-36 sm:w-48 bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  profileComp >= 80 ? 'bg-emerald-500' : profileComp >= 50 ? 'bg-sky-400' : 'bg-amber-400'
                }`}
                style={{ width: `${profileComp}%` }}
              ></div>
            </div>
            <span className="font-bold text-white">{profileComp}%</span>
          </div>

          {profileComp < 80 && (
            <Link to="/profile" className="text-sky-400 hover:underline flex items-center gap-1 font-medium">
              <span>Add remaining details for higher match accuracy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Matching */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Matching Schemes</span>
            <Sparkles className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {data.totalMatchingScholarships}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Deterministic match &ge; 60%
          </div>
        </div>

        {/* Saved Scholarships */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saved in Nest</span>
            <Bookmark className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {data.savedScholarshipsCount}
          </div>
          <Link to="/saved" className="text-[11px] text-sky-600 font-semibold hover:underline mt-1 block">
            View bookmarked &rarr;
          </Link>
        </div>

        {/* Active Applications */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active In Progress</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {data.activeApplicationsCount}
          </div>
          <Link to="/applications" className="text-[11px] text-sky-600 font-semibold hover:underline mt-1 block">
            Open tracker ({data.totalApplicationsCount} total) &rarr;
          </Link>
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Deadlines in 45d</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {data.upcomingDeadlines?.length || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Urgent opportunities
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Layout: Top Recommended (2 cols) & Deadline Tracker (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Top Recommended Scholarships */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Top Recommended Scholarships</h2>
              <p className="text-xs text-slate-500">Ranked by backend deterministic matching algorithm</p>
            </div>
            <Link
              to="/scholarships"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.topRecommended?.length > 0 ? (
              data.topRecommended.map((sch) => (
                <ScholarshipCard key={sch.id} scholarship={sch} />
              ))
            ) : (
              <div className="col-span-2 p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                Complete your profile to unlock customized recommendations.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines & Tracker Highlights */}
        <div className="space-y-6">
          
          {/* Upcoming Deadlines Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Deadlines</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Days Left</span>
            </div>

            <div className="space-y-3">
              {data.upcomingDeadlines?.length > 0 ? (
                data.upcomingDeadlines.map((dl) => (
                  <Link
                    key={dl.id}
                    to={`/scholarships/${dl.id}`}
                    className="block p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">
                        {dl.name}
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          dl.isUrgent
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {dl.daysLeft}d left
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>INR {Number(dl.amount).toLocaleString('en-IN')}</span>
                      <span>Due: {dl.deadline}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  No impending deadlines within 45 days.
                </div>
              )}
            </div>
          </div>

          {/* Quick Application Tracker Status Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Application Pipeline</h3>
              </div>
              <Link to="/applications" className="text-[11px] text-sky-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-slate-500 text-[11px]">Preparing Docs</div>
                <div className="font-bold text-slate-900 text-base mt-0.5">
                  {data.statusCounts?.DOCUMENTS_PREPARING || 0}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-slate-500 text-[11px]">Ready to Apply</div>
                <div className="font-bold text-slate-900 text-base mt-0.5">
                  {data.statusCounts?.READY_TO_APPLY || 0}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-slate-500 text-[11px]">Submitted</div>
                <div className="font-bold text-slate-900 text-base mt-0.5">
                  {data.statusCounts?.APPLIED || 0}
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <div className="text-slate-500 text-[11px]">Selected</div>
                <div className="font-bold text-emerald-600 text-base mt-0.5">
                  {data.statusCounts?.SELECTED || 0}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
