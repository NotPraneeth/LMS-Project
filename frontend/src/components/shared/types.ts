export type BrandId = 'all' | 'teluguai' | 'genai99';

export interface Brand {
  id: 'teluguai' | 'genai99';
  name: string;
  domain: string;
  logoText: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  status: 'active' | 'maintenance';
  adminCount: number;
  studentCount: number;
  courseCount: number;
  revenue: string;
  createdAt: string;
}

export type UserRole = 'super_admin' | 'admin' | 'counselor' | 'trainer' | 'student';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  brandId: 'teluguai' | 'genai99' | 'both';
  department?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
  avatarBg: string;
}

export interface PermissionItem {
  id: string;
  module: string;
  action: string;
  description: string;
  superAdmin: boolean;
  admin: boolean;
  counselor: boolean;
  trainer: boolean;
  student: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  language: string;
  previewText: string;
  brand: 'teluguai' | 'genai99' | 'both';
  lastSent: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  brand: 'TeluguAI' | 'GenAI99' | 'Platform';
  action: string;
  entity: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details?: string;
}
