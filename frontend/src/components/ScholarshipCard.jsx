import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Award,
  ChevronRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { savedAPI, applicationAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import EligibilityModal from './EligibilityModal';

export default function ScholarshipCard({ 
  scholarship, 
  onSaveToggle, 
  isCompared = false, 
  onCompareToggle = null 
}) {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(scholarship.isSaved || false);
  const [saving, setSaving] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);

  // Calculate deadline days
  const now = new Date();
  const deadlineDate = new Date(scholarship.deadline);
  const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays >= 0 && diffDays <= 14;
  const isExpired = diffDays < 0;

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await savedAPI.unsaveScholarship(scholarship.id);
        setIsSaved(false);
        if (onSaveToggle) onSaveToggle(scholarship.id, false);
      } else {
        await savedAPI.saveScholarship(scholarship.id);
        setIsSaved(true);
        if (onSaveToggle) onSaveToggle(scholarship.id, true);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    } finally {
      setSaving(false);
    }
  };

  const matchScore = scholarship.matchScore ?? 75;
  const isHighMatch = matchScore >= 80;
  const isMedMatch = matchScore >= 60;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
        
        {/* Card Header & Badges */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {scholarship.verified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
              {isExpired ? (
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Expired
                </span>
              ) : isUrgent ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 animate-pulse">
                  <Clock className="w-3 h-3" />
                  {diffDays === 0 ? 'Last Day!' : `${diffDays} days left`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {diffDays} days left
                </span>
              )}
            </div>

            {/* Actions: Compare + Save */}
            <div className="flex items-center gap-1 shrink-0">
              {onCompareToggle && (
                <button
                  onClick={() => onCompareToggle(scholarship)}
                  title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    isCompared
                      ? 'bg-sky-100 border-sky-300 text-sky-800'
                      : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleBookmark}
                disabled={saving}
                title={isSaved ? 'Remove from saved' : 'Save scholarship'}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isSaved
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Scholarship Title & Provider */}
          <Link to={`/scholarships/${scholarship.id}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
              {scholarship.name}
            </h3>
          </Link>
          <div className="text-xs text-slate-500 font-medium mt-1 truncate">
            {scholarship.provider}
          </div>

          {/* Award Amount */}
          <div className="mt-3.5 flex items-baseline justify-between py-2 border-y border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Award Value</span>
              <div className="text-lg font-extrabold text-slate-900">
                INR {Number(scholarship.amount).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Match Score Badge */}
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Match Score</span>
              <div className="flex items-center justify-end gap-1">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isHighMatch
                      ? 'bg-emerald-100 text-emerald-800'
                      : isMedMatch
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {matchScore}% Match
                </span>
              </div>
            </div>
          </div>

          {/* Criteria tags preview */}
          <div className="mt-3 flex flex-wrap gap-1 text-[11px]">
            {scholarship.minimum_cgpa > 0 && (
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Min CGPA: {scholarship.minimum_cgpa}
              </span>
            )}
            {scholarship.maximum_income > 0 && (
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Max Income: &le;{(scholarship.maximum_income / 100000).toFixed(1)}L
              </span>
            )}
            {scholarship.gender_requirement && scholarship.gender_requirement !== 'All' && (
              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium border border-purple-100">
                {scholarship.gender_requirement} Only
              </span>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowEligibility(true)}
            className="flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Check Eligibility</span>
          </button>

          <Link
            to={`/scholarships/${scholarship.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <span>Details</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

      </div>

      {/* Point-by-point Eligibility Modal */}
      {showEligibility && (
        <EligibilityModal
          isOpen={showEligibility}
          onClose={() => setShowEligibility(false)}
          scholarship={scholarship}
          matchResult={scholarship.matchResult || {
            matchScore: scholarship.matchScore || 75,
            eligible: (scholarship.matchScore || 75) >= 60,
            breakdown: {
              academic: 20,
              income: 18,
              course: 18,
              location: 12,
              category: 8,
              other: 6,
            },
            matchedRequirements: ['Academic profile on file', 'Course matches eligible fields'],
            missingRequirements: ['Verify state nativity certificate if requested'],
          }}
        />
      )}
    </>
  );
}
