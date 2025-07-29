import { Student, StudentsResponse, StudentsRequest, StudentStatus } from '@/types/student';

// Get the correct API base URL for development and production
const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost/lifeboat';
  }
  return 'http://localhost/lifeboat';
};

// Map status enum to display text
export const getStatusText = (status: StudentStatus): string => {
  const statusMap: Record<StudentStatus, string> = {
    [StudentStatus.NEW_USER]: 'New User',
    [StudentStatus.MOBILE_VERIFIED]: 'Mobile Verified',
    [StudentStatus.PROFILE_UPDATED]: 'Profile Updated',
    [StudentStatus.PROFILE_APPROVED]: 'Profile Approved',
    [StudentStatus.INTERVIEW_SCHEDULED]: 'Interview Scheduled',
    [StudentStatus.DOCUMENT_UPLOADED]: 'Document Uploaded',
    [StudentStatus.WAITING_FOR_PAYMENT]: 'Waiting for Payment',
    [StudentStatus.PAYMENT_COMPLETED]: 'Payment Completed',
    [StudentStatus.PAYMENT_VERIFIED]: 'Payment Verified',
    [StudentStatus.RECEIPT_VERIFIED]: 'Receipt Verified',
    [StudentStatus.CERTIFICATE_UPLOADED]: 'Certificate Uploaded',
    [StudentStatus.NEXT_SEMESTER]: 'Next Semester',
    [StudentStatus.ALUMNI]: 'Alumni',
    [StudentStatus.BLOCKED]: 'Blocked',
  };
  return statusMap[status] || 'Unknown Status';
};

