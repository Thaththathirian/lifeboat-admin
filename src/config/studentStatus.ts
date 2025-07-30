import { StudentStatus } from '../types/student';

// Student Status Constants
export const STUDENT_STATUS_NEW_USER = 0;
export const STUDENT_STATUS_PROFILE_UPDATE_PENDING = 1;
export const STUDENT_STATUS_PERSONAL_DOCUMENTS_PENDING = 2;
export const STUDENT_STATUS_PERSONAL_DOCUMENTS_SUBMITTED = 3;
export const STUDENT_STATUS_INTERVIEW_SCHEDULED = 4;
export const STUDENT_STATUS_ACADEMIC_DOCUMENTS_PENDING = 5;
export const STUDENT_STATUS_ACADEMIC_DOCUMENTS_SUBMITTED = 6;
export const STUDENT_STATUS_ELIGIBLE_FOR_SCHOLARSHIP = 7;
export const STUDENT_STATUS_PAYMENT_PENDING = 8;
export const STUDENT_STATUS_PAID = 9;
export const STUDENT_STATUS_PAYMENT_VERIFIED = 10;
export const STUDENT_STATUS_RECEIPT_DOCUMENTS_SUBMITTED = 11;
export const STUDENT_STATUS_ALUMNI = 12;
export const STUDENT_STATUS_BLOCKED = 13;

// Status Display Mappings
export const statusDisplayMap: Record<StudentStatus, string> = {
  [StudentStatus.NEW_USER]: "New User",
  [StudentStatus.PROFILE_UPDATE_PENDING]: "Profile Update Pending",
  [StudentStatus.PERSONAL_DOCUMENTS_PENDING]: "Personal Documents Pending",
  [StudentStatus.PERSONAL_DOCUMENTS_SUBMITTED]: "Personal Documents Submitted",
  [StudentStatus.INTERVIEW_SCHEDULED]: "Interview Scheduled",
  [StudentStatus.ACADEMIC_DOCUMENTS_PENDING]: "Academic Documents Pending",
  [StudentStatus.ACADEMIC_DOCUMENTS_SUBMITTED]: "Academic Documents Submitted",
  [StudentStatus.ELIGIBLE_FOR_SCHOLARSHIP]: "Eligible for Scholarship",
  [StudentStatus.PAYMENT_PENDING]: "Payment Pending",
  [StudentStatus.PAID]: "Paid",
  [StudentStatus.PAYMENT_VERIFIED]: "Payment Verified",
  [StudentStatus.RECEIPT_DOCUMENTS_SUBMITTED]: "Receipt Documents Submitted",
  [StudentStatus.ALUMNI]: "Alumni",
  [StudentStatus.BLOCKED]: "Blocked",
};

// Status Color Mappings
export const statusColorMap: Record<StudentStatus, string> = {
  [StudentStatus.NEW_USER]: 'bg-gray-100 text-gray-800',
  [StudentStatus.PROFILE_UPDATE_PENDING]: 'bg-blue-100 text-blue-800',
  [StudentStatus.PERSONAL_DOCUMENTS_PENDING]: 'bg-orange-100 text-orange-800',
  [StudentStatus.PERSONAL_DOCUMENTS_SUBMITTED]: 'bg-green-400 text-green-900',
  [StudentStatus.INTERVIEW_SCHEDULED]: 'bg-purple-100 text-purple-800',
  [StudentStatus.ACADEMIC_DOCUMENTS_PENDING]: 'bg-yellow-100 text-yellow-800',
  [StudentStatus.ACADEMIC_DOCUMENTS_SUBMITTED]: 'bg-green-400 text-green-900',
  [StudentStatus.ELIGIBLE_FOR_SCHOLARSHIP]: 'bg-blue-100 text-blue-800',
  [StudentStatus.PAYMENT_PENDING]: 'bg-yellow-100 text-yellow-800',
  [StudentStatus.PAID]: 'bg-green-400 text-green-900',
  [StudentStatus.PAYMENT_VERIFIED]: 'bg-emerald-100 text-emerald-800',
  [StudentStatus.RECEIPT_DOCUMENTS_SUBMITTED]: 'bg-green-400 text-green-900',
  [StudentStatus.ALUMNI]: 'bg-teal-100 text-teal-800',
  [StudentStatus.BLOCKED]: 'bg-red-100 text-red-800',
};

