// types/index.ts
export enum RequestStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  CONTACTED = 'CONTACTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ProjectType {
  BUSINESS = 'BUSINESS',
  ECOMMERCE = 'ECOMMERCE',
  PORTFOLIO = 'PORTFOLIO',
  BLOG = 'BLOG',
  LANDING_PAGE = 'LANDING_PAGE',
  OTHER = 'OTHER',
}

export enum WebsiteStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  DEPLOYED = 'DEPLOYED',
  CANCELLED = 'CANCELLED',
}

export enum BillingStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  SUSPENDED = 'SUSPENDED',
}

export interface PaymentHistory {
  amount: number;
  date: string;
  method?: string;
  transactionId?: string;
}

export interface Billing {
  status: BillingStatus;
  plan?: string;
  price?: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  activatedAt?: string;
  dueAt?: string;
  lastPaymentAt?: string;
  graceEndsAt?: string;
  suspendedAt?: string;
  paymentHistory?: PaymentHistory[];
}

export interface WebsiteRequest {
  _id: string;
  userId: string;
  projectName: string;
  description: string;
  projectType: ProjectType;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  pagesRequired?: number;
  features: string[];
  referenceLinks: string[];
  recommendedTemplate?: string;
  selectedPlan?: string;
  status: RequestStatus;
  editableUntil: Date;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  isEditable?: boolean;
}

export interface Website {
  _id: string;
  userId: string;
  requestId: string;
  name: string;
  description?: string;
  projectType: string;
  status: WebsiteStatus;
  assignedAdmin?: string;
  domain?: string;
  deploymentUrl?: string;
  repositoryUrl?: string;
  pagesCompleted?: number;
  totalPages?: number;
  completionPercentage?: number;
  adminNotes?: string;
  clientNotes?: string;
  milestones?: Array<{
    title: string;
    completed: boolean;
    completedAt?: string;
  }>;
  billing: Billing;
  startedAt?: string;
  completedAt?: string;
  deployedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface RequestStats {
  total: number;
  byStatus: Record<RequestStatus, number>;
  byProjectType: Array<{
    _id: string;
    count: number;
  }>;
}

export interface WebsiteStats {
  total: number;
  byStatus: Record<WebsiteStatus, number>;
  byBillingStatus: Record<BillingStatus, number>;
  byAdmin: Array<{
    _id: string;
    count: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: T[];
}

// ==========================================
// USER TYPES
// ==========================================

export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  authProvider: 'clerk' | 'google' | 'email';
  clerkId?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithStats extends User {
  requestCount: number;
  websiteCount: number;
}

export interface UserDetailsResponse {
  user: UserWithStats;
  recentRequests: WebsiteRequest[];
  recentWebsites: Website[];
}

export interface UserStats {
  total: number;
  byAuthProvider: {
    clerk?: number;
    google?: number;
    email?: number;
  };
  recentUsers: User[];
}

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export interface UpdateRequestStatusDTO {
  status: RequestStatus;
  internalNotes?: string;
}

export interface ApproveRequestDTO {
  assignedAdmin?: string;
  initialNotes?: string;
}

export interface RejectRequestDTO {
  reason: string;
}

export interface UpdateWebsiteDTO {
  name?: string;
  description?: string;
  status?: WebsiteStatus;
  assignedAdmin?: string;
  domain?: string;
  deploymentUrl?: string;
  repositoryUrl?: string;
  pagesCompleted?: number;
  totalPages?: number;
  adminNotes?: string;
  clientNotes?: string;
  milestones?: Milestone[];
}

export interface UpdateWebsiteStatusDTO {
  status: WebsiteStatus;
  notes?: string;
}

export interface AddMilestoneDTO {
  title: string;
  completed?: boolean;
}

export interface UpdateMilestoneDTO {
  title?: string;
  completed?: boolean;
}

export interface AssignAdminDTO {
  assignedAdmin: string;
}


export enum SupportStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export enum SupportCategory {
  BUG = 'BUG',
  CHANGE_REQUEST = 'CHANGE_REQUEST',
  BILLING = 'BILLING',
  GENERAL = 'GENERAL',
}

export enum SupportPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface SupportResponse {
  message: string;
  isAdminResponse: boolean;
  respondedAt: string;
  respondedBy?: string;
}

export interface SupportRequest {
  _id: string;
  userId: string;
  websiteId: string;
  category: SupportCategory;
  subject: string;
  message: string;
  status: SupportStatus;
  priority?: SupportPriority;
  assignedAdmin?: string;
  responses?: SupportResponse[];
  internalNotes?: string;
  adminNotes?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated fields
  website?: {
    _id: string;
    name: string;
    status: WebsiteStatus;
    deploymentUrl?: string;
  };
  user?: {
    _id: string;
    email: string;
    name?: string;
  };
}

export interface SupportStatusBadgeProps {
  status: SupportStatus;
  className?: string;
}

export interface SupportCategoryBadgeProps {
  category: SupportCategory;
  className?: string;
}