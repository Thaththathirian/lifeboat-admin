// Student Status Constants
export enum StudentStatus {
  NEW_USER = 0,
  MOBILE_VERIFIED = 1,
  PROFILE_UPDATED = 2,
  PERSONAL_DOCUMENTS_PENDING = 3,
  PERSONAL_DOCUMENTS_SUBMITTED = 4,
  INTERVIEW_SCHEDULED = 5,
  ACADEMIC_DOCUMENTS_PENDING = 6,
  ACADEMIC_DOCUMENTS_SUBMITTED = 7,
  ELIGIBLE_FOR_SCHOLARSHIP = 8,
  PAYMENT_PENDING = 9,
  PAID = 10,
  RECEIPT_DOCUMENTS_SUBMITTED = 11,
  ALUMNI = 12,
  BLOCKED = 13
}

export interface Student {
  id: string | null; // Can be null for students who haven't passed interview/document verification
  name: string;
  email: string;
  mobile: string;
  college: string;
  status: StudentStatus;
  statusText: string;
  appliedDate: string;
  scholarship: number;
  interviewCompleted: boolean;
  documentsVerified: boolean;
  statusBar: string[];
  collegeFee?: number; // College fee for the student
  lastAllottedAmount?: number; // Last amount allotted to this student
}

export interface StudentsResponse {
  success: boolean;
  students: Student[];
  total: number;
  offset: number;
  limit: number;
  error?: string;
  status_counts?: Record<string, number>;
}

export interface StudentsRequest {
  offset: number;
  limit: number;
  status?: StudentStatus;
  search?: string;
}

// Payment Allotment Types
export interface Donor {
  id: string;
  name: string;
  amount: number;
  allocated: number;
  unallocated: number;
}

export interface PaymentAllotment {
  id: string;
  studentId: string;
  studentName: string;
  college: string;
  collegeFee: number;
  allottedAmount: number;
  status: 'pending' | 'paid';
  date: string;
  description?: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  college: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface PaymentMapping {
  id: string;
  donorId: string;
  donorName: string;
  transactionId: string;
  studentId: string;
  studentName: string;
  college: string;
  amount: number;
  date: string;
} 