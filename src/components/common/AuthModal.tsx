import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Scale,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Award,
  FileCheck,
  Upload,
  FileText,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { UserRole, LicenseDocument } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  defaultRole = 'client',
}) => {
  const { login, register, switchRole } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [registerRole, setRegisterRole] = useState<'client' | 'lawyer'>(
    defaultRole === 'lawyer' ? 'lawyer' : 'client'
  );

  // Common Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lawyer specific confirmation states
  const [barNumber, setBarNumber] = useState('');
  const [licenseDoc, setLicenseDoc] = useState<LicenseDocument | null>(null);
  const [jurisdiction, setJurisdiction] = useState('California State Bar');
  const [specialization, setSpecialization] = useState('Corporate Law');
  const [experienceYears, setExperienceYears] = useState('5');
  const [firmAffiliation, setFirmAffiliation] = useState('');
  const [bio, setBio] = useState('');
  const [standingAffirmed, setStandingAffirmed] = useState(false);

  if (!isOpen) return null;

  const handleLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const fakeUrl = URL.createObjectURL(file);
    setLicenseDoc({
      name: file.name,
      size: formattedSize,
      type: file.type || 'application/pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      url: fakeUrl,
    });
    setError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please provide your email address.');
      return;
    }
    const res = login(email, password);
    if (!res.success) {
      setError(res.error || 'Login failed.');
    } else {
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in your full legal name, email, phone number, and password.');
      return;
    }

    // Additional Lawyer Confirmation & Verification Validation
    if (registerRole === 'lawyer') {
      if (!barNumber.trim()) {
        setError('Bar License Number is required for pending lawyer verification.');
        return;
      }
      if (!licenseDoc) {
        setError('License Document Upload is required for pending lawyer verification. Please upload a copy of your Bar Card or Admission Certificate.');
        return;
      }
      if (!jurisdiction.trim()) {
        setError('Please select or specify your State Bar / Court jurisdiction of admission.');
        return;
      }
      if (!bio.trim()) {
        setError('Please provide a brief professional statement or practice summary.');
        return;
      }
      if (!standingAffirmed) {
        setError('You must confirm the Bar Standing & Professional Responsibility declaration to register as legal counsel.');
        return;
      }
    }

    const res = register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      password,
      role: registerRole,
      ...(registerRole === 'lawyer'
        ? {
            barNumber: barNumber.trim(),
            licenseDocument: licenseDoc || undefined,
            jurisdiction: jurisdiction.trim(),
            specialization,
            experienceYears: Number(experienceYears) || 1,
            firmAffiliation: firmAffiliation.trim(),
            bio: bio.trim(),
          }
        : {}),
    });

    if (!res.success) {
      setError(res.error || 'Registration failed.');
    } else {
      setSuccessMsg(
        registerRole === 'lawyer'
          ? 'Attorney registration submitted! Your Bar License Number and License Document are pending administrative verification.'
          : 'Client account registered successfully! Welcome to LCMS.'
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Enter your registered email address.');
      return;
    }
    setSuccessMsg('A password reset link and verification token have been dispatched to your email.');
    setTimeout(() => {
      setMode('login');
      setSuccessMsg(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col transition-all duration-200 ${
          mode === 'register' && registerRole === 'lawyer' ? 'max-w-xl' : 'max-w-md'
        }`}
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5 text-amber-400">
            <Scale className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">LCMS Secure Authentication</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            {mode === 'login'
              ? 'Client & Counsel Sign In'
              : mode === 'register'
              ? registerRole === 'lawyer'
                ? 'Attorney Licensure Registration'
                : 'Create Client Account'
              : 'Recover Account'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {mode === 'login'
              ? 'Access confidential litigation records, case schedules, and court docket filings.'
              : mode === 'register'
              ? registerRole === 'lawyer'
                ? 'Verify professional credentials to access attorney dockets, court filings, and litigation strategy.'
                : 'Register to retain counsel, submit case applications, and track proceedings.'
              : 'Enter your verified email to receive secure recovery directives.'}
          </p>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* Mode: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alexander.drake@apexcorp.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-xs text-amber-700 hover:text-amber-800 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-medium rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick 1-Click Role Switchers within Modal */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
                  Quick Demo Login
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      switchRole('admin');
                      onClose();
                    }}
                    className="p-2 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-lg text-left transition"
                  >
                    <div className="font-semibold text-xs text-slate-900">Admin</div>
                    <div className="text-[10px] text-slate-500 truncate">Jonathan (Partner)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchRole('lawyer', 'u-lawyer-3');
                      onClose();
                    }}
                    className="p-2 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-lg text-left transition"
                  >
                    <div className="font-semibold text-xs text-slate-900">Lawyer</div>
                    <div className="text-[10px] text-slate-500 truncate">Sophia (IP)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchRole('client', 'u-client-1');
                      onClose();
                    }}
                    className="p-2 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-lg text-left transition"
                  >
                    <div className="font-semibold text-xs text-slate-900">Client</div>
                    <div className="text-[10px] text-slate-500 truncate">Alexander (Corp)</div>
                  </button>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500 pt-1">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-amber-700 font-semibold hover:underline"
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {/* Mode: Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Account Type Selector: Client vs Lawyer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterRole('client');
                      setError(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                      registerRole === 'client'
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 text-slate-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
                        <User className="w-4 h-4 text-amber-600" />
                      </div>
                      {registerRole === 'client' && (
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Client / Claimant</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Retain counsel, apply for cases &amp; monitor filings
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegisterRole('lawyer');
                      setError(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                      registerRole === 'lawyer'
                        ? 'border-slate-900 bg-slate-900 text-white ring-2 ring-slate-900/20 shadow-md'
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className={`p-2 rounded-lg border shadow-2xs ${
                          registerRole === 'lawyer'
                            ? 'bg-slate-800 border-slate-700 text-amber-400'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <Scale className="w-4 h-4" />
                      </div>
                      {registerRole === 'lawyer' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                          Attorney
                        </span>
                      )}
                    </div>
                    <div>
                      <div
                        className={`font-bold text-xs ${
                          registerRole === 'lawyer' ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        Lawyer / Counsel
                      </div>
                      <div
                        className={`text-[11px] mt-0.5 leading-snug ${
                          registerRole === 'lawyer' ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        Manage dockets, legal strategy &amp; court hearings
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Basic Personal Credentials */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      {registerRole === 'lawyer' ? 'Attorney Full Legal Name' : 'Full Legal Name'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={registerRole === 'lawyer' ? 'e.g. Jessica Sterling, Esq.' : 'e.g. Jessica Sterling'}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      {registerRole === 'lawyer' ? 'Official / Law Firm Email' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={registerRole === 'lawyer' ? 'jsterling@firm.law' : 'jessica@example.com'}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Direct Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2831"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {registerRole === 'lawyer' ? 'Chambers / Law Office Address' : 'Mailing / Company Address'}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="1200 Avenue of the Americas, Suite 400, New York, NY"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* LAWYER SPECIFIC DETAILED CONFIRMATION SECTION */}
              {registerRole === 'lawyer' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-fadeIn">
                  {/* Header & Verification Notice */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-900">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Bar Licensure &amp; Verification Details
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      Pending Verification Status
                    </span>
                  </div>

                  {/* Verification Notice Banner */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-[11px] text-amber-950 leading-relaxed">
                      <strong className="font-bold text-slate-900 block mb-0.5">
                        Lawyer Licensure Verification Policy:
                      </strong>
                      All attorney accounts undergo mandatory administrative verification. Provide your active{' '}
                      <strong>Bar License Number</strong> and upload an official <strong>License Document</strong> (State Bar card or
                      Certificate of Good Standing). Your profile will remain in{' '}
                      <span className="font-bold underline text-amber-800">Pending Lawyer Verification</span> until approved by the
                      managing partner.
                    </div>
                  </div>

                  {/* Row: Bar License Number & License Document Upload */}
                  <div className="space-y-3 p-3.5 bg-white rounded-xl border border-amber-200/70 shadow-2xs">
                    {/* 1. Bar License Number Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Bar License Number <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          Required for Pending Verification
                        </span>
                      </div>
                      <div className="relative">
                        <Award className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={barNumber}
                          onChange={(e) => setBarNumber(e.target.value)}
                          placeholder="e.g. CA-BAR-298412 or NY-592810"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Official bar registration number issued by your state licensing board or judicial court.
                      </p>
                    </div>

                    {/* 2. License Document Upload Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                          License Document Upload <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          Required for Pending Verification
                        </span>
                      </div>

                      {!licenseDoc ? (
                        <div className="relative border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/50 hover:bg-amber-50/20 rounded-xl p-4 text-center transition cursor-pointer group">
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            onChange={handleLicenseFileChange}
                            required
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="flex flex-col items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-slate-200/80 group-hover:bg-amber-100 text-slate-700 group-hover:text-amber-800 flex items-center justify-center mb-2 transition">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                              Upload State Bar Card or Certificate of Good Standing
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              Drag and drop or click to browse (PDF, PNG, JPG up to 15MB)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-emerald-950 truncate flex items-center gap-1.5">
                                <span>{licenseDoc.name}</span>
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-200 text-emerald-800">
                                  Ready
                                </span>
                              </div>
                              <div className="text-[10px] text-emerald-700 mt-0.5">
                                {licenseDoc.size} • Uploaded for pending lawyer verification
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLicenseDoc(null)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition shrink-0 ml-2"
                            title="Remove attached document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Bar Jurisdiction */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Jurisdiction / State Bar <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="California State Bar">California State Bar</option>
                        <option value="New York State Bar">New York State Bar</option>
                        <option value="Texas State Bar">Texas State Bar</option>
                        <option value="Florida Bar">Florida Bar</option>
                        <option value="Illinois State Bar">Illinois State Bar</option>
                        <option value="Massachusetts Bar">Massachusetts Bar</option>
                        <option value="District of Columbia Bar">District of Columbia Bar</option>
                        <option value="U.S. Federal District Court Bar">U.S. Federal District Court Bar</option>
                      </select>
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Practice Specialization <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Corporate Law">Corporate Law &amp; M&amp;A</option>
                        <option value="Criminal Defense">Criminal Defense</option>
                        <option value="Civil Litigation">Civil &amp; Commercial Litigation</option>
                        <option value="Intellectual Property">Intellectual Property &amp; Patents</option>
                        <option value="Real Estate & Property">Real Estate &amp; Land Use</option>
                        <option value="Family & Matrimonial">Family &amp; Matrimonial Law</option>
                        <option value="Labor & Employment">Labor &amp; Employment</option>
                        <option value="Banking & Finance">Banking &amp; Securities</option>
                        <option value="Constitutional Law">Constitutional &amp; Appellate</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Years of Experience */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Years in Practice <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Firm Affiliation */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Law Firm / Law School Affiliation
                      </label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={firmAffiliation}
                          onChange={(e) => setFirmAffiliation(e.target.value)}
                          placeholder="e.g. Sterling Legal Associates / Columbia Law School"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio / Practice Statement */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Professional Statement / Practice Summary <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Brief summary of trial experience, primary courts admitted to, and representative matters..."
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    ></textarea>
                  </div>

                  {/* Bar Standing & Professional Responsibility Affirmation */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={standingAffirmed}
                        onChange={(e) => setStandingAffirmed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                      />
                      <span className="text-[11px] text-slate-800 leading-snug">
                        <strong className="text-slate-950 block mb-0.5 flex items-center gap-1 font-bold">
                          <FileCheck className="w-3.5 h-3.5 text-amber-600" />
                          Bar Standing &amp; Licensure Affirmation
                        </strong>
                        I confirm and certify under penalty of professional misconduct that I am an actively licensed attorney
                        in good standing admitted to practice in the designated jurisdiction, and agree to adhere to the ABA
                        Model Rules of Professional Conduct and LCMS security standards.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm ${
                  registerRole === 'lawyer'
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-400'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
                }`}
              >
                <span>
                  {registerRole === 'lawyer'
                    ? 'Confirm Credentials & Complete Lawyer Registration'
                    : 'Complete Client Registration'}
                </span>
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-slate-500 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-amber-700 font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}

          {/* Mode: Forgot Password */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@lcms.law"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-medium rounded-lg text-sm transition"
              >
                Send Password Reset Instructions
              </button>

              <div className="text-center text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-amber-700 font-semibold hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
