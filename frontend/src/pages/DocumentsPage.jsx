import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2, 
  Bot, 
  Plus, 
  ShieldCheck, 
  FileCheck,
  X,
  HelpCircle
} from 'lucide-react';
import { documentAPI } from '../services/api';

const DOCUMENT_TYPES = [
  'Income Certificate',
  'Caste Certificate',
  'Academic Marksheet',
  'Bonafide Certificate',
  'Aadhaar / National ID',
  'Disability Certificate',
  'Bank Passbook Copy',
];

const STATUS_BADGES = {
  Ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Under Review': 'bg-sky-100 text-sky-800 border-sky-200',
  'Needs Attention': 'bg-amber-100 text-amber-800 border-amber-200',
  Missing: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docType, setDocType] = useState('Income Certificate');
  const [docName, setDocName] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // AI Analysis Modal State
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [activeAnalysis, setActiveAnalysis] = useState(null);

  const fetchDocs = async () => {
    try {
      const res = await documentAPI.getDocuments();
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please choose a file to upload.');
      return;
    }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', docType);
      formData.append('document_name', docName.trim() || file.name);

      const res = await documentAPI.uploadDocument(formData);
      if (res.data.success) {
        setUploadModalOpen(false);
        setFile(null);
        setDocName('');
        await fetchDocs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document from secure storage?')) return;
    try {
      await documentAPI.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  const handleAnalyze = async (doc) => {
    setAnalyzingId(doc.id);
    try {
      const res = await documentAPI.analyzeDocument(doc.id);
      if (res.data.success) {
        setActiveAnalysis({
          docName: doc.document_name,
          analysis: res.data.analysis,
        });
        setAnalysisModalOpen(true);
        await fetchDocs();
      }
    } catch (err) {
      alert('Failed to analyze document with AI engine.');
    } finally {
      setAnalyzingId(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Private Secure Storage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Document Readiness Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload required certificates and run Google Gemini verification before portal submission.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Checklist Grid by Type */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Standard Scholarship Document Checklist
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {DOCUMENT_TYPES.map((type) => {
            const hasUploaded = documents.some(d => d.document_type === type);
            return (
              <div
                key={type}
                className={`p-3 rounded-xl border text-center transition-all ${
                  hasUploaded
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {hasUploaded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="text-[11px] font-semibold leading-tight line-clamp-2">
                  {type}
                </div>
                <div className="text-[10px] mt-1 font-medium">
                  {hasUploaded ? 'Uploaded' : 'Missing'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Uploaded Documents ({documents.length})
          </h3>
          <span className="text-xs text-slate-500">Encrypted in private storage</span>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Documents Uploaded Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your income certificate, caste certificate, and academic marksheets to verify them before applying.
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
            >
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => {
              const status = doc.verification_status || 'Under Review';
              const isAnalyzing = analyzingId === doc.id;
              let parsedAnalysis = null;
              try {
                parsedAnalysis = typeof doc.ai_analysis === 'string' ? JSON.parse(doc.ai_analysis) : doc.ai_analysis;
              } catch (e) {}

              return (
                <div
                  key={doc.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {doc.document_name}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_BADGES[status] || 'bg-slate-100 text-slate-800'}`}>
                        {status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span>Category: <strong>{doc.document_type}</strong></span>
                      <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>

                    {parsedAnalysis && parsedAnalysis.analysisSummary && (
                      <div className="mt-2 text-xs text-slate-600 bg-sky-50/60 p-2.5 rounded-lg border border-sky-100 max-w-2xl">
                        <strong>AI Verification:</strong> {parsedAnalysis.analysisSummary}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAnalyze(doc)}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>AI Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Verify Document</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Upload Verification Document
              </h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {DOCUMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Label / Filename
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. MeeSeva Family Income Certificate 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select File (PDF, PNG, JPG, WebP &le; 10MB) *
                </label>
                <input
                  type="file"
                  required
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Analysis Result Modal */}
      {analysisModalOpen && activeAnalysis && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  AI Document Analysis Report
                </h3>
              </div>
              <button onClick={() => setAnalysisModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Analyzed Document:</span>
                <span className="font-bold text-slate-900 text-sm">{activeAnalysis.docName}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                <span>Readiness Classification:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-full border ${STATUS_BADGES[activeAnalysis.analysis.status] || 'bg-slate-100 text-slate-800'}`}>
                  {activeAnalysis.analysis.status}
                </span>
              </div>

              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-slate-700 leading-relaxed">
                <strong>Findings:</strong>
                <p className="mt-1">{activeAnalysis.analysis.analysisSummary}</p>
              </div>

              {activeAnalysis.analysis.issues?.length > 0 && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-900 space-y-1">
                  <strong>Issues Detected:</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {activeAnalysis.analysis.issues.map((iss, i) => (
                      <li key={i}>{iss}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setAnalysisModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
