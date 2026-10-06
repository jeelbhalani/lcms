import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Briefcase,
  Scale,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  Download,
  Shield,
  Settings,
  Eye,
  Check,
  X,
  Sparkles,
  BarChart3,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Trash2,
  Globe,
  ImageIcon,
  Loader2,
} from 'lucide-react';
import { Case, CaseStatus, CasePriority, CaseType, UserRole } from '../../types';
import { AuditLogsView } from './AuditLogsView';

interface AdminDashboardProps {
  onSelectCase?: (caseId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const {
    currentUser,
    users,
    cases,
    applications,
    hearings,
    auditLogs,
    contactMessages,
    websiteSettings,
    approveApplication,
    rejectApplication,
    createCase,
    updateCaseStatus,
    assignLawyerToCase,
    toggleUserStatus,
    addUser,
    verifyLawyer,
    updateContactStatus,
    updateWebsiteSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'cases' | 'applications' | 'lawyers' | 'clients' | 'cms' | 'contacts' | 'reports' | 'audit' | 'ai_graphics'
  >('overview');

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [caseFilterStatus, setCaseFilterStatus] = useState('All');
  const [caseFilterType, setCaseFilterType] = useState('All');

  // Modals / Drawers
  const [reviewAppModal, setReviewAppModal] = useState<string | null>(null);
  const [assignLawyerModal, setAssignLawyerModal] = useState<string | null>(null);
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>('u-lawyer-1');
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // New Case Modal
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseType, setNewCaseType] = useState<CaseType>('Corporate Law');
  const [newCasePriority, setNewCasePriority] = useState<CasePriority>('Medium');
  const [newCaseClientId, setNewCaseClientId] = useState('u-client-1');
  const [newCaseLawyerId, setNewCaseLawyerId] = useState('u-lawyer-1');
  const [newCaseDescription, setNewCaseDescription] = useState('');

  // New Lawyer Modal
  const [showNewLawyerModal, setShowNewLawyerModal] = useState(false);
  const [newLawyerName, setNewLawyerName] = useState('');
  const [newLawyerEmail, setNewLawyerEmail] = useState('');
  const [newLawyerPhone, setNewLawyerPhone] = useState('');
  const [newLawyerBar, setNewLawyerBar] = useState('');
  const [newLawyerSpec, setNewLawyerSpec] = useState('Corporate Law');
  const [newLawyerExp, setNewLawyerExp] = useState(10);
  const [newLawyerBio, setNewLawyerBio] = useState('');

  // CMS Editor State
  const [cmsHeroHeading, setCmsHeroHeading] = useState(websiteSettings.heroHeading);
  const [cmsHeroSubheading, setCmsHeroSubheading] = useState(websiteSettings.heroSubheading);
  const [cmsPhone, setCmsPhone] = useState(websiteSettings.phoneNumber);
  const [cmsEmail, setCmsEmail] = useState(websiteSettings.emailAddress);
  const [cmsAddress, setCmsAddress] = useState(websiteSettings.officeAddress);
  const [cmsSaved, setCmsSaved] = useState(false);

  // AI High-Quality Image Generator State
  // Uses gemini-3-pro-image-preview with imageSize: 1K, 2K, 4K
  const [imagePrompt, setImagePrompt] = useState(
    'Photorealistic architectural interior of a prestigious mahogany federal appellate courtroom with golden scales of justice, sunbeam lighting, 8k resolution'
  );
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Derived statistics
  const lawyers = users.filter((u) => u.role === 'lawyer');
  const clients = users.filter((u) => u.role === 'client');
  const activeCasesCount = cases.filter((c) => ['Active', 'Hearing Scheduled', 'Approved'].includes(c.status)).length;
  const completedCasesCount = cases.filter((c) => ['Won', 'Closed'].includes(c.status)).length;
  const pendingAppsCount = applications.filter((a) => ['Pending', 'Under Review'].includes(a.status)).length;

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lawyerName && c.lawyerName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = caseFilterStatus === 'All' || c.status === caseFilterStatus;
    const matchesType = caseFilterType === 'All' || c.caseType === caseFilterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle Application Approval
  const handleApprove = (appId: string) => {
    approveApplication(appId, selectedLawyerId);
    setReviewAppModal(null);
    setShowRejectForm(false);
  };

  // Handle Application Rejection
  const handleReject = (appId: string) => {
    if (!rejectionReasonText.trim()) return;
    rejectApplication(appId, rejectionReasonText);
    setReviewAppModal(null);
    setShowRejectForm(false);
    setRejectionReasonText('');
  };

  // Handle New Case
  const handleCreateNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = users.find((u) => u.id === newCaseClientId);
    const targetLawyer = users.find((u) => u.id === newCaseLawyerId);

    createCase({
      title: newCaseTitle,
      caseType: newCaseType,
      priority: newCasePriority,
      status: 'Active',
      clientId: targetClient?.id || 'u-client-1',
      clientName: targetClient?.name || 'Valued Client',
      clientEmail: targetClient?.email || 'client@lcms.law',
      clientPhone: targetClient?.phone || '+1 (555) 000-0000',
      lawyerId: targetLawyer?.id,
      lawyerName: targetLawyer?.name,
      lawyerSpecialization: targetLawyer?.specialization,
      description: newCaseDescription,
      courtInfo: {
        courtName: 'U.S. District Court of General Jurisdiction',
        courtLocation: 'Federal Plaza, Courtroom 4',
        judgeName: 'Hon. Presiding Magistrate',
      },
    });

    setShowNewCaseModal(false);
    setNewCaseTitle('');
    setNewCaseDescription('');
  };

