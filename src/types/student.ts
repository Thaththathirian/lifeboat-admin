export enum StudentStatus {
  NEW_USER = 0,
  MOBILE_VERIFIED = 1,
  PROFILE_UPDATED = 2,
  PROFILE_APPROVED = 3,
  INTERVIEW_SCHEDULED = 4,
  DOCUMENT_UPLOADED = 5,
  WAITING_FOR_PAYMENT = 6,
  PAYMENT_COMPLETED = 7,
  PAYMENT_VERIFIED = 8,
  RECEIPT_VERIFIED = 9,
  CERTIFICATE_UPLOADED = 10,
  NEXT_SEMESTER = 11,
  ALUMNI = 12,
  BLOCKED = 13,
}

export interface Student {
  id: string;
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
}

export interface StudentsResponse {
  success: boolean;
  students: Student[];
  total: number;
  offset: number;
  limit: number;
  error?: string;
}

export interface StudentsRequest {
  offset: number;
  limit: number;
  status?: StudentStatus;
  search?: string;
} 