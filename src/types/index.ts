// ==============================================
// src/types/index.ts
// ==============================================
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
  milestones?: Milestone[];
  startedAt?: Date;
  completedAt?: Date;
  deployedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface RequestStats {
  total: number;
  byStatus: Record<RequestStatus, number>;
}

export interface WebsiteStats {
  total: number;
  byStatus: Record<WebsiteStatus, number>;
  byAdmin: Array<{ _id: string; count: number }>;
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