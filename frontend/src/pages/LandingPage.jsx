import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  FileCheck, 
  Clock, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  Award, 
  BookOpen,
  Cpu,
  BarChart3,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 shadow-xs mb-6 text-xs font-semibold text-sky-800">
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
              <span>Your Path to the Right Scholarship</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Discover Scholarships Built For Your Exact Profile
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              ScholarNest replaces random guessing with a deterministic eligibility scoring engine and NestGuide AI guidance. Compare criteria across academics, income, state, and category in seconds.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <span>Find My Scholarships</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/scholarships"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Explore Scholarships</span>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="mt-12 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60">
                <div className="text-xl font-bold text-slate-900">100%</div>
                <div className="text-xs text-slate-500">Deterministic Engine</div>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60">
                <div className="text-xl font-bold text-slate-900">10+</div>
                <div className="text-xs text-slate-500">Verified Schemes</div>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60">
                <div className="text-xl font-bold text-slate-900">8 Stages</div>
                <div className="text-xs text-slate-500">Application Lifecycle</div>
              </div>
              <div className="p-3 bg-white/70 rounded-xl border border-slate-200/60">
                <div className="text-xl font-bold text-slate-900">NestGuide</div>
                <div className="text-xs text-slate-500">Multilingual AI Advisor</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW SCHOLARNEST WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">The Framework</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            How ScholarNest Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            A structured four-step journey from student profile to submission confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm mb-4 border border-sky-100">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Build Student Profile</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your CGPA, family income bracket, course, state quota, and reservation category with 100% privacy.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm mb-4 border border-sky-100">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Deterministic Match</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our backend calculates scores across Academic (25), Income (20), Course (20), Location (15), Category (10), and Other (10).
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm mb-4 border border-sky-100">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">NestGuide AI Guidance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Understand exact reasons why you qualify, spot document gaps, and query guidelines in English, Telugu, or Hindi.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm mb-4 border border-sky-100">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Track & Apply</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track deadlines with days-left countdowns, organize required certificates, and follow your 8-stage progress tracker.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PERSONALIZED MATCHING ENGINE */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Core Engineering</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 leading-tight">
                Deterministic Eligibility Without AI Hallucinations
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Many tools let language models guess whether a student qualifies, causing costly rejections. ScholarNest calculates eligibility using strict mathematical rule sets on the backend server.
              </p>

              <div className="mt-6 space-y-3">
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Academic Score (CGPA & Percentage)</span>
                  <span className="font-bold text-sky-400">25 Points Max</span>
                </div>
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Family Income Ceiling Evaluation</span>
                  <span className="font-bold text-sky-400">20 Points Max</span>
                </div>
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Degree & Stream Compatibility</span>
                  <span className="font-bold text-sky-400">20 Points Max</span>
                </div>
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">State Quota & Residence Nativity</span>
                  <span className="font-bold text-sky-400">15 Points Max</span>
                </div>
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Social Category & Reservation Criteria</span>
                  <span className="font-bold text-sky-400">10 Points Max</span>
                </div>
                <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Gender, Age, & Special Quotas</span>
                  <span className="font-bold text-sky-400">10 Points Max</span>
                </div>
              </div>
            </div>

            {/* Live Visual Demonstration Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Engine Output Sample
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                  Eligible: True
                </span>
              </div>

              <div className="py-5">
                <div className="text-sm font-semibold text-white">
                  Central Sector Scheme of Scholarships
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Ministry of Education</div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Match Score</span>
                  <span className="text-3xl font-extrabold text-emerald-400">94 / 100</span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Academic score of 8.8 CGPA exceeds minimum 7.5</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Annual family income INR 1,80,000 is under ceiling of 4.5L</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Enrolled in B.Tech under University Affiliation</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. AI-POWERED GUIDANCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <div className="order-2 lg:order-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-900 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>NestGuide Assistant Explaining Match Results</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-200/60">
              <strong>Why Am I Eligible?</strong>
              <p className="mt-1">
                "You qualify for the Reliance Foundation Scholarship because your 8.8 CGPA satisfies the merit cutoff of 8.0, and your household income is well within the 15 LPA ceiling. To finalize your application, upload your College Bonafide and Class 12 Marksheet before October 25th."
              </p>
            </div>

            <div className="p-3.5 bg-indigo-50/60 rounded-xl text-xs text-indigo-950 leading-relaxed border border-indigo-100">
              <strong>తెలుగులో వివరణ (Telugu):</strong>
              <p className="mt-1">
                "మీ CGPA మరియు వార్షిక ఆదాయ వివరాలు ఈ స్కాలర్‌షిప్ నిబంధనలకు అనుగుణంగా ఉన్నాయి. గడువు ముగిసేలోగా అధికారిక పోర్టల్ ద్వారా దరఖాస్తు చేసుకోండి."
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Contextual Assistant</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              NestGuide AI Guidance in English, Telugu, & Hindi
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Google Gemini is invoked strictly from the secure backend to summarize complex government notices, answer procedural doubts, and provide custom checklists tailored to your profile.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Translates bureaucratic jargon into clear student checklists</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Respects deterministic engine scores without hallucinating eligibility</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Available anywhere with a single click</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 5. DOCUMENT READINESS & 6. APPLICATION TRACKING & 7. DEADLINE PROTECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Document Readiness */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Document Readiness</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track readiness across Income, Caste, Marksheets, and Bonafide certificates. Use backend AI analysis to ensure clarity before portal submission.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span>Ready &bull; Under Review &bull; Needs Attention</span>
            </div>
          </div>

          {/* Application Tracking */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4 border border-sky-100">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">8-Stage Application Tracker</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage opportunities through Saved, Interested, Documents Preparing, Ready to Apply, Applied, Under Review, Selected, and Rejected.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-sky-700">
              <span>Full lifecycle visibility</span>
            </div>
          </div>

          {/* Deadline Protection */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 border border-amber-100">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Deadline Protection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates precise days remaining in JavaScript logic. Highlights urgent opportunities ending in fewer than 14 days so you never miss an application window.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-amber-700">
              <span>Automated countdown reminders</span>
            </div>
          </div>

        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl shadow-sky-600/20">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Unlock Your Scholarship Opportunities?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-sky-100 max-w-xl mx-auto">
            Create your ScholarNest profile today to experience dynamic scoring, document verification, and personalized guidance.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-sky-900 bg-white hover:bg-sky-50 rounded-xl shadow-sm transition-all"
            >
              Get Started Now
            </Link>
            <Link
              to="/scholarships"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-sky-700/60 hover:bg-sky-700 border border-white/20 rounded-xl transition-all"
            >
              Browse 10+ Scholarships
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