  // Handle New Lawyer
  const handleCreateNewLawyer = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name: newLawyerName,
      email: newLawyerEmail,
      phone: newLawyerPhone,
      role: 'lawyer',
      status: 'active',
      barNumber: newLawyerBar,
      specialization: newLawyerSpec,
      experienceYears: newLawyerExp,
      bio: newLawyerBio,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    });

    setShowNewLawyerModal(false);
    setNewLawyerName('');
    setNewLawyerEmail('');
    setNewLawyerBar('');
    setNewLawyerBio('');
  };

  // Handle CMS Save
  const handleSaveCMS = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteSettings({
      heroHeading: cmsHeroHeading,
      heroSubheading: cmsHeroSubheading,
      phoneNumber: cmsPhone,
      emailAddress: cmsEmail,
      officeAddress: cmsAddress,
    });
    setCmsSaved(true);
    setTimeout(() => setCmsSaved(false), 3000);
  };

  // Handle AI Image Generation (gemini-3-pro-image-preview with 1K, 2K, 4K affordance)
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          imageSize,
          aspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image.');
      }
      setGeneratedImageUrl(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setImageError(err.message || 'Image generation failed.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = 'Case ID,Docket Number,Title,Case Type,Priority,Status,Client,Assigned Lawyer,Filing Date,Next Hearing\n';
    const rows = cases
      .map(
        (c) =>
          `"${c.id}","${c.caseNumber}","${c.title.replace(/"/g, '""')}","${c.caseType}","${c.priority}","${c.status}","${c.clientName}","${c.lawyerName || 'Unassigned'}","${c.filingDate}","${c.nextHearingDate || 'None'}"`
      )
      .join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `LCMS_Legal_Case_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Active</span>;
      case 'Hearing Scheduled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            Hearing Scheduled
          </span>
        );
      case 'Won':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Won</span>;
      case 'Closed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800">Closed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Managing Partner &amp; Administrator Command
              </span>
              <span className="text-xs text-slate-400">Firm: Sterling Vance &amp; Thorne</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              {currentUser?.name || 'Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Complete oversight over case dockets, attorney caseloads, client applications, and firm CMS settings.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setShowNewCaseModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Case</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Clients</span>
          <span className="text-2xl font-serif font-bold text-slate-900 mt-1 block">{clients.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Attorneys</span>
          <span className="text-2xl font-serif font-bold text-slate-900 mt-1 block">{lawyers.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Dockets</span>
          <span className="text-2xl font-serif font-bold text-slate-900 mt-1 block">{cases.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Pending Intakes</span>
          <span className="text-2xl font-serif font-bold text-amber-600 mt-1 block">{pendingAppsCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Active Cases</span>
          <span className="text-2xl font-serif font-bold text-blue-600 mt-1 block">{activeCasesCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Completed / Won</span>
          <span className="text-2xl font-serif font-bold text-emerald-600 mt-1 block">{completedCasesCount}</span>
        </div>
      </div>

      {/* 3. Admin Module Navigation Tabs */}
      <div className="border-b border-slate-200 mb-8 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('cases')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
            activeTab === 'cases'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Cases ({cases.length})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
            activeTab === 'applications'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Applications ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab('lawyers')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
            activeTab === 'lawyers'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Attorneys ({lawyers.length})
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
            activeTab === 'clients'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Clients ({clients.length})
        </button>

        <button
          onClick={() => setActiveTab('cms')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
            activeTab === 'cms'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Website CMS
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
            activeTab === 'contacts'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Inquiries ({contactMessages.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Reports &amp; Metrics
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Audit Log ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('ai_graphics')}
          className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ai_graphics'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'text-amber-800 hover:text-amber-900 hover:bg-amber-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>AI Graphics (1K, 2K, 4K)</span>
        </button>
      </div>

      {/* 4. Tab Views */}

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Recent Applications Alert Banner */}
          {pendingAppsCount > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-amber-900">
                    {pendingAppsCount} Case Application(s) Awaiting Partner Evaluation
                  </h4>
                  <p className="text-[11px] text-amber-700">
                    Review prospective client claims, inspect exhibits, and provision docket numbers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('applications')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition"
              >
                Review Applications →
              </button>
            </div>
          )}

          {/* Quick Tables: Recent Cases & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Recent Cases */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-lg text-slate-900">Active Case Dockets</h3>
                <button
                  onClick={() => setActiveTab('cases')}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  View All ({cases.length}) →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Docket Number</th>
                      <th className="py-2.5 px-3">Case Title</th>
                      <th className="py-2.5 px-3">Assigned Lead</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cases.slice(0, 5).map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-amber-700">{c.caseNumber}</td>
                        <td className="py-3 px-3 max-w-xs font-semibold text-slate-900 truncate">{c.title}</td>
                        <td className="py-3 px-3 text-slate-600">{c.lawyerName || 'Unassigned'}</td>
                        <td className="py-3 px-3">{getStatusBadge(c.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Col: Recent Audit Activity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-lg text-slate-900">Audit Stream</h3>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  Full Log →
                </button>
              </div>

              <div className="space-y-3.5">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="text-xs pb-3 border-b border-slate-100 last:border-none">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{log.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">By {log.userName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: All Cases */}
      {activeTab === 'cases' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dockets, clients, lawyers..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={caseFilterStatus}
                  onChange={(e) => setCaseFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Hearing Scheduled">Hearing Scheduled</option>
                  <option value="Won">Won</option>
                  <option value="Closed">Closed</option>
                </select>

                <select
                  value={caseFilterType}
                  onChange={(e) => setCaseFilterType(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="All">All Practice Areas</option>
                  <option value="Corporate Law">Corporate Law</option>
                  <option value="Criminal Defense">Criminal Defense</option>
                  <option value="Intellectual Property">Intellectual Property</option>
                  <option value="Civil Litigation">Civil Litigation</option>
                  <option value="Real Estate & Property">Real Estate</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Docket Number</th>
                    <th className="py-3 px-3">Title &amp; Type</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Assigned Counsel</th>
                    <th className="py-3 px-3">Next Hearing</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-amber-700">{c.caseNumber}</td>
                      <td className="py-3.5 px-3 max-w-xs">
                        <span className="font-bold text-slate-900 block truncate">{c.title}</span>
                        <span className="text-[10px] text-slate-500">{c.caseType}</span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-800">{c.clientName}</td>
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-800 block">{c.lawyerName || 'Unassigned'}</span>
                        <button
                          onClick={() => setAssignLawyerModal(c.id)}
                          className="text-[10px] text-amber-700 font-bold hover:underline"
                        >
                          Reassign Counsel
                        </button>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-purple-700">{c.nextHearingDate || 'None'}</td>
                      <td className="py-3.5 px-3">{getStatusBadge(c.status)}</td>
                      <td className="py-3.5 px-3 text-right">
                        <select
                          value={c.status}
                          onChange={(e) => updateCaseStatus(c.id, e.target.value as CaseStatus)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                        >
                          <option value="Active">Active</option>
                          <option value="Hearing Scheduled">Hearing Scheduled</option>
                          <option value="Won">Won</option>
                          <option value="Closed">Closed</option>
                          <option value="On Hold">On Hold</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Applications Review */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-slate-900">Case Intake Applications</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {app.applicationNumber}
                      </span>
                      <h4 className="text-lg font-serif font-bold text-slate-900 mt-1">{app.caseTitle}</h4>
                      <p className="text-xs text-slate-500">
                        Applicant: <strong>{app.clientName}</strong> ({app.clientEmail} • {app.clientPhone}) •
                        Submitted {new Date(app.submittedDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-4">{app.description}</p>

                  {app.supportingDocuments && app.supportingDocuments.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Attached Exhibits:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {app.supportingDocuments.map((doc, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            <span>{doc.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {app.status === 'Pending' || app.status === 'Under Review' ? (
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">Intake Decision Actions:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReviewAppModal(app.id);
                          setShowRejectForm(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs transition"
                      >
                        Decline Matter
                      </button>

                      <button
                        onClick={() => {
                          setReviewAppModal(app.id);
                          setShowRejectForm(false);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-slate-900 text-amber-400 hover:bg-slate-800 font-bold text-xs transition"
                      >
                        Approve &amp; Assign Counsel →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                    Decision recorded by: {app.reviewedBy || 'Managing Partner'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Attorneys Management */}
      {activeTab === 'lawyers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-slate-900">Partner &amp; Attorney Registry</h3>
            <button
              onClick={() => setShowNewLawyerModal(true)}
              className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Attorney</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => {
              const assignedCount = cases.filter((c) => c.lawyerId === lawyer.id).length;
              const isPending = lawyer.verificationStatus === 'pending';
              return (
                <div
                  key={lawyer.id}
                  className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${
                    isPending ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={lawyer.avatar}
                          alt={lawyer.name}
                          className="w-14 h-14 rounded-xl object-cover border border-amber-500/30"
                        />
                        <div>
                          <h4 className="font-serif font-bold text-base text-slate-900">{lawyer.name}</h4>
                          <span className="text-xs text-amber-800 font-medium block">{lawyer.specialization}</span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            Bar License #: {lawyer.barNumber || 'None'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Status Badge */}
                    <div className="mb-3">
                      {isPending ? (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending Lawyer Verification
                          </span>
                          <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">
                            Action Req.
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Bar Licensure Verified
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      <div>Email: <strong>{lawyer.email}</strong></div>
                      <div>Phone: {lawyer.phone}</div>
                      <div>Experience: {lawyer.experienceYears} Years</div>
                      {lawyer.jurisdiction && (
                        <div>Jurisdiction: <span className="font-medium text-slate-800">{lawyer.jurisdiction}</span></div>
                      )}
                      <div>
                        Active Caseload:{' '}
                        <strong className="text-slate-900">{assignedCount} matters</strong>
                      </div>
                    </div>

                    {/* License Document Card */}
                    {lawyer.licenseDocument && (
                      <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Uploaded License Document
                        </span>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">{lawyer.licenseDocument.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                            {lawyer.licenseDocument.size}
                          </span>
                        </div>
                        {lawyer.licenseDocument.url && (
                          <a
                            href={lawyer.licenseDocument.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline"
                          >
                            <span>Inspect Document</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {isPending && (
                      <button
                        onClick={() => verifyLawyer(lawyer.id, 'verified')}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify &amp; Approve Licensure</span>
                      </button>
                    )}

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          lawyer.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Account {lawyer.status}
                      </span>

                      <button
                        onClick={() => toggleUserStatus(lawyer.id)}
                        className="text-xs font-semibold text-slate-600 hover:text-red-600 transition"
                      >
                        {lawyer.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Clients Management */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-slate-900">Client Directory</h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Matters on File</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((cli) => {
                    const clientCasesCount = cases.filter((c) => c.clientId === cli.id).length;
                    return (
                      <tr key={cli.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{cli.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{cli.email}</td>
                        <td className="py-3.5 px-4 text-slate-600">{cli.phone}</td>
                        <td className="py-3.5 px-4 font-semibold text-amber-700">{clientCasesCount} Cases</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cli.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {cli.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => toggleUserStatus(cli.id)}
                            className="text-xs text-slate-600 hover:text-red-600 font-semibold"
                          >
                            {cli.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Website CMS */}
      {activeTab === 'cms' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-4xl">
          <div className="mb-6">
            <h3 className="font-serif font-bold text-xl text-slate-900">Website Content Management System</h3>
            <p className="text-xs text-slate-500">
              Customize public website copy, headline banners, and emergency contact coordinates.
            </p>
          </div>

          {cmsSaved && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Firm website content updated live!</span>
            </div>
          )}

          <form onSubmit={handleSaveCMS} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Homepage Hero Heading
              </label>
              <input
                type="text"
                value={cmsHeroHeading}
                onChange={(e) => setCmsHeroHeading(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Hero Subheading / Firm Overview
              </label>
              <textarea
                rows={3}
                value={cmsHeroSubheading}
                onChange={(e) => setCmsHeroSubheading(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Firm Hotline Phone
                </label>
                <input
                  type="text"
                  value={cmsPhone}
                  onChange={(e) => setCmsPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confidential Intake Email
                </label>
                <input
                  type="email"
                  value={cmsEmail}
                  onChange={(e) => setCmsEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Headquarters Office Address
              </label>
              <input
                type="text"
                value={cmsAddress}
                onChange={(e) => setCmsAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition"
            >
              Save &amp; Publish Website Changes
            </button>
          </form>
        </div>
      )}

      {/* Tab: Inquiries */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-slate-900">Website Consultation Inquiries</h3>
          </div>

          <div className="space-y-4">
            {contactMessages.map((msg) => (
              <div key={msg.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-bold text-sm text-slate-900">{msg.subject}</span>
                    <select
                      value={msg.status}
                      onChange={(e) => updateContactStatus(msg.id, e.target.value as any)}
                      className="text-xs border border-slate-300 rounded-lg px-2 py-1 font-semibold"
                    >
                      <option value="New">New</option>
                      <option value="Read">Read</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-500 mb-2">
                    From: <strong>{msg.name}</strong> ({msg.email} • {msg.phone || 'No phone provided'}) •{' '}
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </p>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reports & Metrics */}
      {activeTab === 'reports' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-xl text-slate-900">Litigation Metrics &amp; Practice Health</h3>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-slate-900 text-amber-400 font-bold text-xs rounded-xl hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Matter Status Distribution</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span>Active Cases</span>
                  <strong className="text-blue-600">{activeCasesCount}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hearing Scheduled</span>
                  <strong className="text-purple-600">
                    {cases.filter((c) => c.status === 'Hearing Scheduled').length}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Won / Favorable Judgment</span>
                  <strong className="text-emerald-600">{cases.filter((c) => c.status === 'Won').length}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Closed</span>
                  <strong className="text-slate-600">{cases.filter((c) => c.status === 'Closed').length}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Top Practice Areas</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span>Corporate Law</span>
                  <strong>{cases.filter((c) => c.caseType === 'Corporate Law').length}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Intellectual Property</span>
                  <strong>{cases.filter((c) => c.caseType === 'Intellectual Property').length}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Criminal Defense</span>
                  <strong>{cases.filter((c) => c.caseType === 'Criminal Defense').length}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>Real Estate &amp; Property</span>
                  <strong>{cases.filter((c) => c.caseType === 'Real Estate & Property').length}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Trial Success Indicator</h4>
              <div className="text-3xl font-serif font-bold text-amber-600 mt-2">98.4%</div>
              <p className="text-xs text-slate-500 mt-2">
                Favorable verdict, settlement recovery, or arbitration award resolution across 2,400+ retained matters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && <AuditLogsView />}

      {/* Tab: AI High-Quality Image Studio */}
      {/* Uses gemini-3-pro-image-preview with affordance for user to specify image size: 1K, 2K, 4K */}
      {activeTab === 'ai_graphics' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-4xl space-y-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Legal Graphics Studio (Demonstrative Engine)</span>
            </div>
            <h3 className="font-serif font-bold text-2xl text-slate-900 mt-1">
              High-Quality Legal Graphic &amp; Evidentiary Studio
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Generate courtroom trial demonstratives, architectural judicial renders, and high-fidelity firm branding
              graphics with selectable image resolutions (1K, 2K, and 4K).
            </p>
          </div>

          {imageError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{imageError}</span>
            </div>
          )}

          <form onSubmit={handleGenerateImage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Image Prompt
              </label>
              <textarea
                rows={3}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the legal courtroom scene, architectural law library, or evidentiary graphic..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Image Size Affordance (1K, 2K, 4K) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Resolution / Image Size (Affordance)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1K', '2K', '4K'] as const).map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={`py-2 rounded-lg text-xs font-bold transition border ${
                        imageSize === size
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="16:9">16:9 (Cinematic Landscape)</option>
                  <option value="4:3">4:3 (Classic Landscape)</option>
                  <option value="3:4">3:4 (Portrait)</option>
                  <option value="9:16">9:16 (Tall)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGeneratingImage}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Synthesizing High-Fidelity Graphic ({imageSize})...</span>
                </>
              ) : (
                <>
                  <span>Generate Graphic ({imageSize})</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Generated Image Result */}
          {generatedImageUrl && (
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center animate-fadeIn">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Output Graphic (Size: {imageSize})
              </span>
              <img
                src={generatedImageUrl}
                alt="AI Generated Courtroom Graphic"
                className="max-h-[500px] mx-auto rounded-xl shadow-lg object-contain border border-slate-300"
              />
              <div className="mt-4 flex items-center justify-center gap-3">
                <a
                  href={generatedImageUrl}
                  download="legal_courtroom_render.png"
                  className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res Graphic</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Application Modal */}
      {reviewAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">
              {showRejectForm ? 'Decline Case Application' : 'Approve & Retain Counsel'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {showRejectForm
                ? 'Provide a formal explanation that will be recorded and notified to the applicant.'
                : 'Select the lead partner or counsel to assume responsibility for this active docket.'}
            </p>

            {showRejectForm ? (
              <div className="space-y-4">
                <textarea
                  rows={4}
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  placeholder="e.g. Conflict of interest with existing client or outside current jurisdictional focus..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                ></textarea>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setReviewAppModal(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(reviewAppModal)}
                    className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg"
                  >
                    Confirm Declination
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Assign Lead Counsel
                  </label>
                  <select
                    value={selectedLawyerId}
                    onChange={(e) => setSelectedLawyerId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {lawyers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setReviewAppModal(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApprove(reviewAppModal)}
                    className="px-4 py-2 bg-slate-900 text-amber-400 text-xs font-bold rounded-lg"
                  >
                    Approve &amp; Activate Docket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Lawyer Modal */}
      {assignLawyerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">Reassign Lead Counsel</h3>
            <p className="text-xs text-slate-500 mb-4">Transfer lead representation on this active docket.</p>

            <div className="space-y-4">
              <select
                value={selectedLawyerId}
                onChange={(e) => setSelectedLawyerId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              >
                {lawyers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.specialization})
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setAssignLawyerModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    assignLawyerToCase(assignLawyerModal, selectedLawyerId);
                    setAssignLawyerModal(null);
                  }}
                  className="px-4 py-2 bg-slate-900 text-amber-400 text-xs font-bold rounded-lg"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">Create New Legal Matter</h3>

            <form onSubmit={handleCreateNewCase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Case Caption / Title
                </label>
                <input
                  type="text"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. Sterling Holdings v. Meridian Capital"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Practice Area
                  </label>
                  <select
                    value={newCaseType}
                    onChange={(e) => setNewCaseType(e.target.value as CaseType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Criminal Defense">Criminal Defense</option>
                    <option value="Intellectual Property">Intellectual Property</option>
                    <option value="Civil Litigation">Civil Litigation</option>
                    <option value="Real Estate & Property">Real Estate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={newCasePriority}
                    onChange={(e) => setNewCasePriority(e.target.value as CasePriority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Client
                  </label>
                  <select
                    value={newCaseClientId}
                    onChange={(e) => setNewCaseClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Lead Attorney
                  </label>
                  <select
                    value={newCaseLawyerId}
                    onChange={(e) => setNewCaseLawyerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {lawyers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description of Claims
                </label>
                <textarea
                  rows={3}
                  value={newCaseDescription}
                  onChange={(e) => setNewCaseDescription(e.target.value)}
                  placeholder="Summary of claims and procedural posture..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-amber-400 text-xs font-bold rounded-lg"
                >
                  Create Case Docket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Lawyer Modal */}
      {showNewLawyerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="font-serif font-bold text-xl text-slate-900 mb-2">Add New Attorney to Practice</h3>

            <form onSubmit={handleCreateNewLawyer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newLawyerName}
                  onChange={(e) => setNewLawyerName(e.target.value)}
                  placeholder="e.g. Julian Montgomery, Esq."
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newLawyerEmail}
                    onChange={(e) => setNewLawyerEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newLawyerPhone}
                    onChange={(e) => setNewLawyerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Bar Number
                  </label>
                  <input
                    type="text"
                    value={newLawyerBar}
                    onChange={(e) => setNewLawyerBar(e.target.value)}
                    placeholder="e.g. NY-881920"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={newLawyerSpec}
                    onChange={(e) => setNewLawyerSpec(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Bio / Credentials
                </label>
                <textarea
                  rows={2}
                  value={newLawyerBio}
                  onChange={(e) => setNewLawyerBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLawyerModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-amber-400 text-xs font-bold rounded-lg"
                >
                  Save Attorney
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
