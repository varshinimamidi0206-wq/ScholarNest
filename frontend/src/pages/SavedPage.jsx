import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Loader2, ArrowRight } from 'lucide-react';
import { savedAPI } from '../services/api';
import ScholarshipCard from '../components/ScholarshipCard';

export default function SavedPage() {
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await savedAPI.getSaved();
      if (res.data.success) {
        setSavedList(res.data.saved || []);
      }
    } catch (err) {
      console.error('Failed to load saved scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleSaveToggle = (scholarshipId, isSaved) => {
    if (!isSaved) {
      setSavedList(prev => prev.filter(s => s.id !== scholarshipId));
    }
  };

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
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
          <Bookmark className="w-3.5 h-3.5 fill-amber-500" />
          <span>Personal Bookmarks</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Saved Scholarships ({savedList.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Scholarships you bookmarked for later review or application tracking.
        </p>
      </div>

      {savedList.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your Nest is Currently Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our verified scholarships and click the bookmark button to save them here.
          </p>
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.map((sch) => (
            <ScholarshipCard
              key={sch.id}
              scholarship={sch}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      )}

    </div>
  );
}
