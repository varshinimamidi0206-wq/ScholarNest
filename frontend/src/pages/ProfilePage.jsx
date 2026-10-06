import React, { useState, useEffect } from 'react';
import { 
  User, 
  Save, 
  GraduationCap, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { profileAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function ProfilePage() {
  const { student, updateStudentProfile, refreshMe } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    state: '',
    district: '',
    course: '',
    branch: '',
    year: '',
    college_name: '',
    college_type: 'Government',
    cgpa: '',
    percentage: '',
    annual_family_income: '',
    category: 'General',
    gender: 'Female',
    disability_status: false,
    minority_status: false,
    rural_urban: 'Urban',
    previous_scholarship: false,
    achievements: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    profileAPI.getProfile()
      .then(res => {
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setFormData({
            full_name: p.full_name || '',
            age: p.age || '',
            state: p.state || '',
            district: p.district || '',
            course: p.course || '',
            branch: p.branch || '',
            year: p.year || '',
            college_name: p.college_name || '',
            college_type: p.college_type || 'Government',
            cgpa: p.cgpa || '',
            percentage: p.percentage || '',
            annual_family_income: p.annual_family_income || '',
            category: p.category || 'General',
            gender: p.gender || 'Female',
            disability_status: Boolean(p.disability_status),
            minority_status: Boolean(p.minority_status),
            rural_urban: p.rural_urban || 'Urban',
            previous_scholarship: Boolean(p.previous_scholarship),
            achievements: p.achievements || '',
          });
          setCompletion(p.profile_completion || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await updateStudentProfile(formData);
      setCompletion(updated.profile_completion || 0);
      setSuccessMsg('Your student profile was updated successfully! Scholarships re-scored in real-time.');
      await refreshMe();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please verify your inputs.');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      
      {/* Header & Completion Meter */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 mb-1">
            <User className="w-3.5 h-3.5" />
            <span>Student Verification Profile</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic & Eligibility Credentials
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            These values feed the deterministic matching engine for point-by-point calculation.
          </p>
        </div>

        {/* Completion Bar */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 min-w-[200px]">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600">Profile Readiness</span>
            <span className="text-sky-600">{completion}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                completion >= 80 ? 'bg-emerald-500' : completion >= 50 ? 'bg-sky-500' : 'bg-amber-500'
              }`}
              style={{ width: `${completion}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {completion === 100 ? 'All 19 criteria complete!' : 'Complete all fields for 100% match accuracy'}
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-sky-600" />
            <span>1. Personal & Demographic Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Varshini Rao"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="20"
                min="14"
                max="60"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State of Residence *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Telangana / Karnataka / etc."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Hyderabad"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Area Type
              </label>
              <select
                name="rural_urban"
                value={formData.rural_urban}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Academic Details */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-4 h-4 text-sky-600" />
            <span>2. Academic Records (Worth 25 Points in Deterministic Engine)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Degree / Course *
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="B.Tech / MBBS / B.Sc / etc."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch / Specialization
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Computer Science & Engineering"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="3rd Year (Semester 5)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / University Name
              </label>
              <input
                type="text"
                name="college_name"
                value={formData.college_name}
                onChange={handleChange}
                placeholder="JNTUH College of Engineering"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institution Type
              </label>
              <select
                name="college_type"
                value={formData.college_type}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="Government">Government / State University</option>
                <option value="Central Institute">Central Institute (IIT/NIT/IISc)</option>
                <option value="Private Autonomous">Private Autonomous College</option>
                <option value="Deemed University">Deemed University</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current CGPA (out of 10.0)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="8.8"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marks Percentage (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                placeholder="88.0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Income & Social Category */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-sky-600" />
            <span>3. Income & Reservation Eligibility (Worth 30 Points Total)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Family Income (INR) *
              </label>
              <input
                type="number"
                name="annual_family_income"
                value={formData.annual_family_income}
                onChange={handleChange}
                placeholder="180000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                As stated on your official MeeSeva / Tehsildar Income Certificate.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Social / Reservation Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="General">General / Open Category</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/60">
              <input
                type="checkbox"
                name="minority_status"
                checked={formData.minority_status}
                onChange={handleChange}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-700 font-medium">Religious Minority</span>
            </label>

            <label className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/60">
              <input
                type="checkbox"
                name="disability_status"
                checked={formData.disability_status}
                onChange={handleChange}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-700 font-medium">Person with Disability (PwD)</span>
            </label>

            <label className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2.5 cursor-pointer hover:bg-slate-100/60">
              <input
                type="checkbox"
                name="previous_scholarship"
                checked={formData.previous_scholarship}
                onChange={handleChange}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-700 font-medium">Previous Scholarship Recipient</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Extracurricular & Academic Achievements
            </label>
            <textarea
              name="achievements"
              rows={2}
              value={formData.achievements}
              onChange={handleChange}
              placeholder="e.g. State rank 14 in EAMCET, published research in IEEE conference, district sports medal..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-sky-200 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Credentials</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
