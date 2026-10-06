import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Upload,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Scale,
  ShieldAlert,
  ArrowRight,
  Trash2,
  Lock,
} from 'lucide-react';
import { CaseType, CasePriority } from '../../types';

interface ApplyCaseViewProps {
  onSuccessNavigate?: () => void;
}

export const ApplyCaseView: React.FC<ApplyCaseViewProps> = ({ onSuccessNavigate }) => {
  const { currentUser, applyForCase, users } = useApp();

  // If user is not logged in as client, prefill with default or guest client
  const defaultClient = currentUser?.role === 'client' ? currentUser : users.find((u) => u.role === 'client') || users[4];

  const [clientName, setClientName] = useState(defaultClient?.name || '');
  const [clientEmail, setClientEmail] = useState(defaultClient?.email || '');
  const [clientPhone, setClientPhone] = useState(defaultClient?.phone || '');

  const [caseTitle, setCaseTitle] = useState('');
  const [caseType, setCaseType] = useState<CaseType>('Corporate Law');
  const [priority, setPriority] = useState<CasePriority>('High');
  const [incidentDate, setIncidentDate] = useState('2026-09-15');
  const [location, setLocation] = useState('New York, NY (Southern District)');
  const [description, setDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [uploadedDocs, setUploadedDocs] = useState<Array<{ name: string; size: string; type: string }>>([
    { name: 'Initial_Commercial_Contract_ExA.pdf', size: '2.4 MB', type: 'application/pdf' },
  ]);

  const [submittedAppNum, setSubmittedAppNum] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDocAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedDocs((prev) => [
        ...prev,
        {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.type || 'application/pdf',
        },
      ]);
    }
  };

  const handleDocRemove = (index: number) => {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!caseTitle.trim() || !description.trim()) {
      setErrorMsg('Please provide a descriptive case title and comprehensive factual summary.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const app = applyForCase({
        clientId: defaultClient?.id || 'u-client-1',
        clientName: clientName || defaultClient?.name || 'Valued Client',
        clientEmail: clientEmail || defaultClient?.email || 'client@lcms.law',
        clientPhone: clientPhone || defaultClient?.phone || '+1 (555) 000-0000',
        caseTitle,
        caseType,
        priority,
        incidentDate,
        location,
        description,
        additionalInfo,
        supportingDocuments: uploadedDocs,
      });

      setIsSubmitting(false);
      setSubmittedAppNum(app.applicationNumber);
    }, 600);
  };

  if (submittedAppNum) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center p-8 sm:p-12">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-700 text-xs font-bold rounded-full mb-2 uppercase tracking-wider border border-amber-500/20">
            Intake Docket Initialized
          </span>

          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            Case Application Formally Received
          </h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6">
            Your application dossier has been encrypted and submitted to the Managing Partners Intake Committee under
            privilege.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto text-left mb-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Docket Reference</span>
              <span className="text-sm font-mono font-bold text-amber-600">{submittedAppNum}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Practice Division</span>
              <span className="text-xs font-bold text-slate-800">{caseType}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority Level</span>
              <span className="text-xs font-bold text-red-600">{priority}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Initial Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Pending Review
              </span>
            </div>
          </div>

          {/* Lifecycle Preview */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span className="text-amber-600 font-bold">1. Pending Submission ✓</span>
              <span>2. Partner Review</span>
              <span>3. Counsel Assignment</span>
              <span>4. Active Litigation</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full w-1/4 rounded-full"></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (onSuccessNavigate) {
                  onSuccessNavigate();
                } else {
                  setSubmittedAppNum(null);
                  setCaseTitle('');
                  setDescription('');
                }
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <span>View In Client Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSubmittedAppNum(null);
                setCaseTitle('');
                setDescription('');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition"
            >
              Submit Another Matter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <Scale className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Formal Legal Representation Intake</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
            Submit a New Case Application
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Please provide full factual details regarding the legal dispute or transactional matter. All submissions are
            transmitted over encrypted channels and covered under strict attorney-client privilege.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Application Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
        {/* Client Identification */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 font-mono text-xs flex items-center justify-center font-bold">
              1
            </span>
            Client / Organization Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name / Corp Entity
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Direct Phone
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Case Subject & Practice Area */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 font-mono text-xs flex items-center justify-center font-bold">
              2
            </span>
            Controversy Classification & Core Facts
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Case Title / Primary Caption <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                placeholder="e.g. Injunction Against Patent Misappropriation & Trade Secrets Breach"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Practice Area / Case Type
                </label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value as CaseType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Corporate Law">Corporate Law &amp; Securities</option>
                  <option value="Criminal Defense">Federal Criminal Defense</option>
                  <option value="Civil Litigation">Civil &amp; Commercial Litigation</option>
                  <option value="Intellectual Property">Intellectual Property &amp; Patents</option>
                  <option value="Real Estate & Property">Real Estate &amp; Land Disputes</option>
                  <option value="Constitutional Law">Constitutional &amp; Appellate Law</option>
                  <option value="Family & Matrimonial">Family &amp; Matrimonial Law</option>
                  <option value="Labor & Employment">Labor &amp; Executive Employment</option>
                  <option value="Banking & Finance">Banking, Regulatory &amp; Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Urgency / Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as CasePriority)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Low">Low (Standard Review)</option>
                  <option value="Medium">Medium (Active Negotiations)</option>
                  <option value="High">High (Subpoena or Impending Motion)</option>
                  <option value="Urgent">Urgent (Imminent Hearing, TRO or Injunction)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Incident / Breach Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Jurisdiction / Primary Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. New York County Supreme Court"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Factual Summary &amp; Relief Sought <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the sequence of events, opposing party claims, financial or reputational damages incurred, and desired legal relief..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Additional Information / Known Opposing Parties
              </label>
              <input
                type="text"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Names of opposing legal entities, registered agents, or relevant docket index numbers"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Supporting Documents */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 font-mono text-xs flex items-center justify-center font-bold">
              3
            </span>
            Supporting Documents &amp; Exhibits
          </h3>

          <div className="space-y-3">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative">
              <input
                type="file"
                onChange={handleDocAdd}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 mx-auto text-amber-600 mb-2 stroke-1" />
              <p className="text-xs font-bold text-slate-800">Click or Drag &amp; Drop Supporting Exhibits</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Accepted files: PDF, DOCX, PNG, TIFF, ZIP (Encrypted at rest under AES-256)
              </p>
            </div>

            {uploadedDocs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">Attached Exhibits ({uploadedDocs.length}):</p>
                {uploadedDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">({doc.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDocRemove(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Privilege & Submission Banner */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Fiduciary Confidentiality Guarantee:</strong> By submitting this case intake application, you
            formally engage our preliminary conflicts analysis team. Your communication remains protected under
            Attorney-Client Work Product rules regardless of ultimate engagement status.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Encrypting &amp; Submitting Docket...</span>
            ) : (
              <>
                <span>Submit Case Application to Managing Partners</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
