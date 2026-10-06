import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  Calendar,
  Clock,
  FileText,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
  Phone,
  Mail,
  MapPin,
  Lock,
  ChevronRight,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Gavel,
  Bell,
  Scale,
} from 'lucide-react';
import { Case, CaseApplication } from '../../types';

interface ClientDashboardProps {
  onOpenApply: () => void;
  selectedCaseId?: string | null;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onOpenApply, selectedCaseId: initialCaseId }) => {
  const {
    currentUser,
    cases,
    applications,
    timelineEvents,
    documents,
    hearings,
    notifications,
    updateProfile,
    changePassword,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cases' | 'applications' | 'hearings' | 'profile'>('cases');
  const [selectedCase, setSelectedCase] = useState<Case | null>(() => {
    if (initialCaseId) {
      return cases.find((c) => c.id === initialCaseId && c.clientId === currentUser?.id) || null;
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Profile edit state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Enforce object-level access control: only cases belonging to this client!
  const myCases = cases.filter((c) => c.clientId === currentUser?.id);
  const myApplications = applications.filter((a) => a.clientId === currentUser?.id);
  const myHearings = hearings.filter((h) => h.clientId === currentUser?.id);
  const myNotifications = notifications.filter((n) => n.recipientId === currentUser?.id);

  const activeCases = myCases.filter((c) => ['Active', 'Hearing Scheduled', 'Approved'].includes(c.status));
  const completedCases = myCases.filter((c) => ['Won', 'Lost', 'Closed'].includes(c.status));
  const pendingApps = myApplications.filter((a) => ['Pending', 'Under Review'].includes(a.status));

  // Filtered cases
  const filteredCases = myCases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      phone: profilePhone,
      address: profileAddress,
      avatar: profileAvatar,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    const res = changePassword(oldPassword, newPassword);
    setPwMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setOldPassword('');
      setNewPassword('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Active</span>;
      case 'Hearing Scheduled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            Hearing Scheduled
          </span>
        );
      case 'Won':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Won</span>;
      case 'Closed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">Closed</span>;
      case 'Approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">Approved</span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Pending Review</span>
        );
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* 1. Welcome Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={
              currentUser?.avatar ||
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
            }
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/60 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Client Workspace
              </span>
              <span className="text-xs text-slate-400">Account ID: {currentUser?.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Welcome, {currentUser?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Secure client portal for confidential case tracking, hearing calendars, and counsel communications.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenApply}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit New Case Application</span>
        </button>
      </div>

      {/* 2. Key Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Matters</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">{myCases.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Retained legal files</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Litigation</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">{activeCases.length}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">In progress &amp; scheduled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Matters</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">{completedCases.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Won or resolved</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Applications</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">{pendingApps.length}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Under partner intake review</div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200 mb-8 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('cases');
              setSelectedCase(null);
            }}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cases'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>My Cases ({myCases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'applications'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Application Status ({myApplications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hearings')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'hearings'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Hearing Calendar ({myHearings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile &amp; Security</span>
          </button>
        </div>
      </div>

      {/* 4. Tab Content */}

      {/* Tab 1: My Cases */}
      {activeTab === 'cases' && (
        <div>
          {/* Detail View If Selected */}
          {selectedCase ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
              {/* Case Header */}
              <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                      {selectedCase.caseNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">{selectedCase.caseType}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                      Priority: {selectedCase.priority}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">{selectedCase.title}</h2>
                  <p className="text-xs text-slate-400">
                    Filing Date: {selectedCase.filingDate} • Presiding Court: {selectedCase.courtInfo.courtName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedCase.status)}
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition"
                  >
                    ← Back to Case List
                  </button>
                </div>
              </div>

              {/* Case Body */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Cols: Facts, Timeline, Updates, Documents */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Summary */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Factual Summary &amp; Legal Controversy
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {selectedCase.description}
                    </p>
                  </div>

                  {/* Notes Visible to Client */}
                  {selectedCase.notesVisibleToClient.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span>Counsel Progress Updates For Client</span>
                      </h3>
                      <div className="space-y-2">
                        {selectedCase.notesVisibleToClient.map((note, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-slate-800 flex items-start gap-2.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                            <span className="leading-relaxed">{note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Case Timeline / Milestones */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span>Procedural History &amp; Timeline</span>
                    </h3>

                    <div className="border-l-2 border-slate-200 ml-3 pl-5 space-y-6">
                      {timelineEvents
                        .filter((t) => t.caseId === selectedCase.id)
                        .map((evt) => (
                          <div key={evt.id} className="relative">
                            <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-amber-500 shadow-sm"></span>
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                              <span className="text-[11px] text-slate-400">
                                {new Date(evt.timestamp).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{evt.description}</p>
                            <span className="inline-block mt-1 text-[10px] text-slate-400 font-medium">
                              Logged by: {evt.createdBy} ({evt.creatorRole})
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Case Documents */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Case Records &amp; Documents</span>
                    </h3>

                    <div className="space-y-2">
                      {documents
                        .filter((d) => d.caseId === selectedCase.id && !d.isConfidential)
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-100 transition"
                          >
                            <div className="flex items-center gap-3 truncate">
                              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                              <div className="truncate">
                                <span className="font-bold text-slate-900 block truncate">{doc.name}</span>
                                <span className="text-[10px] text-slate-500">
                                  {doc.category} • {doc.fileSize} • Uploaded {doc.uploadDate} by {doc.uploadedBy}
                                </span>
                              </div>
                            </div>

                            <a
                              href="#download"
                              onClick={(e) => {
                                e.preventDefault();
                                alert(`Downloading official court copy: ${doc.name}`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-amber-700 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Right Col: Assigned Counsel Card & Court Docket */}
                <div className="space-y-6">
                  {/* Lead Counsel Card */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Assigned Lead Attorney
                    </span>

                    <div className="flex items-center gap-3 mt-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-amber-500/30">
                        <img
                          src={
                            selectedCase.lawyerId === 'u-lawyer-3'
                              ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
                              : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
                          }
                          alt="Attorney"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-slate-900 text-sm">
                          {selectedCase.lawyerName || 'Managing Partner Desk'}
                        </h4>
                        <p className="text-xs text-amber-800 font-medium">
                          {selectedCase.lawyerSpecialization || 'Partner Counsel'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-200 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+1 (212) 555-0144 (Direct Line)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>counsel@lcms.law</span>
                      </div>
                    </div>
                  </div>

                  {/* Courtroom & Hearing Card */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                      Court Docket &amp; Venue
                    </span>

                    <div className="mt-3 space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Tribunal</span>
                        <span className="font-bold text-slate-900">{selectedCase.courtInfo.courtName}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Venue Location</span>
                        <span className="text-slate-700">{selectedCase.courtInfo.courtLocation}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Docket Index</span>
                          <span className="font-mono font-bold text-slate-900">
                            {selectedCase.courtInfo.courtDocketNumber || 'Under Seal'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Chambers / Bench</span>
                          <span className="text-slate-700 font-medium">
                            {selectedCase.courtInfo.benchRoom || 'Chambers 4A'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Presiding Judge</span>
                        <span className="font-serif font-bold text-slate-900">{selectedCase.courtInfo.judgeName}</span>
                      </div>

                      {selectedCase.nextHearingDate && (
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900">
                          <span className="text-[10px] uppercase font-black tracking-wider block text-purple-700">
                            Next Hearing Scheduled
                          </span>
                          <span className="text-sm font-bold">{selectedCase.nextHearingDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Cases Table */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Search and Filters */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, docket number, or type..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Hearing Scheduled">Hearing Scheduled</option>
                    <option value="Won">Won</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {filteredCases.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <Scale className="w-12 h-12 mx-auto text-slate-300 mb-3 stroke-1" />
                  <h3 className="font-serif font-bold text-slate-800 text-lg">No Cases Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                    You do not have any cases matching the current query. Apply for a new legal case to retain counsel.
                  </p>
                  <button
                    onClick={onOpenApply}
                    className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition"
                  >
                    Submit Case Application
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">Docket Number</th>
                        <th className="py-3.5 px-4">Case Title &amp; Area</th>
                        <th className="py-3.5 px-4">Lead Counsel</th>
                        <th className="py-3.5 px-4">Next Hearing</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCases.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{c.caseNumber}</td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-bold text-slate-900 block truncate">{c.title}</span>
                            <span className="text-[11px] text-slate-500">{c.caseType}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-800 block">{c.lawyerName || 'Assigning...'}</span>
                            <span className="text-[10px] text-slate-400">{c.lawyerSpecialization}</span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-purple-700">
                            {c.nextHearingDate || <span className="text-slate-400 font-normal">Not Scheduled</span>}
                          </td>
                          <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedCase(c)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-amber-400 font-bold text-xs hover:bg-slate-800 transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Matter</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Applications Tracker */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-slate-900">Submitted Case Applications</h3>
            <button
              onClick={onOpenApply}
              className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit New Intake</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {myApplications.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                      {app.applicationNumber}
                    </span>
                    <h4 className="text-lg font-serif font-bold text-slate-900 mt-2">{app.caseTitle}</h4>
                    <p className="text-xs text-slate-500">
                      Submitted on {new Date(app.submittedDate).toLocaleDateString()} • Practice Area: {app.caseType} •
                      Priority: {app.priority}
                    </p>
                  </div>

                  <div>
                    {app.status === 'Pending' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Review
                      </span>
                    )}
                    {app.status === 'Under Review' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Under Review by Partner
                      </span>
                    )}
                    {app.status === 'Approved' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved &amp; Retained
                      </span>
                    )}
                    {app.status === 'Rejected' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{app.description}</p>

                {app.rejectionReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-4">
                    <strong>Declination Reason:</strong> {app.rejectionReason}
                  </div>
                )}

                {/* Progress bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                    <span className="text-amber-700 font-bold">1. Intake Submitted ✓</span>
                    <span className={app.status !== 'Pending' ? 'text-amber-700 font-bold' : ''}>
                      2. Partner Evaluation
                    </span>
                    <span className={app.status === 'Approved' ? 'text-emerald-700 font-bold' : ''}>
                      3. Docket Activated
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        app.status === 'Approved'
                          ? 'w-full bg-emerald-500'
                          : app.status === 'Rejected'
                          ? 'w-1/2 bg-red-500'
                          : app.status === 'Under Review'
                          ? 'w-2/3 bg-blue-500'
                          : 'w-1/3 bg-amber-500'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Hearings Calendar */}
      {activeTab === 'hearings' && (
        <div className="space-y-6">
          <h3 className="font-serif font-bold text-xl text-slate-900">My Upcoming Court Hearings</h3>

          {myHearings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No Hearings Calendared</p>
              <p className="text-xs text-slate-400 mt-1">There are no upcoming courtroom appearances scheduled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myHearings.map((hr) => (
                <div key={hr.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {hr.caseNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                        {hr.status}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-slate-900 text-base mb-1">{hr.caseTitle}</h4>
                    <p className="text-xs text-slate-500 mb-4">{hr.courtName}</p>

                    <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700">
                      <div>
                        <strong>Date &amp; Time:</strong> {hr.hearingDate} at {hr.hearingTime}
                      </div>
                      <div>
                        <strong>Courtroom / Bench:</strong> {hr.roomOrBench}
                      </div>
                      <div>
                        <strong>Presiding Judge:</strong> {hr.judgeName}
                      </div>
                      <div>
                        <strong>Agenda:</strong> {hr.agendaNotes}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Lead Counsel: {hr.lawyerName}</span>
                    <button
                      onClick={() => {
                        const targetCase = cases.find((c) => c.id === hr.caseId);
                        if (targetCase) {
                          setSelectedCase(targetCase);
                          setActiveTab('cases');
                        }
                      }}
                      className="font-bold text-amber-700 hover:text-amber-800"
                    >
                      View Case →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: My Profile & Security */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Details */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h3 className="font-serif font-bold text-xl text-slate-900 mb-1">Client Profile Information</h3>
            <p className="text-xs text-slate-500 mb-6">Update contact details and authorized communication records.</p>

            {profileSaved && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile information saved successfully.</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address (Read Only)
                </label>
                <input
                  type="email"
                  value={currentUser?.email}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg text-xs transition"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Password Security */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-bold text-xl text-slate-900 mb-1">Security &amp; Password</h3>
              <p className="text-xs text-slate-500 mb-6">Manage authentication credentials and access control.</p>

              {pwMsg && (
                <div
                  className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                    pwMsg.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>{pwMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg text-xs transition"
                >
                  Update Password
                </button>
              </form>
            </div>

            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Privilege Isolation</span>
              </div>
              <p>
                All account sessions are strictly compartmentalized. You cannot access or view records of any other
                client on the LCMS platform.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
