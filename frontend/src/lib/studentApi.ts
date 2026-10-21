/**
 * Typed client for the LMS Student Portal REST API.
 *
 * The base URL is configurable via `NEXT_PUBLIC_API_BASE_URL` and defaults to
 * the local backend development server (`http://localhost:4000`).
 *
 * Identity travels in the HttpOnly `lms_session` cookie (set by
 * POST /api/auth/login). Every student request also carries an
 * `X-Brand-Id` header validated server-side against `user_brand_access`.
 */

// NOTE: requests are proxied same-origin through the Next.js dev server
// (rewrites in next.config.ts → FastAPI on 127.0.0.1:4000), which keeps the
// HttpOnly session cookie same-site and sidesteps Windows localhost→::1
// resolution quirks. Override with NEXT_PUBLIC_API_BASE_URL to call the
// backend directly instead.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export type BrandId = 'teluguai' | 'genai99';

export type UserRole = 'super_admin' | 'admin' | 'counselor' | 'trainer' | 'student';

/* ------------------------------------------------------------------ *
 * Types (mirror the backend contract)
 * ------------------------------------------------------------------ */

export interface StudentProfile {
  id: string;
  email: string;
  name: string;
  brandId: BrandId;
  phone: string;
  courseTitle: string;
  batchName: string;
  instructor: string;
}

export type LessonStatus = 'completed' | 'in_progress' | 'locked';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  status: LessonStatus;
  summary: string;
  videoUrl?: string;
  codeSnippet?: string;
  notesPdfUrl?: string;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  totalDuration: string;
  lessons: Lesson[];
}

export interface ClassSession {
  id: string;
  topic: string;
  instructor: string;
  date: string;
  timeSlot: string;
  roomUrl: string;
  isToday: boolean;
  status: 'upcoming' | 'completed';
  attendanceStatus?: 'present' | 'absent';
  recordingUrl?: string;
  notesUrl?: string;
}

export type MaterialType = 'slides' | 'notebook' | 'cheatsheet' | 'code';

export interface Material {
  id: string;
  title: string;
  module: string;
  type: MaterialType;
  size: string;
  updatedDate: string;
  url: string;
}

export type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'resubmit';

export interface Assignment {
  id: string;
  title: string;
  module: string;
  dueDate: string;
  maxScore: number;
  score: number | null;
  status: AssignmentStatus;
  instructions: string;
  starterRepoUrl?: string;
  submittedRepoUrl?: string;
  submissionNotes?: string;
  submittedAt?: string;
  instructorFeedback?: string;
}

export interface QuestionPublic {
  id: string;
  questionText: string;
  options: string[];
}

export interface QuizPublic {
  id: string;
  title: string;
  durationMinutes: number;
  passPercentage: number;
  questionCount: number;
  questions: QuestionPublic[];
  status: 'available' | 'completed';
  lastScore?: number;
  attemptsCount: number;
}

export interface QuizQuestionReview {
  questionId: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number | null;
  correctOptionIndex: number;
  isCorrect: boolean;
}

export interface QuizAttemptResult {
  quizId: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  passPercentage: number;
  submittedAt: string;
  review: QuizQuestionReview[];
}