// Get status color classes
export const getStatusColor = (status: StudentStatus): string => {
  const colorMap: Record<StudentStatus, string> = {
    [StudentStatus.NEW_USER]: 'bg-blue-100 text-blue-800',
    [StudentStatus.MOBILE_VERIFIED]: 'bg-cyan-100 text-cyan-800',
    [StudentStatus.PROFILE_UPDATED]: 'bg-gray-100 text-gray-800',
    [StudentStatus.PROFILE_APPROVED]: 'bg-green-100 text-green-800',
    [StudentStatus.INTERVIEW_SCHEDULED]: 'bg-purple-100 text-purple-800',
    [StudentStatus.DOCUMENT_UPLOADED]: 'bg-yellow-100 text-yellow-800',
    [StudentStatus.WAITING_FOR_PAYMENT]: 'bg-orange-100 text-orange-800',
    [StudentStatus.PAYMENT_COMPLETED]: 'bg-green-200 text-green-900',
    [StudentStatus.PAYMENT_VERIFIED]: 'bg-green-300 text-green-900',
    [StudentStatus.RECEIPT_VERIFIED]: 'bg-green-400 text-green-900',
    [StudentStatus.CERTIFICATE_UPLOADED]: 'bg-indigo-100 text-indigo-800',
    [StudentStatus.NEXT_SEMESTER]: 'bg-pink-100 text-pink-800',
    [StudentStatus.ALUMNI]: 'bg-teal-100 text-teal-800',
    [StudentStatus.BLOCKED]: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-200 text-gray-700';
};

// Get authentication token from localStorage (same as college service)
const getAuthToken = (): string | null => {
  try {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      const parsedAuth = JSON.parse(adminAuth);
      const token = parsedAuth.access_token || parsedAuth.token || null;
      console.log('🔍 getAuthToken called, token found:', !!token);
      if (token) {
        console.log('🔍 Token length:', token.length);
        console.log('🔍 Token preview:', token.substring(0, 20) + '...');
      }
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Fetch students from API
export const fetchStudents = async (params: StudentsRequest): Promise<StudentsResponse> => {
  try {
    console.log('🚀 fetchStudents called with params:', params);
    
    const apiUrl = `${getApiBaseUrl()}/Admin/get_all_students`;
    console.log('🌐 API Base URL:', apiUrl);
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      offset: params.offset.toString(),
      limit: params.limit.toString(),
    });

    if (params.status !== undefined && params.status !== null) {
      queryParams.append('status', params.status.toString());
      console.log('🔍 Adding status parameter:', params.status);
    } else {
      console.log('🔍 No status parameter (null or undefined)');
    }

    if (params.search) {
      queryParams.append('search', params.search);
    }

    const url = `${apiUrl}?${queryParams.toString()}`;
    console.log('🔗 Full URL:', url);

    // Get authentication token
    const authToken = getAuthToken();
    console.log('🔑 Auth token retrieved:', !!authToken);
    
    // For development, if no auth token, try without it
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      console.log('🔑 Authorization header set:', `Bearer ${authToken.substring(0, 20)}...`);
    } else {
      console.warn('⚠️ No auth token found, trying without authentication');
    }

    console.log('📤 Making fetch request...');
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      
      let errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
      
      if (response.status === 401) {
        errorMessage = 'Unauthorized - Please login again';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden - You don\'t have permission to access this resource';
      } else if (response.status === 404) {
        errorMessage = 'Service not found - The requested service is currently unavailable';
      } else if (response.status === 500) {
        errorMessage = 'Server error - We\'re experiencing technical difficulties';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Students API response:', data);
    console.log('📊 Raw data structure:', {
      hasStudents: !!data.students,
      hasData: !!data.data,
      studentsLength: data.students?.length || 0,
      dataLength: data.data?.length || 0,
      keys: Object.keys(data)
    });

    // Transform the API response to match our interface
    // The students are nested under data.data.students according to the API response
    const studentsArray = data.data?.students || data.students || data.data || [];
    console.log('🔍 Students array from API:', studentsArray);
    console.log('🔍 Students array type:', typeof studentsArray);
    console.log('🔍 Students array length:', studentsArray.length);
    
    const transformedStudents: Student[] = studentsArray.map((student: any) => {
      console.log('🔍 Processing student:', student);
      // Handle null/undefined values safely
      const studentId = student.id || student.student_id || null;
      
      // Handle name from first_name and last_name fields
      let studentName = '';
      if (student.first_name && student.last_name) {
        studentName = `${student.first_name} ${student.last_name}`.trim();
      } else if (student.first_name) {
        studentName = student.first_name;
      } else if (student.last_name) {
        studentName = student.last_name;
      } else {
        studentName = student.name || student.full_name || '';
      }
      
      const studentEmail = student.email || '';
      const studentMobile = student.mobile || student.phone || '';
      const studentCollege = student.college || student.college_name || '';
      // Convert string status to StudentStatus enum
      const studentStatus = typeof student.status === 'string' ? parseInt(student.status) as StudentStatus : (student.status || StudentStatus.NEW_USER);
      const studentScholarship = student.scholarship || student.scholarship_amount || 0;
      const studentAppliedDate = student.applied_date || student.created_at || '';
      const studentInterviewCompleted = student.interview_completed || false;
      const studentDocumentsVerified = student.documents_verified || false;
      const studentStatusBar = student.status_bar || [];

      const transformedStudent = {
        id: studentId,
        name: studentName,
        email: studentEmail,
        mobile: studentMobile,
        college: studentCollege,
        status: studentStatus,
        statusText: getStatusText(studentStatus),
        appliedDate: studentAppliedDate,
        scholarship: studentScholarship,
        interviewCompleted: studentInterviewCompleted,
        documentsVerified: studentDocumentsVerified,
        statusBar: studentStatusBar,
      };
      
      console.log('✅ Transformed student:', transformedStudent);
      return transformedStudent;
    });

    // If no data returned, log the response for debugging
    if (transformedStudents.length === 0) {
      console.log('⚠️ No students returned from API for status:', params.status);
      console.log('📊 API Response keys:', Object.keys(data));
      console.log('📊 API Response data:', data);
    }

    console.log('✅ Transformed students count:', transformedStudents.length);
    console.log('📊 Response metadata:', {
      total: data.total,
      count: data.count,
      success: data.success,
      message: data.message
    });

    return {
      success: true,
      students: transformedStudents,
      total: data.total || data.count || transformedStudents.length,
      offset: params.offset,
      limit: params.limit,
      status_counts: data.data?.status_counts || data.status_counts,
    };
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return {
      success: false,
      students: [],
      total: 0,
      offset: params.offset,
      limit: params.limit,
      error: error instanceof Error ? error.message : 'Failed to fetch students',
    };
  }
};

// Update student status
export const updateStudentStatus = async (studentId: string, newStatus: StudentStatus): Promise<{ success: boolean; error?: string }> => {
  try {
    const apiUrl = `${getApiBaseUrl()}/Admin/update_student_status`;
    
    // Get authentication token
    const authToken = getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else {
      console.warn('⚠️ No auth token found for status update');
    }
    
    // Create FormData for key-value pair format
    const formData = new FormData();
    formData.append('student_id', studentId);
    formData.append('status', newStatus.toString());
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Status update response:', data);

    return { success: true };
  } catch (error) {
    console.error('Failed to update student status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update student status',
    };
  }
};

// Block student
export const blockStudent = async (studentId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const apiUrl = `${getApiBaseUrl()}/Admin/block_student`;
    
    // Get authentication token
    const authToken = getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else {
      console.warn('⚠️ No auth token found for block student');
    }
    
    // Create FormData for key-value pair format
    const formData = new FormData();
    formData.append('student_id', studentId);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Block student response:', data);

    return { success: true };
  } catch (error) {
    console.error('Failed to block student:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to block student',
    };
  }
}; 