// Student Status Constants
export enum StudentStatus {
  NEW_USER = 0,
  PROFILE_UPDATE_PENDING = 1,
  PERSONAL_DOCUMENTS_PENDING = 2,
  PERSONAL_DOCUMENTS_SUBMITTED = 3,
  INTERVIEW_SCHEDULED = 4,
  ACADEMIC_DOCUMENTS_PENDING = 5,
  ACADEMIC_DOCUMENTS_SUBMITTED = 6,
  ELIGIBLE_FOR_SCHOLARSHIP = 7,
  PAYMENT_PENDING = 8,
  PAID = 9,
  PAYMENT_VERIFIED = 10,
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