export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface AttendanceRecord {
  id: string;
  date: string;
  topic: string;
  timeSlot: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceSummary {
  sessions: AttendanceRecord[];
  attendanceRate: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  totalSessions: number;
}

export interface FeeSummary {
  currency: 'INR' | 'USD';
  totalCourseFee: number;
  discountApplied: number;
  netPayable: number;
  amountPaid: number;
  balanceRemaining: number;
  status: 'PAID_IN_FULL' | 'PARTIAL_DUE' | 'OVERDUE';
  plan: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  mode: 'UPI' | 'Credit Card' | 'NetBanking';
  status: 'SUCCESS';
  transactionId: string;
  description: string;
}

export interface FeeAccount {
  summary: FeeSummary;
  receipts: PaymentReceipt[];
}

export interface Certificate {
  brandName: string;
  courseName: string;
  certId: string;
  issueDate: string;
  instructor: string;
  instructorTitle: string;
  status: 'Issued & Verified' | 'In Progress';
  skills: string[];
}

export interface Announcement {
  id: string;
  date: string;
  title: string;
  message: string;
}

export interface StudentDashboard {
  progress: number;
  completedSessions: number;
  totalSessions: number;
  attendanceRate: number;
  assignmentsDone: number;
  totalAssignments: number;
  quizAvg: number;
  feeStatus: string;
  studentId: string;
  studentName: string;
  brandId: BrandId;
  courseTitle: string;
  batchName: string;
  instructor: string;
  nextSession: ClassSession | null;
  announcements: Announcement[];
}

/* ------------------------------------------------------------------ *
 * Auth types (POST /api/auth/login · GET /api/auth/me responses)
 * ------------------------------------------------------------------ */

export interface BrandRef {
  id: BrandId;
  slug: BrandId;
  name: string;
}

export interface MeResponse {
  email: string;
  name: string;
  role: UserRole;
  brand: BrandRef;
  accessibleBrands: BrandRef[];
}

/* ------------------------------------------------------------------ *
 * Fetch plumbing
 * ------------------------------------------------------------------ */

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  brand?: BrandId,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  if (brand) headers['X-Brand-Id'] = brand;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers,
    });
  } catch {
    throw new ApiError(
      `Unable to reach the LMS API at ${API_BASE_URL}. Is the backend running?`,
      0,
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* response body was not JSON */
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

/* ------------------------------------------------------------------ *
 * API surface
 * ------------------------------------------------------------------ */

export const studentApi = {
  health: () => request<{ status: string }>('/api/health'),

  getProfile: (brand?: BrandId) =>
    request<StudentProfile>('/api/student/profile', undefined, brand),

  getDashboard: (brand?: BrandId) =>
    request<StudentDashboard>('/api/student/dashboard', undefined, brand),

  getCurriculum: async (brand?: BrandId) =>
    (await request<{ modules: Module[] }>('/api/student/curriculum', undefined, brand))
      .modules,

  completeLesson: async (lessonId: string, brand?: BrandId) =>
    (
      await request<{ modules: Module[] }>(
        `/api/student/curriculum/lessons/${encodeURIComponent(lessonId)}/complete`,
        { method: 'POST' },
        brand,
      )
    ).modules,

  getLiveClasses: async (brand?: BrandId) =>
    (await request<{ sessions: ClassSession[] }>('/api/student/live-classes', undefined, brand))
      .sessions,

  getMaterials: async (brand?: BrandId) =>
    (await request<{ materials: Material[] }>('/api/student/materials', undefined, brand))
      .materials,

  getAttendance: (brand?: BrandId) =>
    request<AttendanceSummary>('/api/student/attendance', undefined, brand),

  getAssignments: async (brand?: BrandId) =>
    (await request<{ assignments: Assignment[] }>('/api/student/assignments', undefined, brand))
      .assignments,

  submitAssignment: async (
    assignmentId: string,
    payload: { repoUrl: string; notes?: string },
    brand?: BrandId,
  ) =>
    (
      await request<{ assignment: Assignment }>(
        `/api/student/assignments/${encodeURIComponent(assignmentId)}/submit`,
        { method: 'POST', body: JSON.stringify(payload) },
        brand,
      )
    ).assignment,

  getQuizzes: async (brand?: BrandId) =>
    (await request<{ quizzes: QuizPublic[] }>('/api/student/quizzes', undefined, brand)).quizzes,

  submitQuizAttempt: async (
    quizId: string,
    answers: Record<string, number>,
    brand?: BrandId,
  ) =>
    (
      await request<{ result: QuizAttemptResult }>(
        `/api/student/quizzes/${encodeURIComponent(quizId)}/attempts`,
        { method: 'POST', body: JSON.stringify({ answers }) },
        brand,
      )
    ).result,

  getFees: (brand?: BrandId) =>
    request<FeeAccount>('/api/student/fees', undefined, brand),

  getCertificate: async (brand?: BrandId) =>
    (await request<{ certificate: Certificate }>('/api/student/certificates', undefined, brand))
      .certificate,
};

/* ------------------------------------------------------------------ *
 * Auth surface (session cookie lives here too)
 * ------------------------------------------------------------------ */

export const authApi = {
  login: async (email: string, password: string, brand?: BrandId) =>
    request<MeResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...(brand ? { brand } : {}) }),
    }),

  logout: async () =>
    request<{ status: string }>('/api/auth/logout', { method: 'POST' }),

  me: async (brand?: BrandId) =>
    request<MeResponse>('/api/auth/me', undefined, brand),
};