// Status Order for Workflow
export const statusOrder: StudentStatus[] = [
  StudentStatus.NEW_USER,
  StudentStatus.PROFILE_UPDATE_PENDING,
  StudentStatus.PERSONAL_DOCUMENTS_PENDING,
  StudentStatus.PERSONAL_DOCUMENTS_SUBMITTED,
  StudentStatus.INTERVIEW_SCHEDULED,
  StudentStatus.ACADEMIC_DOCUMENTS_PENDING,
  StudentStatus.ACADEMIC_DOCUMENTS_SUBMITTED,
  StudentStatus.ELIGIBLE_FOR_SCHOLARSHIP,
  StudentStatus.PAYMENT_PENDING,
  StudentStatus.PAID,
  StudentStatus.PAYMENT_VERIFIED,
  StudentStatus.RECEIPT_DOCUMENTS_SUBMITTED,
  StudentStatus.ALUMNI,
  StudentStatus.BLOCKED,
];

// API Status Mapping
export const statusApiMap: Record<StudentStatus, string> = {
  [StudentStatus.NEW_USER]: 'new_user',
  [StudentStatus.PROFILE_UPDATE_PENDING]: 'profile_update_pending',
  [StudentStatus.PERSONAL_DOCUMENTS_PENDING]: 'personal_documents_pending',
  [StudentStatus.PERSONAL_DOCUMENTS_SUBMITTED]: 'personal_documents_submitted',
  [StudentStatus.INTERVIEW_SCHEDULED]: 'interview_scheduled',
  [StudentStatus.ACADEMIC_DOCUMENTS_PENDING]: 'academic_documents_pending',
  [StudentStatus.ACADEMIC_DOCUMENTS_SUBMITTED]: 'academic_documents_submitted',
  [StudentStatus.ELIGIBLE_FOR_SCHOLARSHIP]: 'eligible_for_scholarship',
  [StudentStatus.PAYMENT_PENDING]: 'payment_pending',
  [StudentStatus.PAID]: 'paid',
  [StudentStatus.PAYMENT_VERIFIED]: 'payment_verified',
  [StudentStatus.RECEIPT_DOCUMENTS_SUBMITTED]: 'receipt_documents_submitted',
  [StudentStatus.ALUMNI]: 'alumni',
  [StudentStatus.BLOCKED]: 'blocked',
};

// Helper Functions
export const getStatusText = (status: StudentStatus): string => {
  return statusDisplayMap[status] || 'Unknown Status';
};

export const getStatusColor = (status: StudentStatus): string => {
  return statusColorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusApiKey = (status: StudentStatus): string => {
  return statusApiMap[status] || 'unknown';
};

export const getPreviousStatus = (currentStatus: StudentStatus): StudentStatus | null => {
  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex <= 0) return null;
  return statusOrder[currentIndex - 1];
};

export const getNextStatus = (currentStatus: StudentStatus): StudentStatus | null => {
  const currentIndex = statusOrder.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === statusOrder.length - 1) return null;
  return statusOrder[currentIndex + 1];
};

// Payment Allotment Specific Status Options
export const PAYMENT_ALLOTMENT_STATUS_OPTIONS = [
  StudentStatus.PAYMENT_PENDING,
  StudentStatus.ELIGIBLE_FOR_SCHOLARSHIP,
  StudentStatus.PAYMENT_VERIFIED,
] as const;

export type PaymentAllotmentStatusOption = typeof PAYMENT_ALLOTMENT_STATUS_OPTIONS[number]; 