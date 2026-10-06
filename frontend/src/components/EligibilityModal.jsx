import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Bot, 
  Award, 
  FileCheck, 
  Clock, 
  ChevronRight,
  Loader2,
  Globe
} from 'lucide-react';
import { aiAPI } from '../services/api';

export default function EligibilityModal({ isOpen, onClose, scholarship, matchResult }) {
  if (!isOpen || !scholarship) return null;

  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [language, setLanguage] = useState('English');
  const [errorMsg, setErrorMsg] = useState(null);

  const breakdown = matchResult?.breakdown || {
    academic: 0,
    income: 0,
    course: 0,
    location: 0,
    category: 0,
    other: 0,
  };

  const handleAskAI = async () => {
    setLoadingAi(true);
    setErrorMsg(null);
    try {
      const res = await aiAPI.getEligibilityExplanation(scholarship.id, language);
      if (res.data.success && res.data.explanation) {
        setAiExplanation(res.data.explanation);
      } else {
        setErrorMsg('Unable to generate AI explanation at this time.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch AI explanation. Please check backend connection.');
    } finally {
      setLoadingAi(false);
    }
  };

  const score = matchResult?.matchScore ?? 0;
  const isHighMatch = score >= 80;
  const isMedMatch = score >= 60;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fade-in flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
              Deterministic Eligibility Engine
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {scholarship.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{scholarship.provider}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          
          {/* Match Score Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Calculated Match Score</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
                <span>{score}%</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    isHighMatch
                      ? 'bg-emerald-100 text-emerald-800'
                      : isMedMatch
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isHighMatch ? 'High Match' : isMedMatch ? 'Eligible with Conditions' : 'Criteria Gap'}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Backend Engine Score</div>
              <div className="font-semibold text-slate-700">Deterministic Algorithm</div>
            </div>
          </div>

          {/* Point by Point Breakdown (Total 100) */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
              Eligibility Breakdown (Out of 100 Points)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Academic Merit</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {breakdown.academic} <span className="text-xs font-normal text-slate-400">/ 25</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Min CGPA: {scholarship.minimum_cgpa || 'None'}</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Family Income</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {breakdown.income} <span className="text-xs font-normal text-slate-400">/ 20</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Ceiling: {scholarship.maximum_income ? `INR ${Number(scholarship.maximum_income).toLocaleString('en-IN')}` : 'None'}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Degree & Stream</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {breakdown.course} <span className="text-xs font-normal text-slate-400">/ 20</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Enrolled Course fit</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">State / Location</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {breakdown.location} <span className="text-xs font-normal text-slate-400">/ 15</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">State Quota & Nativity</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Social Category</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {breakdown.category} <span className="text-xs font-normal text-slate-400">/ 10</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Category & Reservation</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Gender & Other</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {breakdown.other} <span className="text-xs font-normal text-slate-400">/ 10</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Gender: {scholarship.gender_requirement || 'All'}</div>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Criteria Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Requirements */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Satisfied Criteria ({matchResult?.matchedRequirements?.length || 0})</span>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-900">
                {matchResult?.matchedRequirements?.length > 0 ? (
                  matchResult.matchedRequirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">No verified criteria registered yet.</li>
                )}
              </ul>
            </div>

            {/* Missing or Warning Requirements */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Gaps / Verify Before Applying ({matchResult?.missingRequirements?.length || 0})</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-900">
                {matchResult?.missingRequirements?.length > 0 ? (
                  matchResult.missingRequirements.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{m}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-emerald-800 font-medium">All major eligibility criteria satisfied!</li>
                )}
              </ul>
            </div>
          </div>

          {/* AI Explanation Trigger & Output */}
          <div className="pt-2 border-t border-slate-100">
            {!aiExplanation && (
              <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-xl border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Want a clear AI explanation of this match?
                    </div>
                    <div className="text-[11px] text-slate-500">
                      NestGuide explains strengths, required documents, and tips.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-2 text-slate-700 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                  </select>

                  <button
                    onClick={handleAskAI}
                    disabled={loadingAi}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {loadingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5" />
                        <span>Why Am I Eligible?</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 text-rose-700 rounded-lg text-xs">
                {errorMsg}
              </div>
            )}

            {/* AI Explanation Result Box */}
            {aiExplanation && (
              <div className="mt-4 p-5 bg-white rounded-xl border-2 border-sky-200 shadow-sm space-y-3.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                    <Bot className="w-4 h-4 text-sky-600" />
                    <span>NestGuide AI Analysis ({language})</span>
                  </div>
                  <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-semibold">
                    Backend Verified
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {aiExplanation.summary}
                </p>

                {aiExplanation.keyStrengths?.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 mb-1">Key Strengths:</div>
                    <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                      {aiExplanation.keyStrengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiExplanation.documentChecklist?.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-800 mb-1">Required Documents to Ready:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {aiExplanation.documentChecklist.map((doc, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiExplanation.actionableAdvice && (
                  <div className="p-3 bg-sky-50 rounded-lg text-xs text-sky-900">
                    <strong>Next Step:</strong> {aiExplanation.actionableAdvice}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
