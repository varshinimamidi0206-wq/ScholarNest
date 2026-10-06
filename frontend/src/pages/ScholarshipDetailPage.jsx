import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  Bookmark, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  Loader2, 
  ArrowLeft,
  Calendar,
  Building
} from 'lucide-react';
import { scholarshipAPI, savedAPI, applicationAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import EligibilityModal from '../components/EligibilityModal';

export default function ScholarshipDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [application, setApplication] = useState(null);
  const [showEligibility, setShowEligibility] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('INTERESTED');
  const [trackingNotes, setTrackingNotes] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    scholarshipAPI.getScholarshipById(id)
      .then(res => {
        if (res.data.success && res.data.scholarship) {
          const s = res.data.scholarship;
          setScholarship(s);
          setIsSaved(s.isSaved || false);
          setApplication(s.application || null);
          if (s.application) {
            setTrackingStatus(s.application.status);
            setTrackingNotes(s.application.notes || '');
          }
        }
      })
      .catch(err => {
        console.error('Failed to load scholarship details:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setSavingAction(true);
    try {
      if (isSaved) {
        await savedAPI.unsaveScholarship(scholarship.id);
        setIsSaved(false);
      } else {
        await savedAPI.saveScholarship(scholarship.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Save toggle error:', err);
    } finally {
      setSavingAction(false);
    }
  };

  const handleTrackApplication = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await applicationAPI.createApplication({
        scholarship_id: scholarship.id,
        status: trackingStatus,
        notes: trackingNotes,
      });
      if (res.data.success) {
        setApplication(res.data.application);
        setTrackingModalOpen(false);
        alert(`Application status tracked as: ${trackingStatus}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application tracker.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Scholarship Not Found</h2>
        <Link to="/scholarships" className="text-sky-600 font-semibold text-xs hover:underline">
          &larr; Back to scholarship list
        </Link>
      </div>
    );
  }

  // Format array fields safely
  const eligibleCourses = Array.isArray(scholarship.course_eligibility)
    ? scholarship.course_eligibility
    : (typeof scholarship.course_eligibility === 'string' ? JSON.parse(scholarship.course_eligibility || '[]') : []);

  const eligibleStates = Array.isArray(scholarship.eligible_states)
    ? scholarship.eligible_states
    : (typeof scholarship.eligible_states === 'string' ? JSON.parse(scholarship.eligible_states || '[]') : []);

  const eligibleCategories = Array.isArray(scholarship.eligible_categories)
    ? scholarship.eligible_categories
    : (typeof scholarship.eligible_categories === 'string' ? JSON.parse(scholarship.eligible_categories || '[]') : []);

  const requiredDocs = Array.isArray(scholarship.required_documents)
    ? scholarship.required_documents
    : (typeof scholarship.required_documents === 'string' ? JSON.parse(scholarship.required_documents || '[]') : []);

  // Deadline calculation
  const now = new Date();
  const deadlineDate = new Date(scholarship.deadline);
  const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
  const isUrgent = diffDays >= 0 && diffDays <= 14;

  const matchScore = scholarship.matchResult?.matchScore ?? 80;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Back button */}
      <Link
        to="/scholarships"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Scholarships</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {scholarship.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Scheme
                </span>
              )}
              {isUrgent ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  {diffDays === 0 ? 'Closes Today!' : `${diffDays} days remaining`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {diffDays} days remaining
                </span>
              )}
              {application && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  <Layers className="w-3.5 h-3.5" />
                  Status: {application.status}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {scholarship.name}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{scholarship.provider}</span>
            </div>
          </div>

          {/* Amount Badge */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl sm:text-right shrink-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Award Amount</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              INR {Number(scholarship.amount).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Method: {scholarship.application_method || 'Online Portal'}
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          
          {/* Button: Check My Eligibility */}
          <button
            onClick={() => setShowEligibility(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-sky-200 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Check My Eligibility</span>
          </button>

          {/* Button: Save Scholarship */}
          <button
            onClick={handleSaveToggle}
            disabled={savingAction}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition-colors ${
              isSaved
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
            <span>{isSaved ? 'Saved in Nest' : 'Save Scholarship'}</span>
          </button>

          {/* Button: Track Application */}
          <button
            onClick={() => setTrackingModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>{application ? 'Update Application Status' : 'Track Application'}</span>
          </button>

          {/* Button: Apply Officially */}
          <a
            href={scholarship.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors"
          >
            <span>Apply Officially</span>
            <ExternalLink className="w-4 h-4" />
          </a>

        </div>

      </div>

      {/* Two Column Layout: Description & Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Description & Documents */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
              Scheme Description & Purpose
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
              {scholarship.description}
            </p>
          </div>

          {/* Required Documents */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Required Certificates & Verification Documents</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {requiredDocs.length > 0 ? (
                requiredDocs.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-800 font-medium">{doc}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">Standard college identification and marksheet.</div>
              )}
            </div>
            <div className="pt-2">
              <Link to="/documents" className="text-xs font-semibold text-sky-600 hover:underline">
                Upload and AI-verify your documents in the Documents tab &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Detailed Eligibility Matrix */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              Eligibility Matrix
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Academic Threshold</span>
                <span className="text-slate-900 font-bold text-sm">
                  {scholarship.minimum_cgpa > 0 ? `Minimum ${scholarship.minimum_cgpa} CGPA` : 'No Minimum CGPA'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Maximum Family Income</span>
                <span className="text-slate-900 font-bold text-sm">
                  {scholarship.maximum_income > 0
                    ? `INR ${Number(scholarship.maximum_income).toLocaleString('en-IN')} / year`
                    : 'No Income Cap'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Eligible Courses</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {eligibleCourses.map((c, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Eligible States</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {eligibleStates.map((st, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Target Category</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {eligibleCategories.map((cat, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Gender Requirement</span>
                <span className="text-slate-900 font-semibold">
                  {scholarship.gender_requirement || 'All'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block">Application Deadline</span>
                <span className="text-rose-600 font-bold text-sm">
                  {scholarship.deadline}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Point-by-point Eligibility Modal */}
      {showEligibility && (
        <EligibilityModal
          isOpen={showEligibility}
          onClose={() => setShowEligibility(false)}
          scholarship={scholarship}
          matchResult={scholarship.matchResult || {
            matchScore: 85,
            eligible: true,
            breakdown: {
              academic: 25,
              income: 20,
              course: 20,
              location: 15,
              category: 5,
              other: 0,
            },
            matchedRequirements: ['Academic score matches', 'Income satisfies ceiling'],
            missingRequirements: ['Verify state reservation'],
          }}
        />
      )}

      {/* Application Tracking Modal */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fade-in space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Update Application Progress
            </h3>
            <p className="text-xs text-slate-500">
              Track this opportunity across the 8 standard stages of the lifecycle.
            </p>

            <form onSubmit={handleTrackApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Status
                </label>
                <select
                  value={trackingStatus}
                  onChange={(e) => setTrackingStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="SAVED">SAVED</option>
                  <option value="INTERESTED">INTERESTED</option>
                  <option value="DOCUMENTS_PREPARING">DOCUMENTS_PREPARING</option>
                  <option value="READY_TO_APPLY">READY_TO_APPLY</option>
                  <option value="APPLIED">APPLIED</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="SELECTED">SELECTED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Personal Notes / Reference ID
                </label>
                <textarea
                  rows={3}
                  value={trackingNotes}
                  onChange={(e) => setTrackingNotes(e.target.value)}
                  placeholder="e.g. Application submission acknowledgment ID: TS-2026-9923..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
