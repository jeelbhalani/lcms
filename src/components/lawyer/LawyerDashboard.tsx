import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Scale,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Sparkles,
  User,
  Phone,
  Mail,
  Shield,
  Upload,
  CheckSquare,
  Square,
  ChevronRight,
  Gavel,
  BookOpen,
  ArrowRight,
  Send,
  Loader2,
} from 'lucide-react';
import { Case, CaseStatus, DocumentCategory, CasePriority } from '../../types';

interface LawyerDashboardProps {
  selectedCaseId?: string | null;
}

export const LawyerDashboard: React.FC<LawyerDashboardProps> = ({ selectedCaseId: initialCaseId }) => {
  const {
    currentUser,
    cases,
    timelineEvents,
    documents,
    hearings,
    tasks,
    updateCaseStatus,
    addCaseNote,
    addCaseTimelineEvent,
    addCaseDocument,
    deleteCaseDocument,
    scheduleHearing,
    addTask,
    toggleTask,
  } = useApp();

  // Lawyer only has access to assigned cases!
  const myAssignedCases = cases.filter((c) => c.lawyerId === currentUser?.id);

  const [selectedCase, setSelectedCase] = useState<Case | null>(() => {
    if (initialCaseId) {
      return myAssignedCases.find((c) => c.id === initialCaseId) || myAssignedCases[0] || null;
    }
    return myAssignedCases[0] || null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'overview' | 'ai_strategy' | 'timeline' | 'documents' | 'hearings' | 'tasks'>('overview');

  // Case Note Form
  const [newNoteText, setNewNoteText] = useState('');
  const [isConfidentialNote, setIsConfidentialNote] = useState(false);

  // New Hearing Form
  const [hearingCourt, setHearingCourt] = useState('');
  const [hearingRoom, setHearingRoom] = useState('');
  const [hearingJudge, setHearingJudge] = useState('');
  const [hearingDate, setHearingDate] = useState('2026-10-28');
  const [hearingTime, setHearingTime] = useState('10:00 AM');
  const [hearingAgenda, setHearingAgenda] = useState('');
  const [showHearingForm, setShowHearingForm] = useState(false);

  // New Document Upload Form
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Pleading');
  const [docConfidential, setDocConfidential] = useState(false);
  const [docDescription, setDocDescription] = useState('');
  const [showDocForm, setShowDocForm] = useState(false);

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('2026-10-25');
  const [taskPriority, setTaskPriority] = useState<CasePriority>('High');
  const [showTaskForm, setShowTaskForm] = useState(false);

  // AI High-Thinking Case Strategy Analysis State
  // Uses gemini-3.1-pro-preview with thinkingLevel: HIGH (no maxOutputTokens)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Filtered cases
  const filteredCases = myAssignedCases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const myHearings = hearings.filter((h) => h.lawyerId === currentUser?.id);
  const myTasks = tasks.filter((t) => t.assignedLawyerId === currentUser?.id);

  // Handle AI Analysis
  const handleRunAiAnalysis = async () => {
    if (!selectedCase) return;
    setIsAnalyzing(true);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: selectedCase.title,
          caseType: selectedCase.caseType,
          casePriority: selectedCase.priority,
          description: selectedCase.description,
          courtInfo: selectedCase.courtInfo,
          opposingParty: selectedCase.opposingParty,
          filingDate: selectedCase.filingDate,
          updates: selectedCase.notesVisibleToClient.map((n) => ({ notes: n })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate legal strategy analysis.');
      }
      setAiAnalysis(data.analysis);
      setActiveWorkspaceTab('ai_strategy');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error occurred while contacting legal AI intelligence engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !newNoteText.trim()) return;
    addCaseNote(selectedCase.id, newNoteText, isConfidentialNote);
    setNewNoteText('');
  };

  const handleScheduleHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    scheduleHearing({
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      caseTitle: selectedCase.title,
      courtName: hearingCourt || selectedCase.courtInfo.courtName,
      courtLocation: selectedCase.courtInfo.courtLocation,
      roomOrBench: hearingRoom || selectedCase.courtInfo.benchRoom || 'Chambers 3B',
      judgeName: hearingJudge || selectedCase.courtInfo.judgeName || 'Hon. Judge Presiding',
      hearingDate,
      hearingTime,
      status: 'Scheduled',
      agendaNotes: hearingAgenda || 'Oral arguments and case management conference.',
      lawyerId: currentUser?.id || 'u-lawyer-1',
      lawyerName: currentUser?.name || 'Lead Counsel',
      clientId: selectedCase.clientId,
      clientName: selectedCase.clientName,
    });

    setShowHearingForm(false);
    setHearingAgenda('');
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !docName.trim()) return;

    addCaseDocument({
      caseId: selectedCase.id,
      name: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
      category: docCategory,
      fileSize: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
      fileType: 'application/pdf',
      uploadedBy: currentUser?.name || 'Lead Counsel',
      uploaderRole: 'lawyer',
      description: docDescription || 'Official case record filed by attorney.',
      isConfidential: docConfidential,
      url: '#',
    });

    setDocName('');
    setDocDescription('');
    setShowDocForm(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !taskTitle.trim()) return;

    addTask({
      caseId: selectedCase.id,
      caseNumber: selectedCase.caseNumber,
      title: taskTitle,
      deadlineDate: taskDeadline,
      priority: taskPriority,
      assignedLawyerId: currentUser?.id || 'u-lawyer-1',
      notes: 'Scheduled by lead counsel.',
    });

    setTaskTitle('');
    setShowTaskForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* 1. Lawyer Header Profile Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={
              currentUser?.avatar ||
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
            }
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/60 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Attorney Docket Workspace
              </span>
              <span className="text-xs text-amber-400 font-semibold">Bar Admission: {currentUser?.barNumber || 'NY-940212'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              {currentUser?.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {currentUser?.specialization} • {currentUser?.experienceYears || 15} Years Senior Litigation Experience
            </p>
          </div>
        </div>

        {/* Quick Caseload Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-xs text-slate-400 block font-medium">Assigned Cases</span>
            <span className="text-xl font-bold font-serif text-white">{myAssignedCases.length}</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-xs text-slate-400 block font-medium">Upcoming Hearings</span>
            <span className="text-xl font-bold font-serif text-purple-400">{myHearings.length}</span>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
            <span className="text-xs text-slate-400 block font-medium">Open Deadlines</span>
            <span className="text-xl font-bold font-serif text-amber-400">
              {myTasks.filter((t) => !t.isCompleted).length}
            </span>
          </div>
        </div>
      </div>

      {/* Pending Verification Notice Banner */}
      {currentUser?.verificationStatus === 'pending' && (
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-700 rounded-xl shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-950 flex items-center gap-2">
                <span>Bar Licensure Under Administrative Verification</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  Pending Review
                </span>
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Your submitted Bar License Number (<strong>{currentUser.barNumber || 'On file'}</strong>) and License Document (
                <strong>{currentUser.licenseDocument?.name || 'Attached'}</strong>) are currently undergoing verification by the managing partner.
              </p>
            </div>
          </div>
          <span className="text-xs text-amber-900 font-semibold italic shrink-0">
            Full courtroom docket access will activate upon verification
          </span>
        </div>
      )}

      {/* 2. Main Workspace Grid: Left Case List & Right Detailed Case Docket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (4 Cols): Assigned Cases Master List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-bold text-base text-slate-900">Assigned Matters ({myAssignedCases.length})</h3>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Active Caseload</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search my cases..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Cases Scrollable List */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCase(c);
                      setAiAnalysis(null);
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                        {c.caseNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Hearing Scheduled'
                            ? 'bg-purple-100 text-purple-800'
                            : c.status === 'Won'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug mb-1">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 truncate">Client: {c.clientName}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200/60">
                      <span>{c.caseType}</span>
                      <span className="text-red-600 font-semibold">{c.priority}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col (8 Cols): Selected Case Workspace */}
        <div className="lg:col-span-8">
          {selectedCase ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
              {/* Workspace Header */}
              <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                      {selectedCase.caseNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedCase.caseType}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                      {selectedCase.priority}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    <select
                      value={selectedCase.status}
                      onChange={(e) => updateCaseStatus(selectedCase.id, e.target.value as CaseStatus)}
                      className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Hearing Scheduled">Hearing Scheduled</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2 leading-snug">
                  {selectedCase.title}
                </h2>
                <div className="text-xs text-slate-400 flex flex-wrap gap-4">
                  <span>Client: <strong className="text-slate-200">{selectedCase.clientName}</strong> ({selectedCase.clientEmail})</span>
                  <span>Opposing Party: <strong className="text-slate-200">{selectedCase.opposingParty}</strong></span>
                </div>
              </div>

              {/* Workspace Navigation Bar */}
              <div className="bg-slate-100 px-6 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <button
                    onClick={() => setActiveWorkspaceTab('overview')}
                    className={`py-3.5 px-3 border-b-2 uppercase tracking-wider transition ${
                      activeWorkspaceTab === 'overview'
                        ? 'border-amber-600 text-amber-700'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Docket Overview
                  </button>

                  <button
                    onClick={() => setActiveWorkspaceTab('ai_strategy')}
                    className={`py-3.5 px-3 border-b-2 uppercase tracking-wider transition flex items-center gap-1.5 ${
                      activeWorkspaceTab === 'ai_strategy'
                        ? 'border-amber-600 text-amber-700'
                        : 'border-transparent text-amber-800 hover:text-amber-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>AI Legal Strategy</span>
                  </button>

                  <button
                    onClick={() => setActiveWorkspaceTab('timeline')}
                    className={`py-3.5 px-3 border-b-2 uppercase tracking-wider transition ${
                      activeWorkspaceTab === 'timeline'
                        ? 'border-amber-600 text-amber-700'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Timeline &amp; Notes
                  </button>

                  <button
                    onClick={() => setActiveWorkspaceTab('documents')}
                    className={`py-3.5 px-3 border-b-2 uppercase tracking-wider transition ${
                      activeWorkspaceTab === 'documents'
                        ? 'border-amber-600 text-amber-700'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Documents ({documents.filter((d) => d.caseId === selectedCase.id).length})
                  </button>

                  <button
                    onClick={() => setActiveWorkspaceTab('hearings')}
                    className={`py-3.5 px-3 border-b-2 uppercase tracking-wider transition ${
                      activeWorkspaceTab === 'hearings'
                        ? 'border-amber-600 text-amber-700'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hearings
                  </button>

                  <button
                    onClick={() => setActiveWorkspaceTab('tasks')}
                    className={`py-3.5 px-3 border-b-2 uppercase tracking-wider transition ${
                      activeWorkspaceTab === 'tasks'
                        ? 'border-amber-600 text-amber-700'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Deadlines &amp; Tasks
                  </button>
                </div>
              </div>

              {/* Workspace Tab Contents */}
              <div className="p-6 flex-1">
                {/* 1. Overview Tab */}
                {activeWorkspaceTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Court Info Banner */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <Gavel className="w-4 h-4 text-purple-600" />
                        <span>Presiding Tribunal &amp; Docket Details</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Court / Tribunal</span>
                          <span className="font-bold text-slate-900">{selectedCase.courtInfo.courtName}</span>
                          <span className="text-slate-500 block text-[11px] mt-0.5">{selectedCase.courtInfo.courtLocation}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Presiding Judge &amp; Chambers</span>
                          <span className="font-serif font-bold text-slate-900">{selectedCase.courtInfo.judgeName}</span>
                          <span className="text-slate-500 block text-[11px] mt-0.5">{selectedCase.courtInfo.benchRoom || 'Chambers 4A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Court Docket Number</span>
                          <span className="font-mono font-bold text-amber-700">{selectedCase.courtInfo.courtDocketNumber || '3:26-cv-01492'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Next Calendared Hearing</span>
                          <span className="font-bold text-purple-700">
                            {selectedCase.nextHearingDate || 'No hearing currently scheduled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Factual Description */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Factual Claims &amp; Discovery Basis
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {selectedCase.description}
                      </p>
                    </div>

                    {/* Quick Trigger for AI Legal Strategy Analysis */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/5 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Legal Intelligence Engine (gemini-3.8-flash)</span>
                        </div>
                        <h4 className="font-serif font-bold text-slate-900 text-base">
                          Generate Deep Legal Case Strategy &amp; Precedent Brief
                        </h4>
                        <p className="text-xs text-slate-600 max-w-lg mt-0.5">
                          Calculates litigation readiness scores, anticipates opposing counsel motions to dismiss, formats
                          witness cross-examination directives, and provides settlement leverage probabilities.
                        </p>
                      </div>

                      <button
                        onClick={handleRunAiAnalysis}
                        disabled={isAnalyzing}
                        className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs transition flex items-center gap-2 shrink-0 shadow-md disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Formulating Strategic Legal Brief...</span>
                          </>
                        ) : (
                          <>
                            <span>Run AI Legal Analysis</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Confidential Lawyer Notes vs Client Updates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/80">
                        <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider flex items-center gap-1 mb-2">
                          <Shield className="w-3.5 h-3.5 text-red-600" />
                          Confidential Work Product (Lawyer Only)
                        </span>
                        <div className="space-y-1.5 text-xs text-slate-700">
                          {selectedCase.confidentialLawyerNotes.map((note, idx) => (
                            <div key={idx} className="p-2 bg-white rounded-lg border border-red-100">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80">
                        <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider flex items-center gap-1 mb-2">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          Updates Visible to Client
                        </span>
                        <div className="space-y-1.5 text-xs text-slate-700">
                          {selectedCase.notesVisibleToClient.map((note, idx) => (
                            <div key={idx} className="p-2 bg-white rounded-lg border border-blue-100">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. AI Strategy Analysis Tab */}
                {activeWorkspaceTab === 'ai_strategy' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Model: gemini-3.8-flash</span>
                        </div>
                        <h3 className="font-serif font-bold text-xl text-slate-900 mt-1">
                          Strategic Case Evaluation &amp; Evidentiary Blueprint
                        </h3>
                      </div>

                      <button
                        onClick={handleRunAiAnalysis}
                        disabled={isAnalyzing}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Thinking...</span>
                          </>
                        ) : (
                          <>
                            <span>Re-Analyze Case Strategy</span>
                            <Sparkles className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                    {aiError && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{aiError}</span>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="py-16 text-center text-slate-600 bg-slate-50 rounded-2xl border border-slate-200">
                        <Loader2 className="w-10 h-10 animate-spin text-amber-600 mx-auto mb-3" />
                        <h4 className="font-serif font-bold text-slate-900 text-base">
                          High-Reasoning Thinking Mode Active
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                          Evaluating statutory precedents, calculating probability distributions, parsing evidentiary
                          hazards, and deconstructing opposing counsel affirmative defenses.
                        </p>
                      </div>
                    )}

                    {!isAnalyzing && !aiAnalysis && (
                      <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                        <BookOpen className="w-10 h-10 text-amber-500 mx-auto mb-2 stroke-1" />
                        <h4 className="font-serif font-bold text-slate-800 text-base">
                          No Active Strategy Brief Generated Yet
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                          Click below to execute a deep legal analysis powered by Gemini 3.1 Pro with High Thinking.
                        </p>
                        <button
                          onClick={handleRunAiAnalysis}
                          className="px-6 py-2.5 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition"
                        >
                          Execute Legal Analysis Now
                        </button>
                      </div>
                    )}

                    {!isAnalyzing && aiAnalysis && (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-800 space-y-4">
                        <div className="prose prose-sm max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans">
                          {aiAnalysis}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Timeline & Notes Tab */}
                {activeWorkspaceTab === 'timeline' && (
                  <div className="space-y-6">
                    {/* Add note / update form */}
                    <form onSubmit={handleAddNote} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Log Case Note or Client Communication
                        </span>
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isConfidentialNote}
                            onChange={(e) => setIsConfidentialNote(e.target.value === 'true' || e.target.checked)}
                            className="rounded text-amber-600"
                          />
                          <span>Work-Product Confidential (Hide from Client)</span>
                        </label>
                      </div>

                      <textarea
                        rows={3}
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Detail progress, phone conference notes, settlement posture, or court filing updates..."
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      ></textarea>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Log Note to Docket</span>
                      </button>
                    </form>

                    {/* Timeline Feed */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                        Chronological Docket History
                      </h4>

                      <div className="border-l-2 border-slate-200 ml-3 pl-5 space-y-5">
                        {timelineEvents
                          .filter((t) => t.caseId === selectedCase.id)
                          .map((evt) => (
                            <div key={evt.id} className="relative">
                              <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-amber-500 shadow-sm"></span>
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="text-xs font-bold text-slate-900">{evt.title}</h5>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(evt.timestamp).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{evt.description}</p>
                              <span className="text-[10px] text-slate-400 block mt-1">By {evt.createdBy}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Documents Tab */}
                {activeWorkspaceTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Case Documents &amp; Pleadings</h4>
                      <button
                        onClick={() => setShowDocForm(!showDocForm)}
                        className="px-3.5 py-1.5 bg-slate-900 text-amber-400 font-bold text-xs rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Pleading / Exhibit</span>
                      </button>
                    </div>

                    {showDocForm && (
                      <form onSubmit={handleUploadDoc} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                              Document Name
                            </label>
                            <input
                              type="text"
                              value={docName}
                              onChange={(e) => setDocName(e.target.value)}
                              placeholder="e.g. Motion_In_Limine_Exhibits"
                              required
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                              Document Category
                            </label>
                            <select
                              value={docCategory}
                              onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            >
                              <option value="Pleading">Pleading / Motion</option>
                              <option value="Evidence">Evidence / Forensic Exhibit</option>
                              <option value="Court Order">Court Order</option>
                              <option value="Contract">Contract / Addendum</option>
                              <option value="Retainer">Retainer / Fee Letter</option>
                              <option value="Affidavit">Affidavit / Declaration</option>
                              <option value="Other">Other Memorandum</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={docConfidential}
                              onChange={(e) => setDocConfidential(e.target.checked)}
                              className="rounded text-amber-600"
                            />
                            <span>Confidential Work Product (Client Cannot View)</span>
                          </label>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowDocForm(false)}
                              className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1 rounded bg-slate-900 text-amber-400 font-bold text-xs"
                            >
                              Save to Docket
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {documents
                        .filter((d) => d.caseId === selectedCase.id)
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-100 transition"
                          >
                            <div className="flex items-center gap-3 truncate">
                              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 truncate">{doc.name}</span>
                                  {doc.isConfidential && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700">
                                      CONFIDENTIAL
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500">
                                  {doc.category} • {doc.fileSize} • Uploaded by {doc.uploadedBy} on {doc.uploadDate}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href="#download"
                                onClick={(e) => {
                                  e.preventDefault();
                                  alert(`Downloading official court copy: ${doc.name}`);
                                }}
                                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:text-amber-700 font-semibold text-xs rounded-lg shadow-sm"
                              >
                                Download
                              </a>
                              <button
                                onClick={() => deleteCaseDocument(doc.id)}
                                className="p-1 text-slate-400 hover:text-red-500 transition"
                                title="Delete document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 5. Hearings Tab */}
                {activeWorkspaceTab === 'hearings' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Court Hearings Calendared
                      </h4>
                      <button
                        onClick={() => setShowHearingForm(!showHearingForm)}
                        className="px-3.5 py-1.5 bg-slate-900 text-amber-400 font-bold text-xs rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Hearing Appearance</span>
                      </button>
                    </div>

                    {showHearingForm && (
                      <form onSubmit={handleScheduleHearing} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                              Court Name
                            </label>
                            <input
                              type="text"
                              value={hearingCourt}
                              onChange={(e) => setHearingCourt(e.target.value)}
                              placeholder={selectedCase.courtInfo.courtName}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                              Courtroom / Bench
                            </label>
                            <input
                              type="text"
                              value={hearingRoom}
                              onChange={(e) => setHearingRoom(e.target.value)}
                              placeholder="Courtroom 8, 19th Floor"
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                              Hearing Date
                            </label>
                            <input
                              type="date"
                              value={hearingDate}
                              onChange={(e) => setHearingDate(e.target.value)}
                              required
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                              Hearing Time
                            </label>
                            <input
                              type="text"
                              value={hearingTime}
                              onChange={(e) => setHearingTime(e.target.value)}
                              placeholder="10:00 AM PST"
                              required
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Hearing Agenda &amp; Motions to be Heard
                          </label>
                          <input
                            type="text"
                            value={hearingAgenda}
                            onChange={(e) => setHearingAgenda(e.target.value)}
                            placeholder="e.g. Oral argument on Plaintiff Motion for Preliminary Injunction"
                            required
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowHearingForm(false)}
                            className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1 rounded bg-slate-900 text-amber-400 font-bold text-xs"
                          >
                            Calendar Hearing
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-3">
                      {hearings
                        .filter((h) => h.caseId === selectedCase.id)
                        .map((hr) => (
                          <div key={hr.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-purple-700">{hr.courtName}</span>
                              <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 text-[10px]">
                                {hr.status}
                              </span>
                            </div>

                            <p className="font-bold text-slate-900 mb-1">{hr.agendaNotes}</p>
                            <p className="text-slate-600">
                              Date: <strong>{hr.hearingDate}</strong> at <strong>{hr.hearingTime}</strong> • {hr.roomOrBench} • Judge: {hr.judgeName}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 6. Deadlines & Tasks Tab */}
                {activeWorkspaceTab === 'tasks' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Statute &amp; Motion Deadlines
                      </h4>
                      <button
                        onClick={() => setShowTaskForm(!showTaskForm)}
                        className="px-3.5 py-1.5 bg-slate-900 text-amber-400 font-bold text-xs rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Deadline Task</span>
                      </button>
                    </div>

                    {showTaskForm && (
                      <form onSubmit={handleAddTask} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-fadeIn">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Task / Deadline Description
                          </label>
                          <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="e.g. Serve Expert Witness Disclosure & Subpoena Radar Logs"
                            required
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                              Due Date
                            </label>
                            <input
                              type="date"
                              value={taskDeadline}
                              onChange={(e) => setTaskDeadline(e.target.value)}
                              required
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                              Priority
                            </label>
                            <select
                              value={taskPriority}
                              onChange={(e) => setTaskPriority(e.target.value as CasePriority)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowTaskForm(false)}
                            className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1 rounded bg-slate-900 text-amber-400 font-bold text-xs"
                          >
                            Save Task
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {tasks
                        .filter((t) => t.caseId === selectedCase.id)
                        .map((tsk) => (
                          <div
                            key={tsk.id}
                            onClick={() => toggleTask(tsk.id)}
                            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                              tsk.isCompleted
                                ? 'bg-slate-50 border-slate-200 opacity-60 line-through'
                                : 'bg-white border-slate-200 hover:border-amber-400 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {tsk.isCompleted ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className="font-semibold text-slate-800">{tsk.title}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-slate-500 font-medium">Due: {tsk.deadlineDate}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                {tsk.priority}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500">
              <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-slate-800 text-lg">Select an Assigned Case</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Choose a matter from your caseload panel on the left to access trial dockets, hearings, and AI legal strategy analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
