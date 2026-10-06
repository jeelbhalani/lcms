export type UserRole = 'admin' | 'lawyer' | 'client';

export type UserStatus = 'active' | 'inactive' | 'on_leave';

export type LawyerVerificationStatus = 'verified' | 'pending' | 'rejected';

export interface LicenseDocument {
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  url?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address?: string;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
  // Lawyer specific fields
  barNumber?: string;
  jurisdiction?: string;
  firmAffiliation?: string;
  specialization?: string;
  experienceYears?: number;
  bio?: string;
  licenseDocument?: LicenseDocument;
  verificationStatus?: LawyerVerificationStatus;
}

export type CaseType =
  | 'Corporate Law'
  | 'Criminal Defense'
  | 'Civil Litigation'
  | 'Family & Matrimonial'
  | 'Intellectual Property'
  | 'Constitutional Law'
  | 'Real Estate & Property'
  | 'Labor & Employment'
  | 'Banking & Finance';

export type CasePriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type CaseStatus =
  | 'Application'
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Active'
  | 'Hearing Scheduled'
  | 'On Hold'
  | 'Won'
  | 'Lost'
  | 'Closed'
  | 'Rejected';

export interface CourtInfo {
  courtName: string;
  courtLocation: string;
  courtDocketNumber?: string;
  judgeName?: string;
  benchRoom?: string;
}

export interface Case {
  id: string;
  caseNumber: string; // e.g., LCMS-2026-0419
  title: string;
  caseType: CaseType;
  priority: CasePriority;
  status: CaseStatus;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  lawyerId?: string;
  lawyerName?: string;
  lawyerSpecialization?: string;
  courtInfo: CourtInfo;
  opposingParty: string;
  filingDate: string;
  incidentDate?: string;
  nextHearingDate?: string;
  description: string;
  notesVisibleToClient: string[];
  confidentialLawyerNotes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseApplication {
  id: string;
  applicationNumber: string; // e.g. APP-2026-8821
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  caseTitle: string;
  caseType: CaseType;
  priority: CasePriority;
  incidentDate: string;
  location: string;
  description: string;
  additionalInfo?: string;
  supportingDocuments?: Array<{ name: string; size: string; type: string }>;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  submittedDate: string;
  reviewedBy?: string;
  rejectionReason?: string;
  assignedLawyerId?: string;
}

export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  title: string;
  description: string;
  timestamp: string;
  createdBy: string;
  creatorRole: UserRole;
  eventType: 'milestone' | 'filing' | 'hearing' | 'order' | 'update' | 'note';
  documentName?: string;
}

export type DocumentCategory =
  | 'Pleading'
  | 'Evidence'
  | 'Court Order'
  | 'Contract'
  | 'Retainer'
  | 'Identity'
  | 'Affidavit'
  | 'Other';

export interface CaseDocument {
  id: string;
  caseId: string;
  name: string;
  category: DocumentCategory;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploaderRole: UserRole;
  uploadDate: string;
  description?: string;
  isConfidential: boolean; // if true, only admin & lawyer can view
  url?: string;
}

export interface Hearing {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  courtName: string;
  courtLocation: string;
  roomOrBench: string;
  judgeName: string;
  hearingDate: string;
  hearingTime: string;
  status: 'Scheduled' | 'Completed' | 'Adjourned' | 'Cancelled';
  agendaNotes: string;
  outcomeSummary?: string;
  lawyerId: string;
  lawyerName: string;
  clientId: string;
  clientName: string;
}

export interface CaseTask {
  id: string;
  caseId: string;
  caseNumber: string;
  title: string;
  deadlineDate: string;
  priority: CasePriority;
  assignedLawyerId: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string; // user ID or 'all_admins'
  recipientRole: UserRole | 'all';
  title: string;
  message: string;
  type: 'application' | 'assignment' | 'status' | 'hearing' | 'document' | 'general';
  caseId?: string;
  createdAt: string;
  read: boolean;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  description: string;
  relatedObject?: string;
  ipAddress: string;
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'New' | 'Read' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  active: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

export interface WebsiteSettings {
  firmName: string;
  tagline: string;
  heroHeading: string;
  heroSubheading: string;
  heroImage: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  aboutTitle: string;
  aboutDescription: string;
  mission: string;
  vision: string;
  values: string[];
  officeAddress: string;
  phoneNumber: string;
  emailAddress: string;
  workingHours: string;
  mapsEmbedQuery: string;
  services: ServiceItem[];
  faqs: FAQItem[];
  announcements: AnnouncementItem[];
}
