import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RotateCcw, 
  Loader2, 
  GraduationCap, 
  Scale, 
  ArrowUpDown,
  X
} from 'lucide-react';
import { scholarshipAPI } from '../services/api';
import ScholarshipCard from '../components/ScholarshipCard';

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [incomeFilter, setIncomeFilter] = useState('');
  const [cgpaFilter, setCgpaFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [sort, setSort] = useState('match');
  const [comparedList, setComparedList] = useState(() => {
    try {
      const saved = localStorage.getItem('scholarnest_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (courseFilter) params.course = courseFilter;
      if (stateFilter) params.state = stateFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (incomeFilter) params.income = incomeFilter;
      if (cgpaFilter) params.cgpa = cgpaFilter;
      if (minAmount) params.amount = minAmount;
      if (sort) params.sort = sort;

      const res = await scholarshipAPI.getScholarships(params);
      if (res.data.success) {
        setScholarships(res.data.scholarships || []);
      }
    } catch (err) {
      console.error('Failed to fetch scholarships:', err);
    } finally {
      setLoading(false);
    }
  }, [search, courseFilter, stateFilter, categoryFilter, incomeFilter, cgpaFilter, minAmount, sort]);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  const handleResetFilters = () => {
    setSearch('');
    setCourseFilter('');
    setStateFilter('');
    setCategoryFilter('');
    setIncomeFilter('');
    setCgpaFilter('');
    setMinAmount('');
    setSort('match');
  };

  const handleCompareToggle = (sch) => {
    let nextList = [];
    if (comparedList.some(item => item.id === sch.id)) {
      nextList = comparedList.filter(item => item.id !== sch.id);
    } else {
      if (comparedList.length >= 3) {
        alert('You can compare a maximum of 3 scholarships simultaneously.');
        return;
      }
      nextList = [...comparedList, sch];
    }
    setComparedList(nextList);
    localStorage.setItem('scholarnest_compare', JSON.stringify(nextList));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Scholarship Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search verified government, corporate, and private financial grant schemes.
          </p>
        </div>

        {/* Compare quick link floating counter */}
        {comparedList.length > 0 && (
          <div className="flex items-center gap-2 p-2 px-3 bg-sky-50 border border-sky-200 rounded-xl text-xs">
            <Scale className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-sky-900">
              {comparedList.length} of 3 selected
            </span>
            <Link
              to="/compare"
              className="ml-2 font-bold text-sky-600 hover:text-sky-800 underline"
            >
              Compare Now &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Search Bar & Sort Dropdown */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by scholarship title, provider (e.g. Tata, Reliance, AICTE)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="match">Match Score (Highest First)</option>
              <option value="deadline">Deadline (Soonest First)</option>
              <option value="amount_desc">Amount (High to Low)</option>
              <option value="amount_asc">Amount (Low to High)</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>

        </div>

        {/* Secondary Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
          
          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="">Course: All</option>
            <option value="B.Tech">B.Tech / Engineering</option>
            <option value="MBBS">Medical / MBBS</option>
            <option value="B.Sc">B.Sc / Sciences</option>
            <option value="B.Com">B.Com / Commerce</option>
            <option value="Degree">Degree / Arts</option>
          </select>

          {/* State filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="">State: All India</option>
            <option value="Telangana">Telangana</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="">Category: All</option>
            <option value="General">General / Open</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
            <option value="Minority">Minority</option>
          </select>

          {/* Max Family Income filter */}
          <select
            value={incomeFilter}
            onChange={(e) => setIncomeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="">Income: Any</option>
            <option value="200000">&le; 2 Lakhs/yr</option>
            <option value="450000">&le; 4.5 Lakhs/yr</option>
            <option value="800000">&le; 8 Lakhs/yr</option>
            <option value="1500000">&le; 15 Lakhs/yr</option>
          </select>

          {/* Minimum CGPA */}
          <select
            value={cgpaFilter}
            onChange={(e) => setCgpaFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="">My CGPA: Any</option>
            <option value="6.0">&ge; 6.0 CGPA</option>
            <option value="7.0">&ge; 7.0 CGPA</option>
            <option value="8.0">&ge; 8.0 CGPA</option>
            <option value="8.5">&ge; 8.5 CGPA</option>
          </select>

          {/* Reset button */}
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>

        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <strong>{scholarships.length}</strong> scholarships
        </div>
      </div>

      {/* Grid of Scholarships */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            <span className="text-xs text-slate-500">Searching scholarships with deterministic criteria...</span>
          </div>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Scholarships Matched Your Criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your filters or clearing search terms to explore broader opportunities.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((sch) => (
            <ScholarshipCard
              key={sch.id}
              scholarship={sch}
              isCompared={comparedList.some(item => item.id === sch.id)}
              onCompareToggle={handleCompareToggle}
            />
          ))}
        </div>
      )}

    </div>
  );
}
