// College service for handling college-related API calls

interface College {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  representative_name?: string;
  representative_mobile?: string;
  students?: number;
  establishedYear: string;
  address: string;
  departments: number;
  totalReceived?: number;
  status: string;
  submitDate?: string;
  submitted_at?: string;
  reason?: string;
  totalStudents?: number;
  documentsSubmitted?: string[];
  documentsPending?: string[];
}

interface CollegeResponse {
  success: boolean;
  data?: College[];
  error?: string;
  total?: number;
  limit?: number;
  offset?: number;
}

// Get the correct API base URL for development and production
const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost/lifeboat';
  }
  return 'http://localhost/lifeboat';
};

// Get JWT token from localStorage
const getAuthToken = (): string | null => {
  try {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      const parsedAuth = JSON.parse(adminAuth);
      return parsedAuth.access_token || parsedAuth.token || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Get headers with authentication
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Fetch verified colleges (status=1)
export const getVerifiedColleges = async (
  limit: number = 10,
  offset: number = 0
): Promise<CollegeResponse> => {
  try {
    console.log('Fetching verified colleges...');
    
    const apiUrl = `${getApiBaseUrl()}/Admin/get_all_colleges?status=1&limit=${limit}&offset=${offset}`;
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('Verified colleges response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Verified colleges error response:', errorData);
      
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
    console.log('Verified colleges response:', data);
    
    return {
      success: true,
      data: data.data || data.colleges || [],
      total: data.total || data.count || 0,
      limit,
      offset
    };
  } catch (error) {
    console.error('Failed to fetch verified colleges:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch verified colleges'
    };
  }
};

// Fetch unverified colleges (status=0)
export const getUnverifiedColleges = async (
  limit: number = 10,
  offset: number = 0
): Promise<CollegeResponse> => {
  try {
    console.log('Fetching unverified colleges...');
    
    const apiUrl = `${getApiBaseUrl()}/Admin/get_all_colleges?status=0&limit=${limit}&offset=${offset}`;
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('Unverified colleges response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Unverified colleges error response:', errorData);
      
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
    console.log('Unverified colleges response:', data);
    
    return {
      success: true,
      data: data.data || data.colleges || [],
      total: data.total || data.count || 0,
      limit,
      offset
    };
  } catch (error) {
    console.error('Failed to fetch unverified colleges:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch unverified colleges'
    };
  }
};

// Approve a college
export const approveCollege = async (collegeId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Approving college:', collegeId);
    
    const apiUrl = `${getApiBaseUrl()}/Admin/approve_college`;
    console.log('API URL:', apiUrl);
    
    // Create FormData for key-value pair format
    const formData = new FormData();
    formData.append('collegeId', collegeId);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('College approval response:', data);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to approve college:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve college'
    };
  }
};

// Reject a college
export const rejectCollege = async (collegeId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Rejecting college:', collegeId);
    
    const apiUrl = `${getApiBaseUrl()}/Admin/reject_college`;
    console.log('API URL:', apiUrl);
    
    // Create FormData for key-value pair format
    const formData = new FormData();
    formData.append('collegeId', collegeId);
    if (reason) {
      formData.append('reason', reason);
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('College rejection response:', data);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to reject college:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject college'
    };
  }
};

// Update college status (verify/unverify)
export const updateCollegeStatus = async (collegeId: string, status: number): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Updating college status:', collegeId, 'to status:', status);
    
    const apiUrl = `${getApiBaseUrl()}/Admin/update_college_status`;
    console.log('API URL:', apiUrl);
    
    // Create FormData for the payload
    const formData = new FormData();
    formData.append('college_id', collegeId);
    formData.append('status', status.toString());
    
    console.log('Request payload:', { college_id: collegeId, status: status });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('College status update response:', data);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update college status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update college status'
    };
  }
};

// Delete a college
export const deleteCollege = async (collegeId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Deleting college:', collegeId);
    
    const apiUrl = `${getApiBaseUrl()}/Admin/deleteCollege/${collegeId}`;
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('College deletion response:', data);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete college:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete college'
    };
  }
};

export type { College, CollegeResponse }; 