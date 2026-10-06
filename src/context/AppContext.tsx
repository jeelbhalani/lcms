import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Case,
  CaseApplication,
  CaseTimelineEvent,
  CaseDocument,
  Hearing,
  CaseTask,
  NotificationItem,
  AuditLogItem,
  ContactMessage,
  WebsiteSettings,
  CaseStatus,
  CasePriority,
  LicenseDocument,
  LawyerVerificationStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CASES,
  INITIAL_APPLICATIONS,
  INITIAL_TIMELINE,
  INITIAL_DOCUMENTS,
  INITIAL_HEARINGS,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_WEBSITE_SETTINGS,
} from '../data/mockData';

interface AppContextType {
  // Auth state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchRole: (role: UserRole, specificUserId?: string) => void;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    password?: string;
    role?: UserRole;
    barNumber?: string;
    jurisdiction?: string;
    firmAffiliation?: string;
    specialization?: string;
    experienceYears?: number;
    bio?: string;
    licenseDocument?: LicenseDocument;
  }) => {
    success: boolean;
    error?: string;
  };
  verifyLawyer: (userId: string, status: LawyerVerificationStatus) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (oldPw: string, newPw: string) => { success: boolean; message: string };

  // Data collections
  users: User[];
  cases: Case[];
  applications: CaseApplication[];
  timelineEvents: CaseTimelineEvent[];
  documents: CaseDocument[];
  hearings: Hearing[];
  tasks: CaseTask[];
  notifications: NotificationItem[];
  auditLogs: AuditLogItem[];
  contactMessages: ContactMessage[];
  websiteSettings: WebsiteSettings;

  // Actions
  applyForCase: (data: Omit<CaseApplication, 'id' | 'applicationNumber' | 'status' | 'submittedDate'>) => CaseApplication;
  approveApplication: (
    appId: string,
    assignedLawyerId: string,
    courtDetails?: { courtName: string; courtLocation: string; judgeName?: string }
  ) => Case | null;
  rejectApplication: (appId: string, reason: string) => boolean;
  createCase: (caseData: Partial<Case>) => Case;
  updateCaseStatus: (caseId: string, newStatus: CaseStatus, note?: string) => boolean;
  assignLawyerToCase: (caseId: string, lawyerId: string) => boolean;
  addCaseNote: (caseId: string, note: string, isConfidential?: boolean) => boolean;
  addCaseTimelineEvent: (eventData: Omit<CaseTimelineEvent, 'id' | 'timestamp'>) => CaseTimelineEvent;
  addCaseDocument: (docData: Omit<CaseDocument, 'id' | 'uploadDate'>) => CaseDocument;
  deleteCaseDocument: (docId: string) => boolean;
  scheduleHearing: (hearingData: Omit<Hearing, 'id'>) => Hearing;
  updateHearing: (hearingId: string, updates: Partial<Hearing>) => boolean;
  addTask: (taskData: Omit<CaseTask, 'id' | 'isCompleted'>) => CaseTask;
  toggleTask: (taskId: string) => boolean;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => ContactMessage;
  updateContactStatus: (id: string, status: ContactMessage['status']) => void;
  updateWebsiteSettings: (newSettings: Partial<WebsiteSettings>) => void;
  toggleUserStatus: (userId: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  resetToDefaults: () => void;

  // RBAC permissions
  canAccessCase: (caseItem: Case) => boolean;
  canEditCase: (caseItem: Case) => boolean;
  canManageUsers: () => boolean;
  canManageWebsite: () => boolean;
  getUnreadNotificationsCount: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`lcms_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error loading localStorage key lcms_${key}:`, err);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(`lcms_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving localStorage key lcms_${key}:`, err);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = loadStorage<User | null>('currentUser', INITIAL_USERS[0]); // default to admin for rich immediate testing
    return saved || INITIAL_USERS[0];
  });

  const [cases, setCases] = useState<Case[]>(() => loadStorage('cases', INITIAL_CASES));
  const [applications, setApplications] = useState<CaseApplication[]>(() =>
    loadStorage('applications', INITIAL_APPLICATIONS)
  );
  const [timelineEvents, setTimelineEvents] = useState<CaseTimelineEvent[]>(() =>
    loadStorage('timeline', INITIAL_TIMELINE)
  );
  const [documents, setDocuments] = useState<CaseDocument[]>(() => loadStorage('documents', INITIAL_DOCUMENTS));
  const [hearings, setHearings] = useState<Hearing[]>(() => loadStorage('hearings', INITIAL_HEARINGS));
  const [tasks, setTasks] = useState<CaseTask[]>(() => loadStorage('tasks', INITIAL_TASKS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => loadStorage('auditLogs', INITIAL_AUDIT_LOGS));
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() =>
    loadStorage('contactMessages', INITIAL_CONTACT_MESSAGES)
  );
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() =>
    loadStorage('websiteSettings', INITIAL_WEBSITE_SETTINGS)
  );

  // Sync with localStorage
  useEffect(() => saveStorage('users', users), [users]);
  useEffect(() => saveStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => saveStorage('cases', cases), [cases]);
  useEffect(() => saveStorage('applications', applications), [applications]);
  useEffect(() => saveStorage('timeline', timelineEvents), [timelineEvents]);
  useEffect(() => saveStorage('documents', documents), [documents]);
  useEffect(() => saveStorage('hearings', hearings), [hearings]);
  useEffect(() => saveStorage('tasks', tasks), [tasks]);
  useEffect(() => saveStorage('notifications', notifications), [notifications]);
  useEffect(() => saveStorage('auditLogs', auditLogs), [auditLogs]);
  useEffect(() => saveStorage('contactMessages', contactMessages), [contactMessages]);
  useEffect(() => saveStorage('websiteSettings', websiteSettings), [websiteSettings]);

  // Helper to log audit events
  const recordAudit = (action: string, description: string, relatedObject?: string) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'Anonymous User',
      userRole: currentUser?.role || 'client',
      action,
      description,
      relatedObject,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper to push notification
  const pushNotification = (
    recipientId: string,
    recipientRole: UserRole | 'all',
    title: string,
    message: string,
    type: NotificationItem['type'],
    caseId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientId,
      recipientRole,
      title,
      message,
      type,
      caseId,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Auth Operations
  const switchRole = (role: UserRole, specificUserId?: string) => {
    if (specificUserId) {
      const targetUser = users.find((u) => u.id === specificUserId);
      if (targetUser) {
        setCurrentUser(targetUser);
        recordAudit('Role Switched', `Switched active session to ${targetUser.name} (${targetUser.role})`);
        return;
      }
    }
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      recordAudit('Role Switched', `Switched active session to ${targetUser.name} (${targetUser.role})`);
    }
  };

  const login = (email: string, _password?: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, error: 'No account registered with this email address.' };
    }
    if (found.status === 'inactive') {
      return { success: false, error: 'This user account is currently deactivated. Please contact the administrator.' };
    }
    setCurrentUser(found);
    recordAudit('User Login', `User ${found.name} signed into the LCMS platform.`);
    return { success: true };
  };

  const register = (data: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    password?: string;
    role?: UserRole;
    barNumber?: string;
    jurisdiction?: string;
    firmAffiliation?: string;
    specialization?: string;
    experienceYears?: number;
    bio?: string;
    licenseDocument?: LicenseDocument;
  }) => {
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const assignedRole: UserRole = data.role === 'lawyer' ? 'lawyer' : 'client';
    const isLawyer = assignedRole === 'lawyer';

    const newUser: User = {
      id: isLawyer ? `u-lawyer-${Date.now()}` : `u-client-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || 'Address on file',
      role: assignedRole,
      status: 'active',
      createdAt: new Date().toISOString(),
      avatar: isLawyer
        ? 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=300'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      ...(isLawyer
        ? {
            barNumber: data.barNumber,
            jurisdiction: data.jurisdiction || 'State Bar Jurisdiction',
            firmAffiliation: data.firmAffiliation || 'Independent Practice',
            specialization: data.specialization || 'Corporate Law',
            experienceYears: data.experienceYears ?? 5,
            bio:
              data.bio ||
              `Licensed attorney practicing in ${data.jurisdiction || 'state jurisdiction'} specializing in ${
                data.specialization || 'general law'
              }.`,
            licenseDocument: data.licenseDocument,
            verificationStatus: 'pending' as LawyerVerificationStatus,
          }
        : {
            verificationStatus: 'verified' as LawyerVerificationStatus,
          }),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);

    if (isLawyer) {
      recordAudit(
        'Lawyer Registration Submitted',
        `Attorney ${newUser.name} registered with Bar License #${data.barNumber || 'N/A'} in ${data.jurisdiction || 'State'} with uploaded license document (${data.licenseDocument?.name || 'Attached'}). Account marked pending lawyer verification.`,
        `Attorney: ${newUser.id}`
      );
      pushNotification(
        'all_admins',
        'admin',
        'New Attorney Registration Pending Verification',
        `Attorney ${newUser.name} (${newUser.email}) registered with Bar License #${data.barNumber || 'Pending'}. License document: ${data.licenseDocument?.name || 'Attached'}. Verification status is pending.`,
        'general'
      );
    } else {
      recordAudit('Client Registration', `New client ${newUser.name} created an account.`, `Client: ${newUser.id}`);
      pushNotification(
        'all_admins',
        'admin',
        'New Client Registered',
        `${newUser.name} (${newUser.email}) just created a client account.`,
        'general'
      );
    }

    return { success: true };
  };

  const verifyLawyer = (userId: string, status: LawyerVerificationStatus) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, verificationStatus: status };
        }
        return u;
      })
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, verificationStatus: status } : null));
    }
    const targetUser = users.find((u) => u.id === userId);
    recordAudit(
      'Attorney Verification Updated',
      `Administrator updated verification status for ${targetUser?.name || userId} to ${status.toUpperCase()}.`,
      `User: ${userId}`
    );
    pushNotification(
      userId,
      'lawyer',
      status === 'verified' ? 'Bar Licensure Verified' : 'Licensure Verification Update',
      status === 'verified'
        ? 'Your Bar License and credentials have been verified by the managing partners. Your counsel privileges are fully active.'
        : 'Your licensure verification status has been updated. Please contact administration for details.',
      'general'
    );
  };

  const logout = () => {
    if (currentUser) {
      recordAudit('User Logout', `User ${currentUser.name} logged out.`);
    }
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    recordAudit('Profile Updated', `User ${updated.name} updated profile details.`);
  };

  const changePassword = (_oldPw: string, newPw: string) => {
    if (newPw.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }
    recordAudit('Password Changed', `User ${currentUser?.name} changed their password.`);
    return { success: true, message: 'Password has been securely updated.' };
  };

  // Case Application Flow
  const applyForCase = (data: Omit<CaseApplication, 'id' | 'applicationNumber' | 'status' | 'submittedDate'>) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newApp: CaseApplication = {
      ...data,
      id: `app-${Date.now()}`,
      applicationNumber: `APP-2026-${randomNum}`,
      status: 'Pending',
      submittedDate: new Date().toISOString(),
    };

    setApplications((prev) => [newApp, ...prev]);

    recordAudit('Case Application Submitted', `Submitted case application ${newApp.applicationNumber}: "${newApp.caseTitle}"`, newApp.id);

    // Notify Admins
    pushNotification(
      'all_admins',
      'admin',
      'New Case Application Submitted',
      `${newApp.clientName} submitted application ${newApp.applicationNumber} for "${newApp.caseTitle}".`,
      'application'
    );

    // Notify Client
    pushNotification(
      newApp.clientId,
      'client',
      'Case Application Received',
      `Your application ${newApp.applicationNumber} for "${newApp.caseTitle}" has been received and is pending partner review.`,
      'application'
    );

    return newApp;
  };

  const approveApplication = (
    appId: string,
    assignedLawyerId: string,
    courtDetails?: { courtName: string; courtLocation: string; judgeName?: string }
  ) => {
    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return null;

    const assignedLawyer = users.find((u) => u.id === assignedLawyerId);
    const caseRandomNum = Math.floor(100 + Math.random() * 900);
    const newCaseNumber = `LCMS-2026-0${caseRandomNum}`;

    const newCase: Case = {
      id: `case-${Date.now()}`,
      caseNumber: newCaseNumber,
      title: targetApp.caseTitle,
      caseType: targetApp.caseType,
      priority: targetApp.priority,
      status: 'Active',
      clientId: targetApp.clientId,
      clientName: targetApp.clientName,
      clientEmail: targetApp.clientEmail,
      clientPhone: targetApp.clientPhone,
      lawyerId: assignedLawyer?.id,
      lawyerName: assignedLawyer?.name,
      lawyerSpecialization: assignedLawyer?.specialization,
      courtInfo: {
        courtName: courtDetails?.courtName || 'District Court of General Jurisdiction',
        courtLocation: courtDetails?.courtLocation || 'County Justice Complex',
        courtDocketNumber: `Index ${Math.floor(100000 + Math.random() * 900000)}/2026`,
        judgeName: courtDetails?.judgeName || 'Hon. Presiding Magistrate',
        benchRoom: 'Courtroom 4A',
      },
      opposingParty: 'To be determined / Notice of Appearance pending',
      filingDate: new Date().toISOString().split('T')[0],
      incidentDate: targetApp.incidentDate,
      description: targetApp.description,
      notesVisibleToClient: [
        `Case application formally approved on ${new Date().toLocaleDateString()}. Lead counsel ${assignedLawyer?.name || 'assigned'} will coordinate intake.`,
      ],
      confidentialLawyerNotes: [
        'Initial partner review completed. Retainer confirmed and verified under conflict check.',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update Application
    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'Approved',
              reviewedBy: currentUser?.name || 'Managing Partner',
              assignedLawyerId: assignedLawyer?.id,
            }
          : a
      )
    );

    // Add Case
    setCases((prev) => [newCase, ...prev]);

    // Add Timeline Event
    const initialTimeline: CaseTimelineEvent = {
      id: `tl-${Date.now()}`,
      caseId: newCase.id,
      title: 'Application Approved & Case Created',
      description: `Case ${newCase.caseNumber} formally activated. Assigned lead counsel: ${assignedLawyer?.name || 'Firm Counsel'}.`,
      timestamp: new Date().toISOString(),
      createdBy: currentUser?.name || 'Administrator',
      creatorRole: currentUser?.role || 'admin',
      eventType: 'milestone',
    };
    setTimelineEvents((prev) => [initialTimeline, ...prev]);

    // Record Audit
    recordAudit(
      'Application Approved',
      `Approved application ${targetApp.applicationNumber} and created Case ${newCase.caseNumber} with counsel ${assignedLawyer?.name}.`,
      newCase.id
    );

    // Notifications
    pushNotification(
      targetApp.clientId,
      'client',
      'Application Approved!',
      `Great news! Your case application ${targetApp.applicationNumber} has been approved. Lead counsel: ${assignedLawyer?.name}. Case ID: ${newCase.caseNumber}.`,
      'application',
      newCase.id
    );

    if (assignedLawyer) {
      pushNotification(
        assignedLawyer.id,
        'lawyer',
        'New Case Assigned to You',
        `You have been assigned as lead counsel for new case: "${newCase.title}" (${newCase.caseNumber}).`,
        'assignment',
        newCase.id
      );
    }

    return newCase;
  };

  const rejectApplication = (appId: string, reason: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return false;

    setApplications((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              status: 'Rejected',
              rejectionReason: reason,
              reviewedBy: currentUser?.name || 'Managing Partner',
            }
          : a
      )
    );

    recordAudit('Application Rejected', `Rejected application ${targetApp.applicationNumber}. Reason: ${reason}`, targetApp.id);

    pushNotification(
      targetApp.clientId,
      'client',
      'Case Application Status Update',
      `Your application ${targetApp.applicationNumber} could not be accepted at this time. Reason: ${reason}`,
      'application'
    );

    return true;
  };

  const createCase = (caseData: Partial<Case>) => {
    const caseRandomNum = Math.floor(100 + Math.random() * 900);
    const newCase: Case = {
      id: `case-${Date.now()}`,
      caseNumber: `LCMS-2026-0${caseRandomNum}`,
      title: caseData.title || 'Untitled Matter',
      caseType: caseData.caseType || 'Civil Litigation',
      priority: caseData.priority || 'Medium',
      status: caseData.status || 'Active',
      clientId: caseData.clientId || 'u-client-1',
      clientName: caseData.clientName || 'Valued Client',
      clientEmail: caseData.clientEmail || 'client@example.com',
      clientPhone: caseData.clientPhone || '+1 (555) 000-0000',
      lawyerId: caseData.lawyerId,
      lawyerName: caseData.lawyerName,
      lawyerSpecialization: caseData.lawyerSpecialization,
      courtInfo: caseData.courtInfo || {
        courtName: 'Superior Court of Law',
        courtLocation: 'Central Courthouse',
      },
      opposingParty: caseData.opposingParty || 'Opposing Party',
      filingDate: caseData.filingDate || new Date().toISOString().split('T')[0],
      description: caseData.description || 'Description of legal controversy.',
      notesVisibleToClient: ['Case dossier initialized in LCMS.'],
      confidentialLawyerNotes: ['Internal case file created.'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCases((prev) => [newCase, ...prev]);
    recordAudit('Case Created', `Created new case ${newCase.caseNumber}: "${newCase.title}"`, newCase.id);
    return newCase;
  };

  const updateCaseStatus = (caseId: string, newStatus: CaseStatus, note?: string) => {
    const target = cases.find((c) => c.id === caseId);
    if (!target) return false;

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              notesVisibleToClient: note ? [note, ...c.notesVisibleToClient] : c.notesVisibleToClient,
            }
          : c
      )
    );

    // Add Timeline Event
    addCaseTimelineEvent({
      caseId,
      title: `Status Changed to ${newStatus}`,
      description: note || `Case status officially transitioned from ${target.status} to ${newStatus}.`,
      createdBy: currentUser?.name || 'Legal Team',
      creatorRole: currentUser?.role || 'lawyer',
      eventType: 'update',
    });

    recordAudit('Case Status Updated', `Case ${target.caseNumber} status updated to ${newStatus}`, caseId);

    // Notify Client
    pushNotification(
      target.clientId,
      'client',
      'Case Status Updated',
      `Your case "${target.title}" is now marked as "${newStatus}".`,
      'status',
      caseId
    );

    return true;
  };

  const assignLawyerToCase = (caseId: string, lawyerId: string) => {
    const target = cases.find((c) => c.id === caseId);
    const lawyer = users.find((u) => u.id === lawyerId);
    if (!target || !lawyer) return false;

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              lawyerId: lawyer.id,
              lawyerName: lawyer.name,
              lawyerSpecialization: lawyer.specialization,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    addCaseTimelineEvent({
      caseId,
      title: `Lead Counsel Assigned: ${lawyer.name}`,
      description: `${lawyer.name} (${lawyer.specialization || 'Counsel'}) took over lead representation.`,
      createdBy: currentUser?.name || 'Administrator',
      creatorRole: currentUser?.role || 'admin',
      eventType: 'milestone',
    });

    recordAudit('Lawyer Assigned', `Assigned ${lawyer.name} to Case ${target.caseNumber}`, caseId);

    pushNotification(
      target.clientId,
      'client',
      'Counsel Assigned',
      `${lawyer.name} has been assigned as your lead attorney for "${target.title}".`,
      'assignment',
      caseId
    );

    pushNotification(
      lawyer.id,
      'lawyer',
      'Case Assignment',
      `You have been assigned to Case ${target.caseNumber}: "${target.title}".`,
      'assignment',
      caseId
    );

    return true;
  };

  const addCaseNote = (caseId: string, note: string, isConfidential = false) => {
    const target = cases.find((c) => c.id === caseId);
    if (!target) return false;

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        if (isConfidential) {
          return { ...c, confidentialLawyerNotes: [note, ...c.confidentialLawyerNotes], updatedAt: new Date().toISOString() };
        } else {
          return { ...c, notesVisibleToClient: [note, ...c.notesVisibleToClient], updatedAt: new Date().toISOString() };
        }
      })
    );

    addCaseTimelineEvent({
      caseId,
      title: isConfidential ? 'Confidential Counsel Note' : 'Case Progress Update',
      description: note,
      createdBy: currentUser?.name || 'Legal Team',
      creatorRole: currentUser?.role || 'lawyer',
      eventType: 'note',
    });

    if (!isConfidential) {
      pushNotification(
        target.clientId,
        'client',
        'New Case Update Added',
        `Your legal counsel added a progress update to case "${target.title}".`,
        'status',
        caseId
      );
    }

    return true;
  };

  const addCaseTimelineEvent = (eventData: Omit<CaseTimelineEvent, 'id' | 'timestamp'>) => {
    const newEvent: CaseTimelineEvent = {
      ...eventData,
      id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setTimelineEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const addCaseDocument = (docData: Omit<CaseDocument, 'id' | 'uploadDate'>) => {
    const newDoc: CaseDocument = {
      ...docData,
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setDocuments((prev) => [newDoc, ...prev]);

    const targetCase = cases.find((c) => c.id === docData.caseId);

    addCaseTimelineEvent({
      caseId: docData.caseId,
      title: `Document Uploaded: ${newDoc.name}`,
      description: `${newDoc.category} uploaded by ${newDoc.uploadedBy} (${newDoc.fileSize}).`,
      createdBy: newDoc.uploadedBy,
      creatorRole: newDoc.uploaderRole,
      eventType: 'filing',
      documentName: newDoc.name,
    });

    recordAudit('Document Uploaded', `Uploaded document "${newDoc.name}" to Case ${targetCase?.caseNumber}`, newDoc.id);

    // Notify parties
    if (targetCase) {
      if (currentUser?.role === 'client' && targetCase.lawyerId) {
        pushNotification(
          targetCase.lawyerId,
          'lawyer',
          'Client Uploaded Document',
          `${targetCase.clientName} uploaded "${newDoc.name}" to ${targetCase.caseNumber}.`,
          'document',
          targetCase.id
        );
      } else if (currentUser?.role === 'lawyer' && !newDoc.isConfidential) {
        pushNotification(
          targetCase.clientId,
          'client',
          'New Case Document Available',
          `Your counsel uploaded "${newDoc.name}" to your case folder.`,
          'document',
          targetCase.id
        );
      }
    }

    return newDoc;
  };

  const deleteCaseDocument = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return false;
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    recordAudit('Document Deleted', `Deleted document "${doc.name}"`, docId);
    return true;
  };

  const scheduleHearing = (hearingData: Omit<Hearing, 'id'>) => {
    const newHearing: Hearing = {
      ...hearingData,
      id: `hr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setHearings((prev) => [newHearing, ...prev]);

    // Update case nextHearingDate
    setCases((prev) =>
      prev.map((c) =>
        c.id === hearingData.caseId
          ? { ...c, nextHearingDate: hearingData.hearingDate, status: 'Hearing Scheduled', updatedAt: new Date().toISOString() }
          : c
      )
    );

    addCaseTimelineEvent({
      caseId: hearingData.caseId,
      title: `Hearing Scheduled: ${newHearing.courtName}`,
      description: `Hearing set for ${newHearing.hearingDate} at ${newHearing.hearingTime} before ${newHearing.judgeName} (${newHearing.roomOrBench}). Agenda: ${newHearing.agendaNotes}`,
      createdBy: currentUser?.name || 'Legal Team',
      creatorRole: currentUser?.role || 'lawyer',
      eventType: 'hearing',
    });

    recordAudit(
      'Hearing Scheduled',
      `Scheduled hearing for Case ${newHearing.caseNumber} on ${newHearing.hearingDate}`,
      newHearing.id
    );

    // Notify Client
    pushNotification(
      newHearing.clientId,
      'client',
      'Court Hearing Scheduled',
      `A hearing for "${newHearing.caseTitle}" is calendared for ${newHearing.hearingDate} at ${newHearing.hearingTime} in ${newHearing.courtName}.`,
      'hearing',
      newHearing.caseId
    );

    return newHearing;
  };

  const updateHearing = (hearingId: string, updates: Partial<Hearing>) => {
    setHearings((prev) => prev.map((h) => (h.id === hearingId ? { ...h, ...updates } : h)));
    recordAudit('Hearing Updated', `Updated hearing details for ${hearingId}`);
    return true;
  };

  const addTask = (taskData: Omit<CaseTask, 'id' | 'isCompleted'>) => {
    const newTask: CaseTask = {
      ...taskData,
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isCompleted: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    recordAudit('Case Task Created', `Created task "${newTask.title}" for Case ${newTask.caseNumber}`, newTask.id);
    return newTask;
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextCompleted = !t.isCompleted;
        return {
          ...t,
          isCompleted: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      })
    );
    return true;
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (!currentUser) return n;
        if (n.recipientId === currentUser.id || (n.recipientRole === currentUser.role && n.recipientId === 'all_admins')) {
          return { ...n, read: true };
        }
        return n;
      })
    );
  };

  const submitContactMessage = (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: `cnt-${Date.now()}`,
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    setContactMessages((prev) => [newMsg, ...prev]);
    recordAudit('Contact Form Submitted', `Inquiry received from ${newMsg.name} (${newMsg.email})`);
    pushNotification(
      'all_admins',
      'admin',
      'New Website Inquiry',
      `Subject: "${newMsg.subject}" from ${newMsg.name}.`,
      'general'
    );
    return newMsg;
  };

  const updateContactStatus = (id: string, status: ContactMessage['status']) => {
    setContactMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    recordAudit('Contact Inquiry Updated', `Inquiry ${id} status set to ${status}`);
  };

  const updateWebsiteSettings = (newSettings: Partial<WebsiteSettings>) => {
    setWebsiteSettings((prev) => ({ ...prev, ...newSettings }));
    recordAudit('Website CMS Updated', 'Firm website CMS content updated by administrator.');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const nextStatus = u.status === 'active' ? 'inactive' : 'active';
        recordAudit('User Status Toggled', `User ${u.name} status changed to ${nextStatus}`, userId);
        return { ...u, status: nextStatus };
      })
    );
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${userData.role}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    recordAudit('User Created', `Created ${userData.role} user: ${newUser.name}`);
    return newUser;
  };

  const resetToDefaults = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCases(INITIAL_CASES);
    setApplications(INITIAL_APPLICATIONS);
    setTimelineEvents(INITIAL_TIMELINE);
    setDocuments(INITIAL_DOCUMENTS);
    setHearings(INITIAL_HEARINGS);
    setTasks(INITIAL_TASKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setContactMessages(INITIAL_CONTACT_MESSAGES);
    setWebsiteSettings(INITIAL_WEBSITE_SETTINGS);
    localStorage.clear();
  };

  // RBAC Permission Checkers
  const canAccessCase = (caseItem: Case) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'lawyer') return caseItem.lawyerId === currentUser.id;
    if (currentUser.role === 'client') return caseItem.clientId === currentUser.id;
    return false;
  };

  const canEditCase = (caseItem: Case) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'lawyer') return caseItem.lawyerId === currentUser.id;
    return false;
  };

  const canManageUsers = () => {
    return currentUser?.role === 'admin';
  };

  const canManageWebsite = () => {
    return currentUser?.role === 'admin';
  };

  const getUnreadNotificationsCount = () => {
    if (!currentUser) return 0;
    return notifications.filter((n) => {
      const isForMe =
        n.recipientId === currentUser.id ||
        (currentUser.role === 'admin' && n.recipientRole === 'admin') ||
        n.recipientRole === 'all';
      return isForMe && !n.read;
    }).length;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        users,
        cases,
        applications,
        timelineEvents,
        documents,
        hearings,
        tasks,
        notifications,
        auditLogs,
        contactMessages,
        websiteSettings,
        applyForCase,
        approveApplication,
        rejectApplication,
        createCase,
        updateCaseStatus,
        assignLawyerToCase,
        addCaseNote,
        addCaseTimelineEvent,
        addCaseDocument,
        deleteCaseDocument,
        scheduleHearing,
        updateHearing,
        addTask,
        toggleTask,
        markNotificationRead,
        markAllNotificationsRead,
        submitContactMessage,
        updateContactStatus,
        updateWebsiteSettings,
        toggleUserStatus,
        addUser,
        verifyLawyer,
        resetToDefaults,
        canAccessCase,
        canEditCase,
        canManageUsers,
        canManageWebsite,
        getUnreadNotificationsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
