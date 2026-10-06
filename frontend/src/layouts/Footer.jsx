import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Cpu, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              Scholar<span>Nest</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your Path to the Right Scholarship. Designed with deterministic eligibility scoring, secure document verification, and NestGuide AI guidance.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero data harvesting. Real criteria.</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Discovery</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/scholarships" className="hover:text-white transition-colors">
                  Browse All Scholarships
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Scholarship Comparison Tool
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/applications" className="hover:text-white transition-colors">
                  Application Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Official Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  National Scholarship Portal (NSP) <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://telanganaepass.cgg.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Telangana ePASS Portal <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.aicte-india.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  AICTE Schemes Portal <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.tatatrusts.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Tata Trusts Education Grants <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture & AI Notice */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">AI & Engine</h4>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-sky-400">
                <Cpu className="w-4 h-4" />
                <span>Deterministic + Gemini 1.5</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Eligibility scores are calculated deterministically on the backend (Academic 25, Income 20, Course 20, Location 15, Category 10, Other 10). AI never guesses eligibility scores.
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} ScholarNest. Production-grade hackathon engineering.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">English</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Telugu (తెలుగు)</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Hindi (हिंदी)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
