import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { scholarshipAPI } from '../services/api';

export default function ComparePage() {
  const [allScholarships, setAllScholarships] = useState([]);
  const [comparedList, setComparedList] = useState(() => {
    try {
      const saved = localStorage.getItem('scholarnest_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    scholarshipAPI.getScholarships()
      .then(res => {
        if (res.data.success) {
          setAllScholarships(res.data.scholarships || []);
          // If none selected, default top 2 for instant comparison
          if (comparedList.length === 0 && res.data.scholarships?.length >= 2) {
            const defaults = res.data.scholarships.slice(0, 2);
            setComparedList(defaults);
            localStorage.setItem('scholarnest_compare', JSON.stringify(defaults));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleRemove = (id) => {
    const updated = comparedList.filter(s => s.id !== id);
    setComparedList(updated);
    localStorage.setItem('scholarnest_compare', JSON.stringify(updated));
  };

  const handleAdd = (id) => {
    if (!id) return;
    const item = allScholarships.find(s => s.id === id);
    if (!item) return;
    if (comparedList.some(s => s.id === item.id)) return;
    if (comparedList.length >= 3) {
      alert('You can compare a maximum of 3 scholarships simultaneously.');
      return;
    }
    const updated = [...comparedList, item];
    setComparedList(updated);
    localStorage.setItem('scholarnest_compare', JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Side-by-Side Evaluator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scholarship Comparison Tool
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare benefits, cutoffs, document checklists, and match scores across up to 3 opportunities.
          </p>
        </div>

        {/* Add selector */}
        {comparedList.length < 3 && (
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                handleAdd(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:outline-none"
            >
              <option value="" disabled>+ Add scholarship to compare...</option>
              {allScholarships
                .filter(s => !comparedList.some(c => c.id === s.id))
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {comparedList.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
          <Scale className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Scholarships Selected for Comparison</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose scholarships from the discovery catalog to compare their eligibility cutoffs and funding.
          </p>
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
          >
            Browse Scholarships
          </Link>
        </div>
      ) : (
        /* Comparison Table Container */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="p-4 sm:p-6 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/4">
                  Criteria
                </th>
                {comparedList.map((sch) => (
                  <th key={sch.id} className="p-4 sm:p-6 text-left relative align-top">
                    <button
                      onClick={() => handleRemove(sch.id)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="pr-8">
                      <Link
                        to={`/scholarships/${sch.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors line-clamp-2"
                      >
                        {sch.name}
                      </Link>
                      <div className="text-[11px] text-slate-500 mt-1">{sch.provider}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {/* Row: Match Score */}
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-500 bg-slate-50/30">
                  Deterministic Match Score
                </td>
                {comparedList.map((sch) => (
                  <td key={sch.id} className="p-4 sm:p-6 font-bold text-slate-900">
                    <span className="text-base px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {sch.matchScore || 75}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row: Award Amount */}
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-500 bg-slate-50/30">
                  Total Award Amount
                </td>
                {comparedList.map((sch) => (
                  <td key={sch.id} className="p-4 sm:p-6 font-extrabold text-base text-slate-900">
                    INR {Number(sch.amount).toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* Row: Minimum CGPA */}
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-500 bg-slate-50/30">
                  Minimum Academic Cutoff
                </td>
                {comparedList.map((sch) => (
                  <td key={sch.id} className="p-4 sm:p-6 text-slate-800">
                    {sch.minimum_cgpa > 0 ? `Minimum ${sch.minimum_cgpa} CGPA` : 'No CGPA Cutoff'}
                  </td>
                ))}
              </tr>

              {/* Row: Maximum Family Income */}
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-500 bg-slate-50/30">
                  Annual Income Limit
                </td>
                {comparedList.map((sch) => (
                  <td key={sch.id} className="p-4 sm:p-6 text-slate-800">
                    {sch.maximum_income > 0
                      ? `&le; INR ${Number(sch.maximum_income).toLocaleString('en-IN')}`
                      : 'No Income Ceiling'}
                  </td>
                ))}
              </tr>

              {/* Row: Gender Requirement */}
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-500 bg-slate-50/30">
                  Gender Eligibility
                </td>
                {comparedList.map((sch) => (
                  <td key={sch.id} className="p-4 sm:p-6 text-slate-800">
                    {sch.gender_requirement || 'All Genders'}
                  </td>
                ))}
              </tr>

              {/* Row: Application Deadline */}
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-500 bg-slate-50/30">
                  Application Deadline
                </td>
                {comparedList.map((sch) => (
                  <td key={sch.id} className="p-4 sm:p-6 font-bold text-rose-600">
                    {sch.deadline}
                  </td>
                ))}
              </tr>

              {/* Row: Required Documents */}
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-500 bg-slate-50/30">
                  Required Documents
                </td>
                {comparedList.map((sch) => {
                  const docs = Array.isArray(sch.required_documents)
                    ? sch.required_documents
                    : (typeof sch.required_documents === 'string' ? JSON.parse(sch.required_documents || '[]') : []);
                  return (
                    <td key={sch.id} className="p-4 sm:p-6 text-xs text-slate-700">
                      <ul className="space-y-1 list-disc pl-4">
                        {docs.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </td>
                  );
                })}
              </tr>

              {/* Row: Official Actions */}
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-slate-500 bg-slate-50/30">
                  Official Portal
                </td>
                {comparedList.map((sch) => (
                  <td key={sch.id} className="p-4 sm:p-6">
                    <a
                      href={sch.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      <span>Apply Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
